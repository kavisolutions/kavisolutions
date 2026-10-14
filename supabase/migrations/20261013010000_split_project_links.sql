-- Split single live_link into app_link and web_link so link inputs
-- can be conditioned on live_link_type (app / web / both).
alter table projects add column if not exists app_link text;
alter table projects add column if not exists web_link text;

update projects
set
  app_link = case
    when live_link_type in ('app', 'both') then live_link
    else null
  end,
  web_link = case
    when live_link_type is null or live_link_type in ('web', 'both') then live_link
    else null
  end
where live_link is not null;

alter table projects drop column if exists live_link;

-- Link matching declared type must exist.
alter table projects drop constraint if exists projects_link_required;
alter table projects add constraint projects_link_required check (
  live_link_type is null
  or (live_link_type = 'app' and app_link is not null)
  or (live_link_type = 'web' and web_link is not null)
  or (live_link_type = 'both' and app_link is not null and web_link is not null)
);
