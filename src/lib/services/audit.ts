/**
 * Audit Service
 * Handles audit trail logging for document signing
 */

import { getSupabase } from '../supabase';

// Audit event types
export type AuditEventType =
  | 'request_created'
  | 'email_sent'
  | 'reminder_sent'
  | 'link_accessed'
  | 'document_viewed'
  | 'signature_applied'
  | 'completed'
  | 'declined'
  | 'voided'
  | 'expired';

export interface AuditLogEntry {
  id: string;
  signing_request_id: string;
  event_type: AuditEventType;
  event_timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  browser_fingerprint: string | null;
  geolocation: {
    country?: string;
    region?: string;
    city?: string;
  } | null;
  metadata: Record<string, unknown> | null;
  signature_data: Record<string, unknown> | null;
  created_at: string;
}

export interface LogAuditOptions {
  signingRequestId: string;
  eventType: AuditEventType;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    fingerprint?: string;
  };
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
  metadata?: Record<string, unknown>;
  signatureData?: Record<string, unknown>;
}

class AuditService {
  private supabase = getSupabase();

  /**
   * Log an audit event
   */
  async log(options: LogAuditOptions): Promise<AuditLogEntry> {
    const { data, error } = await this.supabase
      .from('signing_audit_log')
      .insert({
        signing_request_id: options.signingRequestId,
        event_type: options.eventType,
        event_timestamp: new Date().toISOString(),
        ip_address: options.clientInfo?.ip || null,
        user_agent: options.clientInfo?.userAgent || null,
        browser_fingerprint: options.clientInfo?.fingerprint || null,
        geolocation: options.geolocation || null,
        metadata: options.metadata || null,
        signature_data: options.signatureData || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the main flow
      // But log for monitoring
      return {} as AuditLogEntry;
    }

    return data as AuditLogEntry;
  }

  /**
   * Get audit log for a signing request
   */
  async getAuditLog(signingRequestId: string): Promise<AuditLogEntry[]> {
    const { data, error } = await this.supabase
      .from('signing_audit_log')
      .select('*')
      .eq('signing_request_id', signingRequestId)
      .order('event_timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }

    return data as AuditLogEntry[];
  }

  /**
   * Get audit logs by event type
   */
  async getAuditLogsByType(
    eventType: AuditEventType,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditLogEntry[]> {
    let query = this.supabase
      .from('signing_audit_log')
      .select('*')
      .eq('event_type', eventType)
      .order('event_timestamp', { ascending: false });

    if (options?.startDate) {
      query = query.gte('event_timestamp', options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte('event_timestamp', options.endDate.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data as AuditLogEntry[];
  }

  /**
   * Generate a certificate data object from audit log
   * This is used to create completion certificates
   */
  async generateCertificateData(signingRequestId: string): Promise<{
    signingRequestId: string;
    events: Array<{
      type: AuditEventType;
      timestamp: string;
      ip?: string;
      userAgent?: string;
      location?: string;
    }>;
    summary: {
      createdAt: string;
      completedAt?: string;
      totalEvents: number;
      signerIp?: string;
      signerLocation?: string;
    };
  }> {
    const auditLog = await this.getAuditLog(signingRequestId);

    const events = auditLog.map((entry) => ({
      type: entry.event_type,
      timestamp: entry.event_timestamp,
      ip: entry.ip_address || undefined,
      userAgent: entry.user_agent || undefined,
      location: entry.geolocation
        ? [entry.geolocation.city, entry.geolocation.region, entry.geolocation.country]
            .filter(Boolean)
            .join(', ')
        : undefined,
    }));

    const createdEvent = auditLog.find((e) => e.event_type === 'request_created');
    const completedEvent = auditLog.find((e) => e.event_type === 'completed');
    const signatureEvent = auditLog.find((e) => e.event_type === 'signature_applied');

    return {
      signingRequestId,
      events,
      summary: {
        createdAt: createdEvent?.event_timestamp || new Date().toISOString(),
        completedAt: completedEvent?.event_timestamp,
        totalEvents: events.length,
        signerIp: signatureEvent?.ip_address || undefined,
        signerLocation: signatureEvent?.geolocation
          ? [
              signatureEvent.geolocation.city,
              signatureEvent.geolocation.region,
              signatureEvent.geolocation.country,
            ]
              .filter(Boolean)
              .join(', ')
          : undefined,
      },
    };
  }

  /**
   * Get statistics for audit events
   */
  async getStatistics(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalEvents: number;
    byEventType: Record<AuditEventType, number>;
    recentActivity: AuditLogEntry[];
  }> {
    let query = this.supabase
      .from('signing_audit_log')
      .select('*')
      .order('event_timestamp', { ascending: false });

    if (options?.startDate) {
      query = query.gte('event_timestamp', options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte('event_timestamp', options.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit statistics: ${error.message}`);
    }

    const entries = data as AuditLogEntry[];

    // Count by event type
    const byEventType = entries.reduce(
      (acc, entry) => {
        acc[entry.event_type] = (acc[entry.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<AuditEventType, number>
    );

    return {
      totalEvents: entries.length,
      byEventType,
      recentActivity: entries.slice(0, 10),
    };
  }

  /**
   * Extract client info from request headers
   * Use this in API routes to capture audit information
   */
  extractClientInfo(headers: Headers): {
    ip: string;
    userAgent: string;
    fingerprint?: string;
  } {
    const ip =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      'unknown';

    const userAgent = headers.get('user-agent') || 'unknown';

    return {
      ip,
      userAgent,
    };
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Export class for testing
export { AuditService };
