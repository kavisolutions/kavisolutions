# Kavi Survey & Research Solutions — page handover

Status: **built, not launched.** The page 404s until it is explicitly enabled.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/SurveyPage.tsx` |
| Enquiry forms (client + surveyor) | `app/components/SurveyForms.tsx` |
| All editable content | `app/lib/survey-data.ts` |
| Route + launch gate | `app/app/survey/page.tsx` |
| API endpoint | `api/src/modules/survey/` |
| Email template | `api/src/_shared/mailer.ts` → `sendSurveyEnquiryEmail` |

## Enable the page

The route reads `SURVEY_PAGE_ENABLED` **at build time**. Next.js prerenders this
page, so setting the variable only on the running process is not enough.

```bash
# on the server, in /var/www/kavi-solutions/app/.env.production
SURVEY_PAGE_ENABLED=true

# then rebuild + restart the frontend
cd /var/www/kavi-solutions/app
BACKEND_URL=http://127.0.0.1:3200 npm run build
pm2 restart kavi-solutions --update-env
```

Until then:

- `/survey` returns **404**.
- `<meta name="robots">` is `noindex, nofollow`.
- No navigation link exists anywhere on the site, so nothing points at it.

To take it down again, remove the variable and rebuild.

### Environment dashboard

The var lives in the Env Manager project `kavi-solutions`, env `fe-local`
(project `kavi-solutions` holds frontend envs; `kavi-solutions-be` holds the
backend ones). Production is intentionally left without it, so the page stays
unpublished until you set it on the server and rebuild.

A local checkout can pull it with a deploy token:

```bash
curl -fsSk -H "Authorization: Bearer $ENV_TOKEN" \
  https://env.arkasodhara.tech/api/v1/kavi-solutions/fe-local -o app/.env.local
```

`app/.env.example` documents the key with a safe default of `false`.

## Where the API is called

`POST /api/survey/enquiries` — public, throttled to 5 requests/minute per IP.
One endpoint serves both forms; `kind` is `"client"` or `"surveyor"`.

Request (client):

```json
{
  "kind": "client",
  "name": "…",
  "email": "…",
  "phone": "…",
  "organisation": "…",
  "service": "Market & brand research",
  "message": "…"
}
```

Request (surveyor): same base fields plus `location`, `languages`, `experience`
and no `organisation`/`service`. Mixing the two sets is rejected with 400.

Emails go to the address configured in admin settings (`contact_email`), falling
back to `SMTP_USER`. Subject is prefixed `[Kavi Survey]` so it is filterable
separately from the main site contact form, and `Reply-To` is set to the
submitter.

If SMTP fails the endpoint returns **503** with a message telling the visitor to
email directly, rather than an opaque 500. To use a dedicated mailbox instead of
the general one, set `contact_email` in `/admin?section=settings`.

## Editing content

Almost everything visible is in `app/lib/survey-data.ts`:

| Export | Controls |
| --- | --- |
| `SURVEY_HERO` | Hero copy and the four metric tiles |
| `SURVEY_VERTICALS` | The six service cards and their bullet lists |
| `SURVEY_APPROACH` | The five-step method |
| `SURVEY_ENGAGEMENT_MODELS` | The five engagement models |
| `SURVEY_FIELD_NETWORK` | Field network copy, checklist and capability table |
| `SURVEY_INDUSTRIES` | Sector chips |
| `SURVEY_OPPORTUNITIES` | Business development list |
| `SURVEY_CLIENT_QUESTIONS` / `SURVEY_SURVEYOR_QUESTIONS` | The two FAQ blocks |
| `SURVEY_SERVICE_OPTIONS` | Choices in the client form dropdown |
| `SURVEY_CONTACT` | Email, phone, location footer |

No layout changes are needed for content edits — cards size to their content.

## Business-development list

`SURVEY_OPPORTUNITIES` is rendered as **opportunities under discussion**, not as
clients, and the page says so explicitly. Keep that framing when adding names:
listing an organisation as a client without an agreement is a legal and
reputational risk.

## Adding a navigation link

Once launched, add the entry to both nav arrays:

- `app/components/Navbar.tsx` → `links`
- `app/components/Footer.tsx` → the services column

Suggested label: `Survey`. Keep it out of the nav until the page is enabled,
otherwise visitors hit a 404.

## Future technical dependencies

This page is a brochure with two lead forms, backed by a surveyor registry. The
task also describes a much larger platform. Nothing below is built; these are
the pieces that would be needed.

### 1. Surveyor registry — **built**

`surveyors` table, public registration at `/survey`, admin management at
`/admin?section=surveyors`. See "Surveyor registry" below.

### 2. Project and assignment tracking
`projects` → `assignments` → `surveyor` relationships, with status transitions
and per-project response quotas.

### 3. Mobile data collection
Offline-capable forms with GPS tagging (with consent), photo capture and
submission sync. This is a separate application, not a page in this repo.

### 4. Data validation pipeline
Back-check workflow, duplicate detection, logic validation and an audit trail
per response.

### 5. Reporting
Server-side aggregation and dashboard generation, so reports are produced from
the platform instead of in spreadsheets.

### 6. Separate domain
The content module is deliberately isolated in `lib/survey-data.ts` and the page
in `components/SurveyPage.tsx` so both can move to a standalone Next.js app
without rewriting the design.

## Surveyor registry

Registrations from the page are stored, not just emailed.

| Piece | Location |
| --- | --- |
| Table | `surveyors` (migration `0003_surveyors`) |
| Public registration | `POST /api/surveyors/register` |
| Admin list/update/delete | `/api/surveyors` (`GET`, `PATCH /:id`, `DELETE /:id`) |
| Admin screen | `/admin?section=surveyors` |
| Shared types | `app/lib/surveyors.ts` |

### Status workflow

`applied` → `verified` → `active`, with `inactive` and `rejected` as exits.

- Registrations always arrive as **applied**.
- Verifying stamps `verified_at`. Moving to `active` keeps that original date.
- Rejecting or returning to `applied` clears `verified_at`.
- Re-registering with an existing email **updates the profile and keeps its
  status**, so a verified surveyor is never silently reset to applied.
- Internal `notes` and `verified_at` are never returned by the public
  registration response.

### Privacy note

The registry stores name, email, phone, location, languages, skills and
experience — personal data about individual field workers. Before this goes
live, decide:

- who can export it (today every admin can, via the admin API),
- how long inactive profiles are retained,
- whether surveyors can request deletion (the delete endpoint exists, but there
  is no self-service path).

There is no audit log of who verified or deleted a profile yet.

## Deliberate privacy decisions

- The form requires a phone number because field follow-up depends on it, and
  states that personal data is used only for the agreed research purpose.
- No data is persisted in this repo's database; submissions are mailed and not
  stored. If a CRM or database is added later, a retention policy should be
  defined at the same time.
- The political/social section states that data collection follows applicable
  privacy, election and data protection requirements. This is a claim the
  contracts must actually support.
- Academic support explicitly refuses fabricated data.
