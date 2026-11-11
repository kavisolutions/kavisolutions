# Kavi Financial Services — page handover

Status: **built, not launched.** The page 404s until it is explicitly enabled.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/FinancialPage.tsx` |
| Enquiry forms (individual + business) | `app/components/FinancialForms.tsx` |
| All editable content | `app/lib/financial-data.ts` |
| Route + launch gate | `app/app/financial/page.tsx` |
| API endpoint | `api/src/modules/financial/` |
| Email template | `api/src/_shared/mailer.ts` → `sendFinancialEnquiryEmail` |

## Publish the page

Admins switch `/financial` on and off from the admin panel:
**Settings → Live pages → Financial Services**. A hidden page returns **404**,
is marked `noindex, nofollow`, and no navigation link points at it.

The switch is stored in `app_settings` (`page_financial_enabled`) and read by
the API at `GET /api/pages`. `app/app/financial/page.tsx` checks it on every
request — that is why the route sets `dynamic = "force-dynamic"`. The check
fails closed, so an unreachable API hides the page instead of publishing it.

There is no environment variable and no rebuild involved. `FINANCIAL_PAGE_ENABLED`
is no longer read; remove it from any server env file or Env Manager entry.

## Sections built

Hero · Approach (5 steps) · Two tracks · Individual services (4) ·
Business services (4) · Tax planning · Investment planning · Financial planning
· Cash flow management · Trust & compliance · Client types · Enquiry + FAQ +
contact.

That covers all ten sections the task listed, with the compliance block added
because the task requires regulated boundaries to be visible.

## Enquiry API

`POST /api/financial/enquiries` — public, throttled to 5 requests/minute.

Two tracks share one endpoint. `kind` is `"individual"` or `"business"`:

| Field | Individual | Business |
| --- | --- | --- |
| `name`, `email`, `phone`, `message` | required | required |
| `service` | optional | optional |
| `financialYear` | optional | **rejected** |
| `organisation`, `entityType` | **rejected** | optional |

Mixing tracks returns 400 rather than silently dropping fields from the email.
Mail failures return **503** with an "email us directly" fallback.

Emails are prefixed `[Kavi Financial]` so they filter separately from
contact/survey mail, and `Reply-To` is the enquirer.

## Compliance constraints — read before editing copy

This page makes claims about regulated services. The current copy is
deliberately conservative. If you change it, keep these true:

1. **No registration claims.** The page does not state that Kavi Solutions is a
   registered investment adviser, a CA firm, or a GST practitioner. Do not add
   such a claim unless the registration actually exists and can be evidenced.
   If it does exist, add the registration number and the exact entity name.

2. **Investment content is planning, not advice.** `FINANCIAL_COMPLIANCE` and the
   investment section both state that guidance is educational, that no products
   are sold, that returns are not guaranteed, and that regulated advice must come
   from a registered professional. Do not remove those limits.

3. **No guaranteed outcomes.** "No guaranteed outcomes" exists because tax
   positions depend on facts and on authority decisions. Keep it.

4. **Lawful cash processes.** The cash-flow section states that undocumented
   cash handling and tax evasion are out of scope. This is both a compliance
   statement and a filter for enquiries.

5. **Notice handling is "through qualified professionals."** If that is not
   actually the arrangement, change the wording — do not leave a claim the
   delivery model cannot support.

Before launch, have whoever is accountable for the practice read the page and
confirm each of those statements is true.

## Privacy

- The enquiry form collects name, email, phone, and free-text context. It
  explicitly asks people **not** to send financial documents through it.
- Nothing is stored in this repo's database; submissions are emailed only.
- No PAN, Aadhaar or bank details are requested anywhere on the page.
- If a CRM or document portal is added later, define retention and access rules
  before collecting documents.

## Editing content

Everything visible lives in `app/lib/financial-data.ts`:

| Export | Controls |
| --- | --- |
| `FINANCIAL_HERO` | Hero copy and the four metric tiles |
| `INDIVIDUAL_SERVICES` | The four individual service cards |
| `BUSINESS_SERVICES` | The four business service cards |
| `FINANCIAL_APPROACH` | The five-step method |
| `FINANCIAL_AUDIENCES` | The two-track summary cards |
| `FINANCIAL_COMPLIANCE` | The trust & compliance block — treat as reviewed copy |
| `FINANCIAL_FAQ` | The FAQ accordion |
| `FINANCIAL_INDUSTRIES` | Client-type chips |
| `FINANCIAL_SERVICE_OPTIONS` | Form dropdowns per track |
| `FINANCIAL_ENTITY_TYPES` | Business entity dropdown |
| `FINANCIAL_CONTACT` | Email and location |

Cards size to their content, so adding or removing list items needs no layout
change.

## Adding a navigation link

Once launched, add `/financial` to `app/components/Navbar.tsx` (`links`) and the
services column in `app/components/Footer.tsx`. Keep it out of the nav until the
page is enabled or visitors hit a 404.

## Future dependencies

None of the following is built. They are the pieces the task's future scope
implies.

### 1. Appointment booking
A slot picker with availability, confirmation email and cancellation. Needs a
calendar source of truth and a policy for no-shows.

### 2. Client management
`clients` table linking individuals and entities to engagements, with document
references and status. The enquiry endpoint is currently fire-and-forget email;
a real practice needs the lead captured.

### 3. Document intake
Financial paperwork must not travel by email attachment long-term. This needs
access-controlled upload (signed URLs, per-engagement permissions, retention
and deletion) before any client is asked for documents. The certificates module
already implements the private-bucket pattern that this would reuse.

### 4. Calculators
Income tax (old vs. new regime), budget planner, EMI, SIP, savings goal and
business cash-flow planners. These are pure client-side functions and can ship
without any backend, but the tax ones must be updated every Budget — treat them
as maintained software, not a one-off.

### 5. Compliance calendar
Deadline tracking per client (advance tax instalments, TDS, GST, filing dates)
with reminders. This is the feature that turns a filing service into a
retainer.

### 6. Separate domain
Content is isolated in `financial-data.ts` and the page in `FinancialPage.tsx`
so both can move to a standalone app without rewriting the design.
