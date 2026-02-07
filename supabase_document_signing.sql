-- =====================================================
-- Document Signing Schema for Time For Hope Portal
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. DOCUMENT TEMPLATES TABLE
-- Stores the ~20 document templates (PDFs and online forms)
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),              -- 'onboarding', 'compliance', 'policy', 'consent'
    template_type VARCHAR(50) NOT NULL, -- 'pdf' or 'online_form'

    -- For PDF templates
    file_path VARCHAR(500),             -- Path in Supabase storage
    docuseal_template_id VARCHAR(255),  -- External DocuSeal template ID

    -- For online forms
    form_schema JSONB,                  -- Form field definitions

    -- Template settings
    is_active BOOLEAN DEFAULT true,
    requires_witness BOOLEAN DEFAULT false,
    expiry_months INTEGER,              -- How long signature is valid (NULL = never expires)
    sort_order INTEGER DEFAULT 0,       -- For ordering in lists

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. SIGNING REQUESTS TABLE
-- Tracks individual signing requests sent to clients
CREATE TABLE IF NOT EXISTS signing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES document_templates(id) ON DELETE CASCADE,

    -- Recipient information
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    recipient_user_id UUID REFERENCES auth.users(id), -- NULL for email-only signing

    -- Signing access
    access_token VARCHAR(255) UNIQUE NOT NULL,  -- For email signing links
    access_method VARCHAR(50) NOT NULL DEFAULT 'email_link', -- 'email_link' or 'portal'

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending',
    -- Values: 'pending', 'sent', 'viewed', 'signed', 'declined', 'expired', 'voided'

    -- External references
    docuseal_submission_id VARCHAR(255),

    -- Expiry & timestamps
    expires_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,

    -- Admin actions
    sent_by UUID REFERENCES auth.users(id),
    reminder_count INTEGER DEFAULT 0,
    last_reminder_at TIMESTAMP WITH TIME ZONE,
    voided_at TIMESTAMP WITH TIME ZONE,
    voided_by UUID REFERENCES auth.users(id),
    void_reason TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SIGNING AUDIT LOG TABLE
-- Full audit trail for legal compliance
CREATE TABLE IF NOT EXISTS signing_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signing_request_id UUID REFERENCES signing_requests(id) ON DELETE CASCADE,

    -- Event details
    event_type VARCHAR(100) NOT NULL,
    -- Values: 'request_created', 'email_sent', 'reminder_sent', 'link_accessed',
    --         'document_viewed', 'signature_applied', 'completed', 'declined', 'voided', 'expired'

    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Client information (for legal compliance)
    ip_address INET,
    user_agent TEXT,
    browser_fingerprint VARCHAR(255),
    geolocation JSONB,  -- {country, region, city}

    -- Event-specific data
    metadata JSONB,     -- Additional event context

    -- For signature events
    signature_data JSONB,  -- {type: 'drawn'|'typed'|'uploaded', hash: '...'}

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SIGNED DOCUMENTS TABLE
-- Stores completed signed documents and certificates
CREATE TABLE IF NOT EXISTS signed_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signing_request_id UUID REFERENCES signing_requests(id) ON DELETE SET NULL,
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,

    -- Signer information
    signer_user_id UUID REFERENCES auth.users(id),
    signer_email VARCHAR(255) NOT NULL,
    signer_name VARCHAR(255) NOT NULL,

    -- Document storage
    signed_document_path VARCHAR(500) NOT NULL,     -- Path to signed PDF
    original_document_path VARCHAR(500),            -- Path to original template
    completion_certificate_path VARCHAR(500),       -- Path to certificate PDF

    -- Certificate data (embedded for quick access)
    certificate_data JSONB,  -- All audit data embedded in certificate

    -- Signature details
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    signature_ip INET,
    signature_user_agent TEXT,
    document_hash VARCHAR(255),  -- SHA-256 of signed document

    -- Validity
    valid_until TIMESTAMP WITH TIME ZONE,  -- Based on template expiry_months

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FORM RESPONSES TABLE
-- Stores responses for online forms (non-PDF documents)
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signing_request_id UUID REFERENCES signing_requests(id) ON DELETE CASCADE,
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,

    -- Response data
    form_data JSONB NOT NULL,  -- All field responses

    -- Signature storage
    signature_image_path VARCHAR(500),  -- Stored signature image

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. SAVED SIGNATURES TABLE
-- Allows users to save their signature for reuse
CREATE TABLE IF NOT EXISTS saved_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Signature data
    signature_type VARCHAR(50) NOT NULL,  -- 'drawn', 'typed', 'uploaded'
    signature_image_path VARCHAR(500),     -- Path in storage
    typed_name VARCHAR(255),               -- For typed signatures
    font_family VARCHAR(100),              -- Font used for typed signature

    -- Settings
    is_default BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);

CREATE INDEX IF NOT EXISTS idx_signing_requests_status ON signing_requests(status);
CREATE INDEX IF NOT EXISTS idx_signing_requests_recipient_email ON signing_requests(recipient_email);
CREATE INDEX IF NOT EXISTS idx_signing_requests_recipient_user ON signing_requests(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_signing_requests_token ON signing_requests(access_token);
CREATE INDEX IF NOT EXISTS idx_signing_requests_template ON signing_requests(template_id);
CREATE INDEX IF NOT EXISTS idx_signing_requests_expires ON signing_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_signed_documents_signer_user ON signed_documents(signer_user_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_signer_email ON signed_documents(signer_email);
CREATE INDEX IF NOT EXISTS idx_signed_documents_template ON signed_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_signed_at ON signed_documents(signed_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_request ON signing_audit_log(signing_request_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON signing_audit_log(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON signing_audit_log(event_type);

CREATE INDEX IF NOT EXISTS idx_saved_signatures_user ON saved_signatures(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signing_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_signatures ENABLE ROW LEVEL SECURITY;

-- Document Templates: Only admins can manage, everyone can view active ones
CREATE POLICY "Admins can manage templates" ON document_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Authenticated users can view active templates" ON document_templates
    FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Signing Requests: Admins see all, clients see their own
CREATE POLICY "Admins can manage all signing requests" ON signing_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clients can view their own signing requests" ON signing_requests
    FOR SELECT USING (auth.uid() = recipient_user_id);

CREATE POLICY "Clients can update their own signing requests" ON signing_requests
    FOR UPDATE USING (auth.uid() = recipient_user_id);

-- Signing Audit Log: Admins see all, clients see their own
CREATE POLICY "Admins can view all audit logs" ON signing_audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clients can view audit logs for their requests" ON signing_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM signing_requests sr
            WHERE sr.id = signing_audit_log.signing_request_id
            AND sr.recipient_user_id = auth.uid()
        )
    );

-- Signed Documents: Admins see all, clients see their own
CREATE POLICY "Admins can view all signed documents" ON signed_documents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clients can view their own signed documents" ON signed_documents
    FOR SELECT USING (auth.uid() = signer_user_id);

-- Form Responses: Admins see all, clients see their own
CREATE POLICY "Admins can manage all form responses" ON form_responses
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Clients can manage their own form responses" ON form_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM signing_requests sr
            WHERE sr.id = form_responses.signing_request_id
            AND sr.recipient_user_id = auth.uid()
        )
    );

-- Saved Signatures: Users can only manage their own
CREATE POLICY "Users can manage their own saved signatures" ON saved_signatures
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signing_requests_updated_at
    BEFORE UPDATE ON signing_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at
    BEFORE UPDATE ON form_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_signatures_updated_at
    BEFORE UPDATE ON saved_signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire signing requests
CREATE OR REPLACE FUNCTION expire_signing_requests()
RETURNS void AS $$
BEGIN
    UPDATE signing_requests
    SET status = 'expired'
    WHERE status IN ('pending', 'sent', 'viewed')
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- =====================================================
-- STORAGE BUCKET SETUP
-- Run this separately in Supabase Dashboard > Storage
-- =====================================================

-- Create bucket for document signing (do this in Supabase Dashboard):
-- Bucket name: document-signing
-- Public: false (private)

-- Storage structure:
-- document-signing/
--   templates/
--     pdf/{template_id}.pdf
--   signed/
--     {year}/{month}/{signed_doc_id}.pdf
--   certificates/
--     {year}/{month}/{signed_doc_id}_certificate.pdf
--   signatures/
--     {user_id}/signature.png
--     {user_id}/initials.png
