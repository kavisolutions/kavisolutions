-- Admin panel: role management + team (sub-team) management.
-- roles: organisation roles (volunteer, intern, fellow, mentor, partner...)
-- teams: sub-teams (core, marketing, tech, operations...)
-- team.team_id links a member to a sub-team.

create table if not exists roles (
  id text primary key,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table roles enable row level security;
drop policy if exists "Service role full access" on roles;
create policy "Service role full access" on roles
  for all to service_role
  using (true) with check (true);

insert into roles (id, name, sort_order) values
  ('volunteer', 'Volunteer', 1),
  ('intern', 'Intern', 2),
  ('fellow', 'Fellow', 3),
  ('mentor', 'Mentor', 4),
  ('partner', 'Partner', 5)
on conflict (id) do nothing;

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table teams enable row level security;
drop policy if exists "Service role full access" on teams;
create policy "Service role full access" on teams
  for all to service_role
  using (true) with check (true);

insert into teams (name, sort_order) values
  ('Core Team', 1),
  ('Marketing Team', 2),
  ('Tech Team', 3),
  ('Operations Team', 4)
on conflict (name) do nothing;

alter table team add column if not exists team_id uuid references teams(id) on delete set null;

create index if not exists idx_team_team_id on team(team_id);
