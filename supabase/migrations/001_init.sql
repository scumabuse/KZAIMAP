-- ═══════════════════════════════════════════════════════════════
-- EcoMap KZ — Database Migration 001
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ─── Profiles table ──────────────────────────────────────────────
create table if not exists public.profiles (
  id    uuid primary key references auth.users(id) on delete cascade,
  email text,
  role  text not null default 'user' check (role in ('user', 'admin'))
);

-- ─── Reports table ───────────────────────────────────────────────
create table if not exists public.reports (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete set null,
  photo_url          text,
  description        text,
  latitude           double precision not null,
  longitude          double precision not null,
  ai_is_dump         boolean,
  ai_confidence      integer check (ai_confidence between 0 and 100),
  ai_pollution_level text check (ai_pollution_level in ('low', 'medium', 'high')),
  ai_waste_types     jsonb,
  ai_hazardous       boolean,
  risk_score         integer default 0,
  created_at         timestamptz not null default now(),
  status             text not null default 'pending' check (status in ('pending', 'verified', 'rejected'))
);

-- ─── Row Level Security ──────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.reports  enable row level security;

-- Function to check admin status without triggering infinite recursion (Security Definer bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using ( public.is_admin() );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Reports policies
create policy "Anyone can read reports"
  on public.reports for select
  using (true);

create policy "Authenticated users can create reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Admins can update reports"
  on public.reports for update
  using ( public.is_admin() );

create policy "Admins can delete reports"
  on public.reports for delete
  using ( public.is_admin() );

-- Allow edge functions / service role to update AI fields
create policy "Service role can update reports"
  on public.reports for update
  using (auth.role() = 'service_role');

-- ─── Auto-create profile on user sign up ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ─── Storage bucket ──────────────────────────────────────────────
-- Run this separately in Supabase Dashboard → Storage
-- Or via SQL:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dump-photos',
  'dump-photos',
  true,
  10485760,  -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage policies
create policy "Public can read dump photos"
  on storage.objects for select
  using (bucket_id = 'dump-photos');

create policy "Authenticated users can upload dump photos"
  on storage.objects for insert
  with check (
    bucket_id = 'dump-photos'
    and auth.uid() is not null
  );

create policy "Users can delete own dump photos"
  on storage.objects for delete
  using (
    bucket_id = 'dump-photos'
    and auth.uid() = owner
  );

-- ─── Indexes for performance ─────────────────────────────────────
create index if not exists idx_reports_user_id    on public.reports(user_id);
create index if not exists idx_reports_status     on public.reports(status);
create index if not exists idx_reports_created_at on public.reports(created_at desc);
create index if not exists idx_reports_location   on public.reports(latitude, longitude);

-- ═══════════════════════════════════════════════════════════════
-- To make a user admin, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ═══════════════════════════════════════════════════════════════
