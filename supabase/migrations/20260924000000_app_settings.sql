-- App settings (key/value) for server-side integrations.
-- Used to store the folio team API connection (token + slug). Server-only:
-- the service role client bypasses RLS; no public policies are granted.

create table if not exists app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

drop policy if exists "Service role full access" on app_settings;
create policy "Service role full access" on app_settings
  for all to service_role
  using (true) with check (true);

create or replace function set_app_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_settings_updated_at on app_settings;
create trigger app_settings_updated_at
  before update on app_settings
  for each row execute function set_app_settings_updated_at();
