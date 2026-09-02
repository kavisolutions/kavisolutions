-- Team table for Kavi Solutions
create table if not exists team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  initials text not null,
  gradient text not null default 'from-violet-500 to-purple-500',
  bio text not null,
  image_url text,
  user_id uuid references auth.users(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_team_user_id on team(user_id);

-- Enable Row Level Security
alter table team enable row level security;

-- Allow public read access
create policy "Public read access" on team
  for select using (true);

-- Members can update own profile
create policy "Members can update own profile" on team
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Members can insert own profile
create policy "Members can insert own profile" on team
  for insert to authenticated
  with check (user_id = auth.uid());

-- Service role full access
create policy "Service role full access" on team
  for all to service_role
  using (true) with check (true);

-- Storage bucket for team avatars
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Storage RLS
create policy "Authenticated users can upload avatars" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "Public read access for avatars" on storage.objects
  for select to public
  using (bucket_id = 'avatars');

create policy "Authenticated users can update avatars" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

create policy "Authenticated users can delete avatars" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars');

-- Seed data is in supabase/seed.sql
