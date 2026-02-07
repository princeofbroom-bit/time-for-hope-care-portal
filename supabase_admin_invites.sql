-- Admin Invite System
-- This allows you to invite administrators via secure token-based links

-- Create admin_invites table
create table public.admin_invites (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  token text unique not null,
  invited_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  used_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.admin_invites enable row level security;

-- Policies for admin_invites
-- Only admins can create invites
create policy "Admins can create invites" on public.admin_invites
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can view all invites
create policy "Admins can view invites" on public.admin_invites
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Anyone can view their own invite (for validation)
create policy "Anyone can view their invite by token" on public.admin_invites
  for select using (true);

-- Admins can update invites (mark as used)
create policy "Admins can update invites" on public.admin_invites
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create index for faster token lookups
create index admin_invites_token_idx on public.admin_invites(token);
create index admin_invites_email_idx on public.admin_invites(email);
