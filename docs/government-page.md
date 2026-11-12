# Kavi Government Technology Services — page handover

Status: **built, not launched.** `/government` returns 404 until an administrator
enables it under **Settings → Live pages → Government Technology**.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/GovernmentPage.tsx` |
| Enquiry form | `app/components/GovernmentForms.tsx` |
| Editable content | `app/lib/government-data.ts` |
| Route + launch gate | `app/app/government/page.tsx` |
| API endpoint | `api/src/modules/government/` |
| Email template | `api/src/_shared/mailer.ts` → `sendGovernmentEnquiryEmail` |

The research notes, platform directory and assessment framework live in
[`government-research.md`](government-research.md).

## Content rules

- The platform directory is a list of **assessment candidates**, not clients.
  Do not add a department or portal as a client without a signed agreement.
- Do not claim government empanelment, accreditation, endorsement or a
  partnership that does not exist.
- Security assessments are only performed with written authorisation. The page
  states this explicitly and the enquiry email repeats it.
- The POLYCET journey is a reference workflow, not a claim that Kavi Solutions
  built or operates POLYCET.

## Enquiries

`POST /api/government/enquiries` is public and throttled to 5 requests/minute
per IP. The recipient comes from admin settings (`contact_email`), falling back
to `SMTP_USER`. The email subject is prefixed `[Kavi Government]`.

If SMTP fails the endpoint returns 503 with a direct-email message rather than
an opaque 500. Never ask for citizen data, credentials or documents through
this form.

## Publishing

1. Sign in as an administrator.
2. Open **Admin → Settings → Live pages**.
3. Toggle **Government Technology** to Published.
4. The page is live on the next request; no rebuild is needed.
5. When ready, add a navigation/footer link. Keep it out of the nav until the
   page is published, otherwise visitors hit a 404.

## Future scope

- A proper government-portal assessment register (platform, owner, last review,
  findings, status) instead of a static list.
- Downloadable assessment reports.
- A separate domain/brand if the vertical grows.
