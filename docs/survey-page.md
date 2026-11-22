# Survey & Research Solutions — separate frontend and API deployment

`/survey` is a separate Next.js frontend
([`kavi-solutions/kavi-survey-research`](https://github.com/kavi-solutions/kavi-survey-research))
with its **own deployment of the same NestJS API**. Both API deployments use
the same codebase and the same PostgreSQL database, but neither depends on the
other process being up.

The main app no longer contains a fallback survey page, forms, visuals or
content module.

## Deployment isolation

| Process | Container | Port | Depends on |
| --- | --- | --- | --- |
| Main web | `kavi-solutions-web` | `3100` | main API |
| Main API | `kavi-solutions-api` | `3200` | Postgres |
| Survey frontend | `kavi-solutions-survey` | `3004` | survey API |
| Survey API | `kavi-solutions-survey-api` | `3201` | Postgres |

Failure behaviour:

| Failure | Result |
| --- | --- |
| Main API down | Survey frontend + survey API keep working |
| Main web down | Survey still works on `:3004` (or nginx `/survey`) |
| Survey API down | Main app keeps working; survey forms/admin fail |
| Survey frontend down | Main app keeps working; `/survey` returns 502 |
| Postgres down | Both stacks fail — shared database is the remaining single point of failure |

If full database isolation is needed later, give the survey API its own
database and replication/backup policy. That is a separate step.

## Routing

Production nginx sends `/survey` to the survey frontend and `/survey-api/` to
the survey API:

```nginx
location /survey {
    proxy_pass http://127.0.0.1:3004;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_cache_bypass $http_upgrade;
}

location /survey-api/ {
    proxy_pass http://127.0.0.1:3201/;
}
```

The survey frontend uses `NEXT_PUBLIC_API_BASE_URL=/survey-api`, so browser
calls stay same-origin and do not pass through the main web app. The main app
also proxies `/survey` locally for convenience, but that proxy is not required
in production.

## Production auto-deploy

A push to `main` runs `.github/workflows/deploy.yml`, which updates the `survey`
submodule and calls `deploy/deploy.sh` on the VPS. That script:

1. builds the shared API once and starts two PM2 processes:
   `kavi-solutions-be` (:3200) and `kavi-solutions-survey-be` (:3201);
2. builds the survey frontend and starts `kavi-survey` (:3004);
3. health-checks `/api/health` on both APIs and `/survey` on the frontend.

`deploy/nginx.conf` must be installed on the server with:

```nginx
location = /survey { proxy_pass http://127.0.0.1:3004; ... }
location /survey/   { proxy_pass http://127.0.0.1:3004; ... }
location /survey-api/ { proxy_pass http://127.0.0.1:3201/; ... }
```

The survey frontend is built with `NEXT_PUBLIC_API_BASE_URL=/survey-api`, so
browser calls stay same-origin and bypass the main web process.

## Data ownership

| Piece | Owner | Location |
| --- | --- | --- |
| `survey_content` | Shared NestJS code | `api/src/modules/survey` |
| `survey_enquiries` | Shared NestJS code | `api/src/modules/survey` |
| `surveyors` registry | Shared NestJS code | `api/src/modules/surveyors` |
| Page rendering | Survey frontend | `survey/` submodule |

Both API containers run the same Drizzle migrations. Only `api-migrate` writes
schema changes; both API processes read/write the same tables.

The survey API is a secondary process, so background singletons are disabled
there: `FELLOWSHIP_AUTOMATION_ENABLED=false` (no duplicate daily reminders) and
`WHATSAPP_AUTOCONNECT=false` (only the main API holds the WhatsApp session).
Admin-triggered actions still work in both processes.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/survey/content` | public | Published page content (`null` → empty page) |
| `PUT` | `/api/survey/content` | admin | Publish content |
| `POST` | `/api/survey/enquiries` | public, throttled | Client project enquiry |
| `POST` | `/api/surveyors/register` | public, throttled | Surveyor network registration |
| `GET` | `/api/survey/enquiries` | admin | Client enquiry inbox |
| `PATCH` | `/api/survey/enquiries/:id` | admin | Status and internal notes |

`survey_content` is a single JSONB row (`id = 'main'`) and the only content
source. There is no bundled default payload.

### Production pre-data

Seed the content row before starting the survey frontend:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0001_survey_content.sql
```

The DML is idempotent and never overwrites a row already published from the
admin panel. See `api/db/dml/README.md` for verification queries.

If the database already has the older 15-service Field Surveys list, run the
targeted sync instead (or as well):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0002_survey_content_field_services.sql
```

## Managing services in the admin panel

Main admin → **Survey services** (`/admin?section=survey`) manages the public
service cards without editing JSON:

- list of verticals in display order;
- add, edit and delete a service;
- hide/show a service without deleting it (`hidden` flag);
- side heading (`tag`), icon, title, description (`summary`);
- service points (`services`) as one line per point;
- reorder with up/down buttons.

Hidden services stay in the admin list, marked **Hidden**, but are omitted from
the public cards and the enquiry service dropdown. The hero vertical count uses
the visible count.

Each action publishes immediately through `PUT /api/survey/content`. The hero
metric labelled “Research verticals” is recalculated from the array length.
The survey frontend’s enquiry dropdown is generated from the same vertical
titles, so a new service appears there automatically.

If the shared API has no published content yet, the admin screen starts empty
and the first saved service creates the content row.

## Local Docker

```bash
git submodule update --init --recursive
docker compose up -d --build
```

URLs:

| URL | Serves |
| --- | --- |
| `http://localhost:3100` | Main app |
| `http://localhost:3100/survey` | Survey via main-app proxy |
| `http://localhost:3004/survey` | Survey directly |
| `http://localhost:3201/api/health` | Survey API |
| `http://localhost:3200/api/health` | Main API |

The survey frontend uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:3201`, so
its browser calls do not touch the main web app. The survey API allows CORS
from `:3004` and `:3100`.

Admin login is the main app session: sign in at
`http://localhost:3100/login`, then open `http://localhost:3100/survey/admin`
(or `:3004/survey/admin`).

## Surveyor registry

The shared API owns the surveyor network registry:

| Piece | Location |
| --- | --- |
| Table | `surveyors` (migration `0003_surveyors`) |
| Admin screen | `/admin?section=surveyors` |
| Admin API | `/api/surveyors` (`GET`, `PATCH /:id`, `DELETE /:id`) |
| CSV export | `GET /api/surveyors/export.csv` |
| Audit history | `GET /api/surveyors/:id/audit` |
| Retention purge | `npm run surveyors:purge` |

Registrations from the survey frontend post to `POST /api/surveyors/register`
and arrive as `applied`. Status workflow: `applied` → `verified` → `active`,
with `inactive` and `rejected` as exits.

## Legacy fallback

Removed. There is no second page implementation to keep in sync.
