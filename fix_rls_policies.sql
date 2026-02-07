-- Fix RLS Policies for Login (Non-recursive version)
-- This ensures users can read their own profile during login and admins can manage users

-- 1. Helper Function to prevent recursion
-- "SECURITY DEFINER" allows this function to bypass RLS checks for its internal query
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clear out old policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON public.profiles;

-- 3. Basic Select Policy: Everyone can see their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- 4. Admin Select Policy: Admins can see everyone
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (public.is_admin());

-- 5. Delete Policy: Only super admins
CREATE POLICY "Only super admins can delete" ON public.profiles
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
