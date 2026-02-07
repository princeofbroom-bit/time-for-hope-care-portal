-- Add Super Admin Role to the System
-- This creates a two-tier admin hierarchy

-- Step 1: Update the profiles table to support super_admin role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('client', 'worker', 'admin', 'super_admin'));

-- Step 2: Add is_super_admin helper column (optional, for easier queries)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Step 3: Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update admin_invites policies to allow super admin to invite admins
DROP POLICY IF EXISTS "Admins can create invites" ON public.admin_invites;

CREATE POLICY "Super admins can create admin invites" ON public.admin_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Step 5: Create policy for regular admins to invite clients/workers
CREATE TABLE IF NOT EXISTS public.user_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  token text unique not null,
  role text check (role in ('client', 'worker')) not null,
  invited_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  used_at timestamp with time zone
);

-- Enable RLS on user_invites
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

-- Admins and super admins can create client/worker invites
CREATE POLICY "Admins can invite clients and workers" ON public.user_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can view their invites
CREATE POLICY "Admins can view invites" ON public.user_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_invites_token_idx ON public.user_invites(token);
CREATE INDEX IF NOT EXISTS user_invites_email_idx ON public.user_invites(email);

-- Step 6: Add RLS policies for user deletion (super admin only)
-- This will be used in the application logic

-- Step 7: Create a view to easily identify super admins
CREATE OR REPLACE VIEW public.super_admins AS
SELECT u.id, u.email, p.full_name, u.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE p.role = 'super_admin';

-- Grant access to the view
GRANT SELECT ON public.super_admins TO authenticated;

-- Step 8: Ensure only ONE super admin exists (constraint)
-- Note: This is enforced at application level, not database level
-- to allow for emergency super admin creation if needed

COMMENT ON COLUMN public.profiles.role IS 'User role: client, worker, admin, or super_admin. Only ONE super_admin should exist.';
