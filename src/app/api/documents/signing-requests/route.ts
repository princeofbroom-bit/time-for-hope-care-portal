import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Helper to create authenticated Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// GET /api/documents/signing-requests - List signing requests
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const recipientUserId = searchParams.get('recipient_user_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userRole = session.user.user_metadata?.role;

    // Build query
    let query = supabase
      .from('signing_requests')
      .select(`
        *,
        document_templates (
          id,
          name,
          description,
          category
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // If not admin, only show user's own requests
    if (userRole !== 'admin') {
      query = query.eq('recipient_user_id', session.user.id);
    } else if (recipientUserId) {
      query = query.eq('recipient_user_id', recipientUserId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching signing requests:', error);
      return NextResponse.json({ error: 'Failed to fetch signing requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: data });
  } catch (error) {
    console.error('Error in GET /api/documents/signing-requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/signing-requests - Create a new signing request
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = session.user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const {
      template_id,
      recipient_email,
      recipient_name,
      recipient_phone,
      recipient_user_id,
      access_method = 'email_link',
      expiry_days = 30,
    } = body;

    // Validate required fields
    if (!template_id || !recipient_email || !recipient_name) {
      return NextResponse.json(
        { error: 'template_id, recipient_email, and recipient_name are required' },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('document_templates')
      .select('id, name')
      .eq('id', template_id)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found or inactive' }, { status: 404 });
    }

    // Generate secure access token
    const accessToken = `${uuidv4()}-${uuidv4()}`;

    // Calculate expiry date
    const expiresAt = expiry_days
      ? new Date(Date.now() + expiry_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create signing request
    const { data, error } = await supabase
      .from('signing_requests')
      .insert({
        template_id,
        recipient_email,
        recipient_name,
        recipient_phone,
        recipient_user_id,
        access_token: accessToken,
        access_method,
        expires_at: expiresAt,
        sent_by: session.user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating signing request:', error);
      return NextResponse.json({ error: 'Failed to create signing request' }, { status: 500 });
    }

    // Log audit event
    await supabase.from('signing_audit_log').insert({
      signing_request_id: data.id,
      event_type: 'request_created',
      metadata: {
        template_id,
        recipient_email,
        access_method,
        created_by: session.user.id,
      },
    });

    // Generate signing link
    const baseUrl = process.env.SIGNING_LINK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const signingLink = `${baseUrl}/sign/${accessToken}`;

    return NextResponse.json(
      {
        request: data,
        signing_link: signingLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/documents/signing-requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
