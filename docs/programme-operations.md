# Programme operations — outreach, care, money and pathways

Status: **built and wired to the admin console.** This is the operational layer
around the fellowship and the proposed Gurukulam pathway. It records offline
work; it does not collect online payments.

## Routes

| Piece | Location |
| --- | --- |
| Admin console | `app/app/admin/programme/page.tsx` |
| Config-driven registers | `app/lib/programme-admin.ts` + `app/components/admin/programme/ProgrammePanel.tsx` |
| Dashboard | `app/components/admin/programme/ProgrammeOverview.tsx` |
| Stipend generator | `app/components/admin/programme/StipendGenerator.tsx` |
| Public Gurukulam page | `app/app/gurukulam/page.tsx` + `app/components/GurukulamPage.tsx` |
| Public support / donation pledge | `app/app/fellowship/support/page.tsx` + `app/components/DonationPledge.tsx` |
| Public enquiry form | `app/components/FellowshipTalk.tsx` |
| Public field FAQs | `app/components/FellowshipFieldFaqs.tsx` |
| API module | `api/src/modules/fellowship-programme/` |
| Tables and migration | `api/src/db/drizzle/schema.ts`, `0012_small_ozymandias.sql`, `0013_whole_silver_centurion.sql` |
| Daily reminders | `api/src/modules/fellowship-programme/fellowship-automation.service.ts` |

## Admin tabs

`/admin/programme` has:

- **Overview** — outreach, content, care, fees, payroll, client work, placements,
  donations and Gurukulam counts.
- **Colleges** — priority list, contacts, stage (`identified → contacted →
  meeting → session → partner`), follow-up date and notes.
- **Sessions** — classroom, parent and management sessions with mode, audience,
  attendance and owner.
- **Field FAQs** — questions from students, parents and management. An answered
  question set to `published` appears on `/fellowship` under “Questions we heard
  in the field.”
- **Content** — posters, photos, video, audio, YouTube, social posts, polls and
  blog items. Manual impressions, engagements, comments and leads fields make
  social performance visible tomorrow without an external API.
- **Care queue** — phone, WhatsApp, email, social, walk-in and website
  enquiries, with category, priority, owner, callback time and resolution.
  Website enquiries from `/fellowship#talk` land here.
- **Fees** — offline contribution ledger per application. Tracks total,
  scholarship, paid amount, balance and payment status. The site never collects
  payment.
- **Payroll** — month-by-month intern stipend rows. The generator creates months
  6–11 at the base amount and month 12 onward at the increased amount. Existing
  months are skipped.
- **Client work** — client engagements, contract value, received amount,
  balance, owner and status.
- **Placements** — employer, role, package, offer/join dates and source.
- **Donations** — pledges, receipts, purpose, recognition preference and
  anonymity.
- **Gurukulam** — new-candidate and returner leads, with a link to an existing
  application after conversion.

## Public intake

- `POST /api/fellowship-programme/public/inquiries` — enquiry queue + email to
  the configured contact address. Throttled to 5/minute per IP.
- `POST /api/fellowship-programme/public/gurukulam-interests` — Gurukulam or
  returner interest.
- `POST /api/fellowship-programme/public/donation-pledges` — pledge only; no
  payment details.
- `GET /api/fellowship-programme/public/faqs` — published field answers only.

The admin API is a whitelisted generic route set:

```
GET    /api/fellowship-programme/dashboard
GET    /api/fellowship-programme/admin/:resource
POST   /api/fellowship-programme/admin/:resource
PATCH  /api/fellowship-programme/admin/:resource/:id
DELETE /api/fellowship-programme/admin/:resource/:id
POST   /api/fellowship-programme/stipends/generate
POST   /api/fellowship-programme/automation/run
```

`resource` is one of `colleges`, `sessions`, `questions`, `content`,
`inquiries`, `fees`, `stipends`, `clients`, `placements`, `donations` or
`gurukulam`. Admin routes are session + admin guarded and write to
`fellowship_audit_log`.

## Money model

- Training contribution is recorded against a fellowship application (or as a
  standalone name/email row).
- Client work is recorded as a contract and received amount. It is the second
  income source.
- The proposed intern stipend starts at month 6; month 12 onward uses the
  increased amount. It is a stipend under written terms, not a salary guarantee.
- No gratitude/exit fee is recorded or charged.
- Donations and grants can cover scholarship, equipment, travel or a stipend
  bridge. Pledges are confirmed in writing before money is accepted.
- No online payment, card details, bank details or document upload is collected
  by the public programme pages.

## Automation

`FellowshipAutomationService` runs daily at **06:00 Asia/Kolkata** when
`FELLOWSHIP_AUTOMATION_ENABLED=true` (default). It calls the existing reminder
logic for:

- interviews in the next 48 hours,
- offers expiring in the next 72 hours,
- alumni follow-ups due.

The same batch can be run manually from `/admin/fellowship` → Dashboard or
`POST /api/fellowship-programme/automation/run`. Set the env flag to `false` to
keep only the manual buttons.

## Gaps that remain external

- Instagram/LinkedIn/Facebook/YouTube insights are recorded manually, not pulled
  through platform APIs.
- Video and audio production happens outside the app; the content register
  tracks the item and its status.
- Payroll records a paid status and reference; it does not initiate bank
  transfers.
- Donation receipts and tax treatment must be confirmed by the legal/accounts
  team. The public page does not claim tax exemption.
- WhatsApp remains the unofficial Baileys session. Official Meta verification,
  templates and delivery receipts are still out of scope.
- A formal Gurukulam cohort, fee schedule, stipend amounts and placement
  commitments still need written programme decisions.
