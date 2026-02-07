/**
 * DocuSeal API Client
 * Handles communication with self-hosted DocuSeal instance
 */

// Types for DocuSeal API responses
export interface DocuSealTemplate {
  id: number;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
  fields: DocuSealField[];
}

export interface DocuSealField {
  name: string;
  type: 'signature' | 'initials' | 'text' | 'date' | 'checkbox';
  required: boolean;
}

export interface DocuSealSubmission {
  id: number;
  template_id: number;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  submitters: DocuSealSubmitter[];
  documents: DocuSealDocument[];
}

export interface DocuSealSubmitter {
  id: number;
  email: string;
  name?: string;
  status: 'pending' | 'opened' | 'completed';
  completed_at?: string;
  opened_at?: string;
  sent_at?: string;
  values: Record<string, unknown>;
}

export interface DocuSealDocument {
  name: string;
  url: string;
}

export interface CreateSubmissionOptions {
  templateId: number;
  submitters: {
    email: string;
    name?: string;
    role?: string;
    fields?: Array<{
      name: string;
      default_value?: string;
      readonly?: boolean;
    }>;
  }[];
  sendEmail?: boolean;
  messageSubject?: string;
  messageBody?: string;
  expireAt?: string;
}

export interface CreateTemplateFromPdfOptions {
  name: string;
  documentUrl?: string;
  documentBase64?: string;
  fields?: Array<{
    name: string;
    type: 'signature' | 'initials' | 'text' | 'date' | 'checkbox';
    role?: string;
    required?: boolean;
    page?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
}

class DocuSealClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.DOCUSEAL_API_URL || '';
    this.apiKey = process.env.DOCUSEAL_API_KEY || '';

    if (!this.baseUrl || !this.apiKey) {
      console.warn('DocuSeal API URL or Key not configured. Document signing features will be limited.');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Auth-Token': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DocuSeal API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Check if DocuSeal is configured and available
   */
  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  /**
   * Test connection to DocuSeal
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTemplates();
      return true;
    } catch {
      return false;
    }
  }

  // =====================
  // TEMPLATE OPERATIONS
  // =====================

  /**
   * Get all templates
   */
  async getTemplates(): Promise<DocuSealTemplate[]> {
    return this.request<DocuSealTemplate[]>('/templates');
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: number): Promise<DocuSealTemplate> {
    return this.request<DocuSealTemplate>(`/templates/${templateId}`);
  }

  /**
   * Create a template from a PDF file
   */
  async createTemplateFromPdf(
    options: CreateTemplateFromPdfOptions
  ): Promise<DocuSealTemplate> {
    const body: Record<string, unknown> = {
      name: options.name,
    };

    if (options.documentUrl) {
      body.document_url = options.documentUrl;
    } else if (options.documentBase64) {
      body.document = options.documentBase64;
    }

    if (options.fields) {
      body.fields = options.fields;
    }

    return this.request<DocuSealTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: number,
    updates: Partial<CreateTemplateFromPdfOptions>
  ): Promise<DocuSealTemplate> {
    return this.request<DocuSealTemplate>(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: number): Promise<void> {
    await this.request(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Clone a template
   */
  async cloneTemplate(templateId: number, newName: string): Promise<DocuSealTemplate> {
    return this.request<DocuSealTemplate>(`/templates/${templateId}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  // =====================
  // SUBMISSION OPERATIONS
  // =====================

  /**
   * Create a new submission (signing request)
   */
  async createSubmission(
    options: CreateSubmissionOptions
  ): Promise<DocuSealSubmission> {
    const body: Record<string, unknown> = {
      template_id: options.templateId,
      submitters: options.submitters,
      send_email: options.sendEmail ?? true,
    };

    if (options.messageSubject) {
      body.message = {
        subject: options.messageSubject,
        body: options.messageBody || '',
      };
    }

    if (options.expireAt) {
      body.expire_at = options.expireAt;
    }

    return this.request<DocuSealSubmission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * Get all submissions
   */
  async getSubmissions(params?: {
    templateId?: number;
    status?: 'pending' | 'completed' | 'expired';
    limit?: number;
    offset?: number;
  }): Promise<DocuSealSubmission[]> {
    const queryParams = new URLSearchParams();

    if (params?.templateId) {
      queryParams.append('template_id', params.templateId.toString());
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const query = queryParams.toString();
    return this.request<DocuSealSubmission[]>(`/submissions${query ? `?${query}` : ''}`);
  }

  /**
   * Get a specific submission by ID
   */
  async getSubmission(submissionId: number): Promise<DocuSealSubmission> {
    return this.request<DocuSealSubmission>(`/submissions/${submissionId}`);
  }

  /**
   * Archive (soft delete) a submission
   */
  async archiveSubmission(submissionId: number): Promise<void> {
    await this.request(`/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  }

  // =====================
  // SUBMITTER OPERATIONS
  // =====================

  /**
   * Get submitter details
   */
  async getSubmitter(submitterId: number): Promise<DocuSealSubmitter> {
    return this.request<DocuSealSubmitter>(`/submitters/${submitterId}`);
  }

  /**
   * Update submitter (e.g., resend email)
   */
  async updateSubmitter(
    submitterId: number,
    updates: { send_email?: boolean; email?: string; name?: string }
  ): Promise<DocuSealSubmitter> {
    return this.request<DocuSealSubmitter>(`/submitters/${submitterId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // =====================
  // EMBED OPERATIONS
  // =====================

  /**
   * Generate an embed URL for signing
   * This allows embedding the signing interface in your app
   */
  async getEmbedUrl(submitterId: number): Promise<string> {
    const response = await this.request<{ url: string }>(
      `/submitters/${submitterId}/embed`
    );
    return response.url;
  }

  // =====================
  // DOCUMENT OPERATIONS
  // =====================

  /**
   * Download a signed document
   */
  async downloadDocument(documentUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(documentUrl, {
      headers: {
        'X-Auth-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.status}`);
    }

    return response.arrayBuffer();
  }
}

// Export singleton instance
export const docusealClient = new DocuSealClient();

// Export class for testing
export { DocuSealClient };
