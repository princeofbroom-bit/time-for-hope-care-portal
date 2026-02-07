-- =====================================================
-- FIX ALL RLS POLICIES - Include super_admin role
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins and Super Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Super Admins can update all profiles (for role changes, etc.)
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Super Admins can delete profiles
CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- 2. DOCUMENT TEMPLATES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage templates" ON document_templates;
DROP POLICY IF EXISTS "Authenticated users can view active templates" ON document_templates;
DROP POLICY IF EXISTS "Anyone can view active templates" ON document_templates;

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can manage all templates
CREATE POLICY "Admins can manage templates" ON document_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- All authenticated users can view active templates
CREATE POLICY "Authenticated users can view active templates" ON document_templates
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- =====================================================
-- 3. SIGNING REQUESTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage all signing requests" ON signing_requests;
DROP POLICY IF EXISTS "Clients can view their own signing requests" ON signing_requests;
DROP POLICY IF EXISTS "Clients can update their own signing requests" ON signing_requests;
DROP POLICY IF EXISTS "Public can view by access token" ON signing_requests;

ALTER TABLE signing_requests ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can manage all signing requests
CREATE POLICY "Admins can manage all signing requests" ON signing_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users can view their own signing requests (by recipient_user_id)
CREATE POLICY "Users can view their own signing requests" ON signing_requests
  FOR SELECT USING (auth.uid() = recipient_user_id);

-- Users can update their own signing requests (for signing)
CREATE POLICY "Users can update their own signing requests" ON signing_requests
  FOR UPDATE USING (auth.uid() = recipient_user_id);

-- Allow public access by access_token (for email signing links)
-- This is handled at the API level, not RLS

-- =====================================================
-- 4. SIGNING AUDIT LOG TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all audit logs" ON signing_audit_log;
DROP POLICY IF EXISTS "Clients can view audit logs for their requests" ON signing_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON signing_audit_log;

ALTER TABLE signing_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON signing_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users can view audit logs for their own signing requests
CREATE POLICY "Users can view their own audit logs" ON signing_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM signing_requests sr
      WHERE sr.id = signing_audit_log.signing_request_id
      AND sr.recipient_user_id = auth.uid()
    )
  );

-- Allow inserting audit logs (for logging events)
CREATE POLICY "Authenticated users can insert audit logs" ON signing_audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. SIGNED DOCUMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Clients can view their own signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Users can insert signed documents" ON signed_documents;

ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can view all signed documents
CREATE POLICY "Admins can view all signed documents" ON signed_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users can view their own signed documents
CREATE POLICY "Users can view their own signed documents" ON signed_documents
  FOR SELECT USING (auth.uid() = signer_user_id);

-- Users can insert their own signed documents (when signing)
CREATE POLICY "Users can insert their own signed documents" ON signed_documents
  FOR INSERT WITH CHECK (auth.uid() = signer_user_id OR auth.uid() IS NOT NULL);

-- =====================================================
-- 6. FORM RESPONSES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage all form responses" ON form_responses;
DROP POLICY IF EXISTS "Clients can manage their own form responses" ON form_responses;

ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Admins and Super Admins can manage all form responses
CREATE POLICY "Admins can manage all form responses" ON form_responses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Users can manage form responses for their own signing requests
CREATE POLICY "Users can manage their own form responses" ON form_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM signing_requests sr
      WHERE sr.id = form_responses.signing_request_id
      AND sr.recipient_user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. SAVED SIGNATURES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage their own saved signatures" ON saved_signatures;

ALTER TABLE saved_signatures ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own saved signatures
CREATE POLICY "Users can manage their own saved signatures" ON saved_signatures
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 8. ADMIN INVITES TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_invites') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Super admins can manage admin invites" ON admin_invites;
    DROP POLICY IF EXISTS "Anyone can view valid invite by token" ON admin_invites;

    -- Enable RLS
    ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;

    -- Only Super Admins can manage admin invites
    CREATE POLICY "Super admins can manage admin invites" ON admin_invites
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
      );

    -- Public can check invite validity (for signup page)
    CREATE POLICY "Public can view invites by token" ON admin_invites
      FOR SELECT USING (true);
  END IF;
END $$;

-- =====================================================
-- 9. USER INVITES TABLE (if exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_invites') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can manage user invites" ON user_invites;
    DROP POLICY IF EXISTS "Public can view user invites" ON user_invites;

    -- Enable RLS
    ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

    -- Admins and Super Admins can manage user invites
    CREATE POLICY "Admins can manage user invites" ON user_invites
      FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
      );

    -- Public can check invite validity (for signup page)
    CREATE POLICY "Public can view user invites by token" ON user_invites
      FOR SELECT USING (true);
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- Run this to verify all RLS policies are in place
-- =====================================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
