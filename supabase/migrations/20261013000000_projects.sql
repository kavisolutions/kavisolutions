-- Projects table for portfolio/projects showcase
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  live_link text,
  live_link_type text check (live_link_type in ('app', 'web', 'both')) default 'web',
  project_types text[] not null default '{}',
  skills text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "Service role full access" on projects;
create policy "Service role full access" on projects
  for all to service_role
  using (true) with check (true);

drop policy if exists "Public read access" on projects;
create policy "Public read access" on projects
  for select to anon, authenticated
  using (true);

-- Index for ordering
create index if not exists projects_sort_order_idx on projects (sort_order, created_at);