/**
 * Signing Service
 * Handles business logic for document signing
 */

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { getSupabase } from '../supabase';
import { docusealClient, CreateSubmissionOptions } from './docuseal';
import { auditService, AuditEventType } from './audit';

// Types
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  template_type: 'pdf' | 'online_form';
  file_path: string | null;
  docuseal_template_id: string | null;
  form_schema: Record<string, unknown> | null;
  is_active: boolean;
  requires_witness: boolean;
  expiry_months: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface SigningRequest {
  id: string;
  template_id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_phone: string | null;
  recipient_user_id: string | null;
  access_token: string;
  access_method: 'email_link' | 'portal';
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined' | 'expired' | 'voided';
  docuseal_submission_id: string | null;
  expires_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  sent_by: string | null;
  reminder_count: number;
  last_reminder_at: string | null;
  voided_at: string | null;
  voided_by: string | null;
  void_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignedDocument {
  id: string;
  signing_request_id: string | null;
  template_id: string | null;
  signer_user_id: string | null;
  signer_email: string;
  signer_name: string;
  signed_document_path: string;
  original_document_path: string | null;
  completion_certificate_path: string | null;
  certificate_data: Record<string, unknown> | null;
  signed_at: string;
  signature_ip: string | null;
  signature_user_agent: string | null;
  document_hash: string | null;
  valid_until: string | null;
  created_at: string;
}

export interface CreateSigningRequestOptions {
  templateId: string;
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  recipientUserId?: string;
  accessMethod: 'email_link' | 'portal';
  expiryDays?: number;
  sendEmail?: boolean;
  sentById: string;
}

export interface ClientInfo {
  ip: string;
  userAgent: string;
  fingerprint?: string;
}

class SigningService {
  private supabase = getSupabase();

  // =====================
  // TEMPLATE OPERATIONS
  // =====================

  /**
   * Get all active document templates
   */
  async getTemplates(options?: {
    category?: string;
    includeInactive?: boolean
  }): Promise<DocumentTemplate[]> {
    let query = this.supabase
      .from('document_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!options?.includeInactive) {
      query = query.eq('is_active', true);
    }

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return data as DocumentTemplate[];
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    const { data, error } = await this.supabase
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return data as DocumentTemplate;
  }

  /**
   * Create a new document template
   */
  async createTemplate(template: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const { data, error } = await this.supabase
      .from('document_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return data as DocumentTemplate;
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<DocumentTemplate>
  ): Promise<DocumentTemplate> {
    const { data, error } = await this.supabase
      .from('document_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    return data as DocumentTemplate;
  }

  /**
   * Delete (deactivate) a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('document_templates')
      .update({ is_active: false })
      .eq('id', templateId);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  // =====================
  // SIGNING REQUEST OPERATIONS
  // =====================

  /**
   * Create a new signing request
   */
  async createSigningRequest(
    options: CreateSigningRequestOptions,
    clientInfo?: ClientInfo
  ): Promise<SigningRequest> {
    // Generate secure access token
    const accessToken = this.generateSecureToken();

    // Calculate expiry date
    const expiresAt = options.expiryDays
      ? new Date(Date.now() + options.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create the signing request in database
    const { data, error } = await this.supabase
      .from('signing_requests')
      .insert({
        template_id: options.templateId,
        recipient_email: options.recipientEmail,
        recipient_name: options.recipientName,
        recipient_phone: options.recipientPhone,
        recipient_user_id: options.recipientUserId,
        access_token: accessToken,
        access_method: options.accessMethod,
        expires_at: expiresAt,
        sent_by: options.sentById,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create signing request: ${error.message}`);
    }

    const signingRequest = data as SigningRequest;

    // Log audit event
    await auditService.log({
      signingRequestId: signingRequest.id,
      eventType: 'request_created',
      clientInfo,
      metadata: {
        template_id: options.templateId,
        recipient_email: options.recipientEmail,
        access_method: options.accessMethod,
      },
    });

    // If DocuSeal is configured and this is a PDF template, create submission
    if (docusealClient.isConfigured()) {
      const template = await this.getTemplate(options.templateId);
      if (template?.docuseal_template_id) {
        try {
          const submissionOptions: CreateSubmissionOptions = {
            templateId: parseInt(template.docuseal_template_id),
            submitters: [
              {
                email: options.recipientEmail,
                name: options.recipientName,
              },
            ],
            sendEmail: options.sendEmail ?? false,
            expireAt: expiresAt || undefined,
          };

          const submission = await docusealClient.createSubmission(submissionOptions);

          // Update signing request with DocuSeal submission ID
          await this.supabase
            .from('signing_requests')
            .update({ docuseal_submission_id: submission.id.toString() })
            .eq('id', signingRequest.id);

          signingRequest.docuseal_submission_id = submission.id.toString();
        } catch (err) {
          console.error('Failed to create DocuSeal submission:', err);
          // Continue without DocuSeal - the signing can still work locally
        }
      }
    }

    return signingRequest;
  }

  /**
   * Get signing request by ID
   */
  async getSigningRequest(requestId: string): Promise<SigningRequest | null> {
    const { data, error } = await this.supabase
      .from('signing_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch signing request: ${error.message}`);
    }

    return data as SigningRequest;
  }

  /**
   * Get signing request by access token (for email link signing)
   */
  async getSigningRequestByToken(token: string): Promise<SigningRequest | null> {
    const { data, error } = await this.supabase
      .from('signing_requests')
      .select('*')
      .eq('access_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch signing request: ${error.message}`);
    }

    return data as SigningRequest;
  }

  /**
   * Get all signing requests (with optional filters)
   */
  async getSigningRequests(options?: {
    recipientUserId?: string;
    status?: SigningRequest['status'];
    sentById?: string;
    limit?: number;
    offset?: number;
  }): Promise<SigningRequest[]> {
    let query = this.supabase
      .from('signing_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.recipientUserId) {
      query = query.eq('recipient_user_id', options.recipientUserId);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.sentById) {
      query = query.eq('sent_by', options.sentById);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch signing requests: ${error.message}`);
    }

    return data as SigningRequest[];
  }

  /**
   * Get pending signing requests for a user (for client dashboard)
   */
  async getPendingRequestsForUser(userId: string): Promise<SigningRequest[]> {
    return this.getSigningRequests({
      recipientUserId: userId,
      status: 'pending',
    });
  }

  /**
   * Update signing request status
   */
  async updateRequestStatus(
    requestId: string,
    status: SigningRequest['status'],
    clientInfo?: ClientInfo
  ): Promise<SigningRequest> {
    const updates: Partial<SigningRequest> = { status };

    // Set timestamp based on status
    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
    } else if (status === 'viewed') {
      updates.viewed_at = new Date().toISOString();
    } else if (status === 'signed') {
      updates.signed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('signing_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update signing request: ${error.message}`);
    }

    // Log audit event
    const eventTypeMap: Record<string, AuditEventType> = {
      sent: 'email_sent',
      viewed: 'document_viewed',
      signed: 'completed',
      declined: 'declined',
      expired: 'expired',
      voided: 'voided',
    };

    const eventType = eventTypeMap[status];
    if (eventType) {
      await auditService.log({
        signingRequestId: requestId,
        eventType,
        clientInfo,
      });
    }

    return data as SigningRequest;
  }

  /**
   * Mark a signing request as viewed
   */
  async markAsViewed(requestId: string, clientInfo?: ClientInfo): Promise<void> {
    const request = await this.getSigningRequest(requestId);
    if (!request) {
      throw new Error('Signing request not found');
    }

    // Only update if not already viewed or signed
    if (request.status === 'pending' || request.status === 'sent') {
      await this.updateRequestStatus(requestId, 'viewed', clientInfo);
    }

    // Log link accessed event
    await auditService.log({
      signingRequestId: requestId,
      eventType: 'link_accessed',
      clientInfo,
    });
  }

  /**
   * Void (cancel) a signing request
   */
  async voidRequest(
    requestId: string,
    voidedBy: string,
    reason: string
  ): Promise<SigningRequest> {
    const { data, error } = await this.supabase
      .from('signing_requests')
      .update({
        status: 'voided',
        voided_at: new Date().toISOString(),
        voided_by: voidedBy,
        void_reason: reason,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to void signing request: ${error.message}`);
    }

    // Log audit event
    await auditService.log({
      signingRequestId: requestId,
      eventType: 'voided',
      metadata: { voided_by: voidedBy, reason },
    });

    return data as SigningRequest;
  }

  /**
   * Send reminder for a signing request
   */
  async sendReminder(requestId: string): Promise<void> {
    const request = await this.getSigningRequest(requestId);
    if (!request) {
      throw new Error('Signing request not found');
    }

    // Update reminder count
    await this.supabase
      .from('signing_requests')
      .update({
        reminder_count: request.reminder_count + 1,
        last_reminder_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    // Log audit event
    await auditService.log({
      signingRequestId: requestId,
      eventType: 'reminder_sent',
      metadata: { reminder_count: request.reminder_count + 1 },
    });

    // TODO: Send actual email reminder using Resend
  }

  // =====================
  // SIGNED DOCUMENT OPERATIONS
  // =====================

  /**
   * Complete a signing request
   */
  async completeSigningRequest(
    requestId: string,
    signedDocumentPath: string,
    clientInfo: ClientInfo,
    signatureData?: Record<string, unknown>
  ): Promise<SignedDocument> {
    const request = await this.getSigningRequest(requestId);
    if (!request) {
      throw new Error('Signing request not found');
    }

    const template = await this.getTemplate(request.template_id);

    // Calculate document hash
    const documentHash = this.generateDocumentHash(signedDocumentPath);

    // Calculate validity period
    let validUntil: string | null = null;
    if (template?.expiry_months) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + template.expiry_months);
      validUntil = expiryDate.toISOString();
    }

    // Create signed document record
    const { data, error } = await this.supabase
      .from('signed_documents')
      .insert({
        signing_request_id: requestId,
        template_id: request.template_id,
        signer_user_id: request.recipient_user_id,
        signer_email: request.recipient_email,
        signer_name: request.recipient_name,
        signed_document_path: signedDocumentPath,
        signed_at: new Date().toISOString(),
        signature_ip: clientInfo.ip,
        signature_user_agent: clientInfo.userAgent,
        document_hash: documentHash,
        valid_until: validUntil,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create signed document: ${error.message}`);
    }

    // Update signing request status
    await this.updateRequestStatus(requestId, 'signed', clientInfo);

    // Log signature applied event
    await auditService.log({
      signingRequestId: requestId,
      eventType: 'signature_applied',
      clientInfo,
      signatureData: signatureData || {},
      metadata: {
        document_hash: documentHash,
        signed_document_id: data.id,
      },
    });

    return data as SignedDocument;
  }

  /**
   * Get signed documents
   */
  async getSignedDocuments(options?: {
    signerUserId?: string;
    templateId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SignedDocument[]> {
    let query = this.supabase
      .from('signed_documents')
      .select('*')
      .order('signed_at', { ascending: false });

    if (options?.signerUserId) {
      query = query.eq('signer_user_id', options.signerUserId);
    }

    if (options?.templateId) {
      query = query.eq('template_id', options.templateId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch signed documents: ${error.message}`);
    }

    return data as SignedDocument[];
  }

  /**
   * Get a single signed document
   */
  async getSignedDocument(documentId: string): Promise<SignedDocument | null> {
    const { data, error } = await this.supabase
      .from('signed_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch signed document: ${error.message}`);
    }

    return data as SignedDocument;
  }

  // =====================
  // UTILITY METHODS
  // =====================

  /**
   * Generate a cryptographically secure token
   */
  private generateSecureToken(): string {
    return uuidv4() + '-' + uuidv4();
  }

  /**
   * Generate SHA-256 hash for document integrity
   */
  private generateDocumentHash(content: string): string {
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * Generate signing link URL
   */
  generateSigningLink(accessToken: string): string {
    const baseUrl = process.env.SIGNING_LINK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    return `${baseUrl}/sign/${accessToken}`;
  }

  /**
   * Check if a signing request is expired
   */
  isRequestExpired(request: SigningRequest): boolean {
    if (!request.expires_at) return false;
    return new Date(request.expires_at) < new Date();
  }

  /**
   * Check if a signed document is still valid
   */
  isDocumentValid(document: SignedDocument): boolean {
    if (!document.valid_until) return true;
    return new Date(document.valid_until) > new Date();
  }
}

// Export singleton instance
export const signingService = new SigningService();

// Export class for testing
export { SigningService };
