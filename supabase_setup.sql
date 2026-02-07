-- Create a 'profiles' table to store user roles and metadata
-- This table is automatically populated when a user signs up
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('worker', 'admin', 'client', 'super_admin')) default 'worker',
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies:
-- 1. Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- 2. Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 3. Admins can view all profiles
create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'worker'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on every signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
