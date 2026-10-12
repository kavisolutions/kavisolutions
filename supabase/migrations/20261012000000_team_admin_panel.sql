-- Team admin panel: own team API support.
-- Adds a portfolio link per member, an admins allowlist managed from the
-- admin panel, and removes the legacy folio (portfoli.store) connection.

alter table team add column if not exists profile_url text;

create table if not exists admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

drop policy if exists "Service role full access" on admins;
create policy "Service role full access" on admins
  for all to service_role
  using (true) with check (true);

insert into admins (email) values
  ('tejasimma36@gmail.com'),
  ('kavitha@kavisolutions.in')
on conflict (email) do nothing;

delete from app_settings where key in ('folio_api_token', 'folio_team_slug');
