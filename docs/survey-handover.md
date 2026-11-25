# Kavi Survey & Research — page handover

Status: **published.** The page is live at `/survey` with its own frontend and
API deployment. This document explains how to enable, update and integrate it.

## Links

| Item | Link |
| --- | --- |
| Live page | `https://kavisolutions.in/survey` |
| Admin (content + enquiries) | `https://kavisolutions.in/survey/admin` |
| Survey API health | `https://kavisolutions.in/survey-api/api/health` |
| Frontend code | `survey/` (git submodule) |
| API code | `api/src/modules/survey/`, `api/src/modules/surveyors/` |
| Content reference | `docs/survey-page.md` |
| Roadmap / future dependencies | `docs/survey-roadmap.md` |

## What exists

| Piece | Location |
| --- | --- |
| Page + sections | `survey/src/app/page.tsx` |
| Client / surveyor enquiry forms | `survey/src/components/EnquiryForm.tsx` |
| Service cards and network | `survey_content` JSONB row (`id = 'main'`) |
| Internal leads / connections | Main admin → Settings → Survey Opportunities |
| Admin editor | `survey/src/app/admin/page.tsx` + `AdminEditor.tsx` |
| Main admin service manager | `/admin?section=survey` |
| Surveyor registry | `/admin?section=surveyors` |
| SVG placeholder illustrations | `survey/src/components/SurveyVisuals.tsx` |
| Real photos (optional) | Public MinIO bucket via `POST /api/upload` |

## Enable the page

Production nginx routes `/survey` to the survey frontend on `:3004` and
`/survey-api/` to the survey API on `:3201`. No feature flag is involved.

1. Install `deploy/nginx.conf` on the VPS:
   `sudo nginx -t && sudo systemctl reload nginx`.
2. Push to `main`; `.github/workflows/deploy.yml` builds both APIs and the
   survey frontend and health-checks `:3200`, `:3201`, `:3111` and `:3004`.
3. Seed content once if the database is new:
   `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0001_survey_content.sql`.
   Targeted updates are in `api/db/dml/0002`–`0010`; see `api/db/dml/README.md`.

If the content row is missing, the page still renders an empty shell with a
warning banner; it never falls back to a second page implementation.

## Update content

All public copy is in the single `survey_content` row, never in the frontend.

- **Main admin** → **Survey services** (`/admin?section=survey`) manages service
  cards, ordering, hidden flags and the network section without JSON editing.
- **Survey admin** (`/survey/admin`) edits the whole JSON, including
  `images`, engagement models, sample work, sectors and FAQs.
- Changes publish immediately through `PUT /api/survey/content`; no rebuild.

Internal leads are managed only in **main admin → Settings → Survey
Opportunities**, one `Name | short note` per line. They are for admin review;
the public page and `GET /api/survey/opportunities` never expose them.

## Add real photos

The page uses built-in SVG illustrations until a photo URL is set. Photos are
stored in the existing **public MinIO bucket** (`S3_BUCKET`, exposed through
`S3_PUBLIC_URL`), not in the repo.

1. Sign in as an admin and `POST` the image to `/api/upload` as multipart
   `file` (jpg, png, webp or gif, max 5MB). The response `{ url }` is the public
   MinIO URL.
2. In Survey admin (`/survey/admin`), set `images.fieldwork`, `images.analysis`
   or `images.presentation` to that full `http(s)` URL.
3. Save. The matching illustration is replaced on the next page request.

Do not hot-link third-party image URLs; upload to MinIO instead.

## Integrate with the main site

- Navigation links already point to `/survey` (navbar, footer, mobile menu,
  dashboard, Explore, Civic Tech sections).
- Forms post to the survey API through `/survey-api/`; the main app does not
  proxy survey submissions.
- Login is shared: the main app owns `/login`, and a `?next=/survey/...` query
  returns the user to the survey page after sign-in. Admin checks use
  `GET /api/me` so DB-table admins are accepted too.
- Enquiries land in `/admin?section=survey` → Enquiries; surveyor registrations
  land in `/admin?section=surveyors`.

## Operations

| Process | Port | Notes |
| --- | --- | --- |
| Main web | 3111 | PM2 `kavi-solutions` |
| Main API | 3200 | PM2 `kavi-solutions-be` |
| Survey frontend | 3004 | PM2 `kavi-survey` |
| Survey API | 3201 | PM2 `kavi-solutions-survey-be`, no background singletons |
| Social agent | 3300 | optional |

Both API deployments share the same PostgreSQL database — it remains the
single point of failure. See `docs/survey-page.md` for isolation details and
`OPS-RUNBOOK.md` for server access.
