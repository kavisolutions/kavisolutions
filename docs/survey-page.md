# Kavi Survey & Research Solutions — page handover

Status: **published.** The page is live at `/survey`; admins can hide it again from **Settings → Live pages**.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/SurveyPage.tsx` |
| Enquiry forms (client + surveyor) | `app/components/SurveyForms.tsx` |
| Vector visuals (field, network, analysis) | `app/components/SurveyVisuals.tsx` |
| All editable content | `app/lib/survey-data.ts` |
| Route + launch gate | `app/app/survey/page.tsx` |
| API endpoint | `api/src/modules/survey/` |
| Email template | `api/src/_shared/mailer.ts` → `sendSurveyEnquiryEmail` |
| Client enquiry inbox | `/admin?section=enquiries` |
| Reusable questionnaire templates | `docs/survey-templates.md` |

## Publish the page

Admins switch `/survey` on and off from the admin panel:
**Settings → Live pages → Survey & Research**. A hidden page returns **404** and
is marked `noindex, nofollow`.

The page is currently **published**. Navigation links exist in the Navbar,
mobile menu, homepage CivicTech card, dashboard and footer. If the page is
hidden again, remove those links at the same time — a hidden route linked from a
public page is a broken link. The exact files are listed in the launch
checklist below.

The switch is stored in `app_settings` (`page_survey_enabled`) and read by the
API at `GET /api/pages`. `app/app/survey/page.tsx` checks it on every request —
that is why the route sets `dynamic = "force-dynamic"`. Two consequences:

- There is **no environment variable** and no rebuild: flipping it takes effect
  on the next request.
- The check **fails closed**. If the API is unreachable or the stored value is
  anything but `"true"`, the page 404s rather than publishing itself.

The API is the source of truth; `PATCH /api/pages` (admin only) is what the
panel calls. The endpoints are listed in `api/README.md`.

### Env dashboard

Nothing to configure. If an old deployment note or Env Manager entry mentions
`SURVEY_PAGE_ENABLED`, it can be removed — the variable is no longer read.

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
| `SURVEY_CONTACT` | Email, named business contact and location footer |

No layout changes are needed for content edits — cards size to their content.

## Business-development list

`SURVEY_OPPORTUNITIES` is rendered as **opportunities under discussion**, not as
clients, and the page says so explicitly. Keep that framing when adding names:
listing an organisation as a client without an agreement is a legal and
reputational risk.

## Navigation links

The page is live and linked from all five places. If it is hidden again, remove
the links and restore them when it is published:

| File | Change |
| --- | --- |
| `app/components/Navbar.tsx` | Add `{ label: "Research", href: "/survey", icon: BarChart3 }` back to `verticals` and import `BarChart3` |
| `app/components/MobileMenu.tsx` | Add `{ href: "/survey", label: "Survey & Research", icon: BarChart3 }` to `serviceLinks` and import `BarChart3` |
| `app/components/CivicTechSection.tsx` | Change the survey CTA from the `Launching soon` span back to the `<Link href={item.href}>` branch, and set `href: "/survey"` |
| `app/app/dashboard/page.tsx` | Add the `Survey & Research` card back to the verticals array |
| `app/components/Footer.tsx` | Add a `Survey & Research` link to the Services column |

Suggested label: `Research` in the navbar, `Survey & Research` everywhere else.
Only keep the links while the admin switch is on, otherwise visitors hit a 404.

## Contact details

`SURVEY_CONTACT` holds the general email (`kavisolutions1@gmail.com`), the named
business-development contact (`Basha`) and the location line. A phone number is
deliberately **not** shown: the old `+91 90000 00000` value was a placeholder and
was removed. Add a confirmed business number to `SURVEY_CONTACT` and render it
in the contact card when one is available.

## Visual assets

`app/components/SurveyVisuals.tsx` contains three local SVG illustrations:
field collection/quality/reporting (hero), the district-by-district network
(field operations) and the analysis dashboard (reporting). They are vectors, so
they stay sharp on every screen and do not require image optimisation or remote
hosts. Replace them with real fieldwork photography when the team has images
that are cleared for publication; keep the same aspect ratio so the layout does
not shift.

## Launch / re-launch checklist

1. Confirm the business contact details (email, named contact, phone if used).
2. Run one end-to-end enquiry through production SMTP.
3. Turn on **Settings → Live pages → Survey & Research**.
4. Restore the five navigation links listed above and deploy.
5. Check `/survey` on mobile, tablet and desktop, including both form tabs.
6. Check `/admin?section=enquiries` receives the test enquiry.
7. Confirm `noindex` is gone and the page is crawlable before announcing it.

The current launch is applied by migration `0014`, which sets
`page_survey_enabled = true`. Re-running that migration does not undo a later
hide; the setting is only forced on the first time the migration is applied.

## Client enquiries

Client project enquiries are now stored **and** emailed. The admin inbox lives
at `/admin?section=enquiries`.

| Piece | Location |
| --- | --- |
| Table | `survey_enquiries` (migration `0014`) |
| Public create | `POST /api/survey/enquiries` |
| Admin list | `GET /api/survey/enquiries` (`?status=`, `?search=`) |
| Admin update | `PATCH /api/survey/enquiries/:id` (status + internal notes) |
| Admin delete | `DELETE /api/survey/enquiries/:id` |
| CSV export | `GET /api/survey/enquiries/export.csv` |

Statuses: `new` → `contacted` → `closed`, with `archived` for old leads. If the
database write succeeds but SMTP fails, the visitor still sees success because
the lead is in the inbox; the API logs the mail failure. If both storage and
mail fail, the visitor gets a 503 with the direct email address.

## Future technical dependencies

This page is a brochure with two lead forms, backed by a surveyor registry and a
client enquiry inbox. The task also describes a much larger platform. Nothing
below is built; these are the pieces that would be needed.

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
| CSV export | `GET /api/surveyors/export.csv` |
| Audit history | `GET /api/surveyors/:id/audit`, shown in the admin profile |
| Retention purge | `npm run surveyors:purge` (see below) |
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

### Privacy controls

The registry stores name, email, phone, location, languages, skills and
experience — personal data about individual field workers.

- **Export:** admin-only CSV at `GET /api/surveyors/export.csv`; every admin can
  download it.
- **Audit:** every admin update and delete writes to `surveyor_audit_log` with
  the actor email, action and status change. The profile history modal reads it.
- **Retention:** `npm run surveyors:purge` deletes `inactive` and `rejected`
  profiles older than `SURVEYOR_RETENTION_DAYS` (default 365, minimum 30). Run it
  with `--dry-run` first. Deletion is logged as `purged` by
  `system:retention`.
- **Deletion requests:** there is still no self-service path. A surveyor emails
  the business contact and an admin deletes the profile; the audit entry records
  who did it. Decide and publish the retention period before promoting the
  registry widely.

## Deliberate privacy decisions

- The form requires a phone number because field follow-up depends on it, and
  states that personal data is used only for the agreed research purpose.
- Client enquiries are stored in `survey_enquiries` and can be exported or
  deleted by admins. Define a retention period (for example, delete closed and
  archived enquiries after 24 months); the schema keeps `created_at` for this.
- Surveyor registrations are stored in `surveyors`; the retention and audit
  controls are described above.
- The political/social section states that data collection follows applicable
  privacy, election and data protection requirements. This is a claim the
  contracts must actually support.
- Academic support explicitly refuses fabricated data.
