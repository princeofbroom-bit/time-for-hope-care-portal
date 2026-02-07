import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role for public routes
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Helper to extract client info from request
function getClientInfo(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ip, userAgent };
}

// GET /api/documents/sign/[token] - Get document for signing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getServiceSupabase();
    const clientInfo = getClientInfo(request);

    // Find signing request by token
    const { data: signingRequest, error } = await supabase
      .from('signing_requests')
      .select(`
        *,
        document_templates (
          id,
          name,
          description,
          category,
          template_type,
          file_path,
          form_schema
        )
      `)
      .eq('access_token', token)
      .single();

    if (error || !signingRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired signing link' },
        { status: 404 }
      );
    }

    // Check if already signed
    if (signingRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'This document has already been signed', status: 'signed' },
        { status: 400 }
      );
    }

    // Check if expired
    if (signingRequest.expires_at && new Date(signingRequest.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('signing_requests')
        .update({ status: 'expired' })
        .eq('id', signingRequest.id);

      return NextResponse.json(
        { error: 'This signing link has expired', status: 'expired' },
        { status: 400 }
      );
    }

    // Check if voided
    if (signingRequest.status === 'voided') {
      return NextResponse.json(
        { error: 'This signing request has been cancelled', status: 'voided' },
        { status: 400 }
      );
    }

    // Log access event
    await supabase.from('signing_audit_log').insert({
      signing_request_id: signingRequest.id,
      event_type: 'link_accessed',
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
    });

    // Update status to viewed if pending/sent
    if (signingRequest.status === 'pending' || signingRequest.status === 'sent') {
      await supabase
        .from('signing_requests')
        .update({
          status: 'viewed',
          viewed_at: new Date().toISOString(),
        })
        .eq('id', signingRequest.id);

      // Log view event
      await supabase.from('signing_audit_log').insert({
        signing_request_id: signingRequest.id,
        event_type: 'document_viewed',
        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent,
      });
    }

    // Return signing request data (without sensitive fields)
    return NextResponse.json({
      request: {
        id: signingRequest.id,
        recipient_name: signingRequest.recipient_name,
        recipient_email: signingRequest.recipient_email,
        status: signingRequest.status,
        expires_at: signingRequest.expires_at,
        template: signingRequest.document_templates,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/documents/sign/[token]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/sign/[token] - Submit signature
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = getServiceSupabase();
    const clientInfo = getClientInfo(request);

    // Parse request body
    const body = await request.json();
    const { signature, signature_type = 'drawn' } = body;

    if (!signature) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
    }

    // Find signing request by token
    const { data: signingRequest, error } = await supabase
      .from('signing_requests')
      .select(`
        *,
        document_templates (
          id,
          name,
          expiry_months
        )
      `)
      .eq('access_token', token)
      .single();

    if (error || !signingRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired signing link' },
        { status: 404 }
      );
    }

    // Check if already signed
    if (signingRequest.status === 'signed') {
      return NextResponse.json(
        { error: 'This document has already been signed' },
        { status: 400 }
      );
    }

    // Check if expired
    if (signingRequest.expires_at && new Date(signingRequest.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This signing link has expired' },
        { status: 400 }
      );
    }

    // Check if voided
    if (signingRequest.status === 'voided') {
      return NextResponse.json(
        { error: 'This signing request has been cancelled' },
        { status: 400 }
      );
    }

    const signedAt = new Date().toISOString();

    // Calculate valid_until based on template expiry_months
    let validUntil: string | null = null;
    if (signingRequest.document_templates?.expiry_months) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + signingRequest.document_templates.expiry_months);
      validUntil = expiryDate.toISOString();
    }

    // Generate a document hash (simplified - in production, hash the actual signed PDF)
    const documentHash = Buffer.from(
      `${signingRequest.id}-${signedAt}-${clientInfo.ip}`
    ).toString('base64');

    // For now, store signature as base64 - in production, save to storage
    const signedDocumentPath = `signed/${new Date().getFullYear()}/${signingRequest.id}_signed.pdf`;

    // Create signed document record
    const { data: signedDoc, error: signedDocError } = await supabase
      .from('signed_documents')
      .insert({
        signing_request_id: signingRequest.id,
        template_id: signingRequest.template_id,
        signer_user_id: signingRequest.recipient_user_id,
        signer_email: signingRequest.recipient_email,
        signer_name: signingRequest.recipient_name,
        signed_document_path: signedDocumentPath,
        signed_at: signedAt,
        signature_ip: clientInfo.ip,
        signature_user_agent: clientInfo.userAgent,
        document_hash: documentHash,
        valid_until: validUntil,
        certificate_data: {
          signed_at: signedAt,
          signer_name: signingRequest.recipient_name,
          signer_email: signingRequest.recipient_email,
          ip_address: clientInfo.ip,
          document_name: signingRequest.document_templates?.name,
          document_hash: documentHash,
        },
      })
      .select()
      .single();

    if (signedDocError) {
      console.error('Error creating signed document:', signedDocError);
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    // Update signing request status
    await supabase
      .from('signing_requests')
      .update({
        status: 'signed',
        signed_at: signedAt,
      })
      .eq('id', signingRequest.id);

    // Log signature applied event
    await supabase.from('signing_audit_log').insert({
      signing_request_id: signingRequest.id,
      event_type: 'signature_applied',
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      signature_data: {
        type: signature_type,
        hash: documentHash,
      },
    });

    // Log completed event
    await supabase.from('signing_audit_log').insert({
      signing_request_id: signingRequest.id,
      event_type: 'completed',
      ip_address: clientInfo.ip,
      user_agent: clientInfo.userAgent,
      metadata: {
        signed_document_id: signedDoc.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Document signed successfully',
      signed_document: {
        id: signedDoc.id,
        signed_at: signedAt,
        valid_until: validUntil,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/documents/sign/[token]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
