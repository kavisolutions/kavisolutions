# Kavi Fellowship — page and programme handover

Status: **public page plus the admissions-to-alumni admin pipeline are live.**
No page gate is used for the fellowship; it is a published programme page. The
admin workflow covers applications, mentors, interview panels, token scorecards,
offers, onboarding, active fellows and alumni outcomes.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/FellowshipPage.tsx` |
| Hero + 3D programme map | `app/components/FellowshipHero.tsx` + `app/components/fellowship/FellowshipCanvas.tsx` |
| Scroll story | `app/components/FellowshipStory.tsx` + `app/components/fellowship/FellowshipStoryCanvas.tsx` |
| Trust & logistics | `app/components/FellowshipDetails.tsx` + `app/lib/fellowship-data.ts` |
| Outcomes & next steps | `app/components/FellowshipOutcomes.tsx` |
| Mentors & partners | `app/components/FellowshipPeople.tsx` |
| Application form | `app/components/FellowshipApply.tsx` → `POST /api/fellowship-applications` |
| Application status | `app/app/fellowship/status/page.tsx` + `FellowshipStatusLookup.tsx` |
| Admin pipeline | `app/app/admin/fellowship/page.tsx` → applications, interviews, mentors, onboarding, alumni and policy tabs |
| Fellowship applications API | `api/src/modules/fellowship-applications/` |
| Fellowship policy API | `api/src/modules/fellowship-policy/` |
| Mentors API | `api/src/modules/fellowship-mentors/` |
| Interviews and scorecards API | `api/src/modules/fellowship-interviews/` |
| Onboarding API | `api/src/modules/fellowship-onboarding/` |
| Alumni API | `api/src/modules/fellowship-alumni/` |
| Mentor scorecard page | `app/app/mentor/interview/[token]/page.tsx` |
| Mentor portal and review pages | `app/app/mentor/portal/[token]/page.tsx`, `app/app/mentor/review/[token]/page.tsx` |
| Candidate offer/interview pages | `app/app/fellowship/offer/[token]/page.tsx`, `app/app/fellowship/interview/[token]/page.tsx` |
| Alumni self-service page | `app/app/alumni/update/[token]/page.tsx` |
| Delivery, cases, audit APIs | `api/src/modules/fellowship-delivery/`, `fellowship-cases/`, `fellowship-audit/` |
| Reviews, documents, templates APIs | `api/src/modules/fellowship-reviews/`, `fellowship-onboarding/`, `fellowship-templates/` |
| Operations dashboard API | `api/src/modules/fellowship-operations/` |
| Applications + programme tables | `api/src/db/drizzle/migrations/0008_colorful_hiroim.sql`, `0009_deep_wendell_vaughn.sql` |
| Programme guide | `app/app/fellowship/guide/page.tsx` |
| SEO structured data | `app/app/fellowship/page.tsx` |
| Cursor aura + scroll progress | `app/components/FellowshipCursor.tsx` + `app/components/FellowshipScrollProgress.tsx` |
| Month-to-phase map | `app/lib/fellowship-journey.ts` |
| Homepage teaser | `app/components/Fellowship.tsx` |
| Editable content | `app/lib/fellowship-data.ts` |
| Route | `app/app/fellowship/page.tsx` |

The public page covers: who the fellowship is for, the three pillars
(Vipassana, YLTP, DSN), the 11-month curriculum, weekly rhythm, tracks,
mentors, language approach, cohorts and FAQs.

## Hero + 3D programme map

The top section combines the fellowship headline with the interactive
Three.js map: five orbital rings (the five phases) and eleven glowing nodes
(the months). The 3D scene sits directly in the page with no editor window or
app chrome. Under it are fellowship-specific controls: phase pills, a phase
summary with outcomes, and a clickable month timeline. Selecting a phase or a
timeline month highlights the matching ring and months. The canvas can be
dragged to orbit and uses pointer parallax. It also turns, lifts and dollies as
the section travels through the viewport, and a fixed gradient bar at the top
of the page tracks reading progress. `three` is client-only and lazy-loaded
through `next/dynamic` with `ssr: false`, so it never runs on the server or
blocks the first paint. The page also adds a soft cursor aura/ring on fine
pointers (`FellowshipCursor.tsx`); it is decorative, keeps the native cursor,
and is disabled on touch and reduced-motion devices. The month-to-phase map
lives in `app/lib/fellowship-journey.ts` with a unit test. The scene:

- pauses when the section is off-screen or the tab is hidden;
- keeps the scene still (no auto-rotation or node pulsing) when
  `prefers-reduced-motion` is set;
- keeps a CSS orbit fallback, with an honest "WebGL unavailable" label, when
  the browser cannot create a WebGL context;
- disposes geometries, materials, textures and listeners on unmount.

Both canvases are theme-aware. In light mode the orbit switches to a deeper
blue/teal palette with normal blending on a light backdrop, and the story uses
a light ground/fog with dark overlay copy. Switching theme recreates the scenes
with the matching palette.

Phase labels and titles come from `FELLOWSHIP_PHASES`, so copy stays
data-driven. The scene layout assumes the current curriculum: five phases and
eleven months.

## Scroll story

After the hero, a 700vh sticky section follows one low-poly character through
seven acts while the page scrolls:

1. Apply — the cohort gate and sign-up desk.
2. Interview — the candidate meets two Kavi interviewers at a table.
3. Offer — the candidate receives written cohort terms across a desk.
4. Learn & build — a working desk, project screen and mentor.
5. Field — trees, a village hut and community members for DSN immersion.
6. Capstone — a demo-day stage, arch and audience.
7. Alumni — graduates gather around the alumni network.

The canvas is one lazy-loaded Three.js scene. Scroll progress moves the
character along a path; the camera follows with a different framing per act,
the walk cycle runs between stations, and the character switches to waving,
handshake, typing and presenting poses near each station. The character has
jointed limbs, a face, lanyard/badge and a backpack; stations add readable
signage and props (KAVI Fellowship gate, interview table with laptops and
papers, offer letter desk, Live Project screen, DSN field sign and crops,
Demo Day stage, trophy and audience, alumni table). Each station also has an
in-scene process callout that fades in when the character arrives: Apply
(register → choose track → induction), Interview (intro → portfolio/track fit
→ next steps), Offer (written offer → review terms → accept), Learn & Build
(brief → review → ship), DSN Field (listen → serve → document), Capstone
(build → demo → next step) and Alumni (portfolio → next step → network).
Desktop renders real directional shadows; mobile disables the shadow map to
keep the scroll smooth. Overlay copy includes three short action chips per act,
plus a progress bar and step dots. The section is decorative storytelling, not
a game: no keyboard controls, no inventory, no branching. On mobile the same
scene renders at a reduced pixel ratio and the overlay becomes a bottom card.
When WebGL is unavailable, a static stage-icon fallback keeps the story
readable. Under `prefers-reduced-motion`, walk bobbing and particle drift are
disabled; the scene still follows scroll. The story follows the active theme,
including light ground/fog and dark overlay copy in light mode.

## Trust and logistics

`FellowshipDetails.tsx` adds a practical section before the FAQ with six
candidate/family-facing cards:

- who can apply
- money and support
- location and residency
- weekly rhythm and leave
- safety and conduct
- completion and certificate

It also includes a four-step selection timeline (register interest → application
review → conversation → written offer), a compact at-a-glance grid, a
parents/guardians FAQ, a “what we do not promise” panel, and a contact block.
Content lives in `FELLOWSHIP_DETAILS`, `FELLOWSHIP_AT_A_GLANCE`,
`FELLOWSHIP_SELECTION_STEPS`, `FELLOWSHIP_PARENT_FAQ` and
`FELLOWSHIP_NOT_PROMISED` in `app/lib/fellowship-data.ts`.

The application section (`FellowshipApply.tsx`) stores a structured expression
of interest through `POST /api/fellowship-applications`. The API returns a
reference such as `KF-2026-AB12CD34`, sends a team notification and an applicant
confirmation, and records the application in `fellowship_applications`. The
status page at `/fellowship/status` looks up the recorded stage with reference +
email, without exposing internal notes. A repeat application from an email with
an active record is rejected with a 409; use the status page instead.

## Admissions and fellowship lifecycle

The admin pipeline at `/admin/fellowship` now runs the whole lifecycle. The tabs
are **Applications**, **Interviews**, **Mentors**, **Onboarding** and
**Alumni**; cohort/policy terms stay on the Applications tab.

### Stages

`applied → review → interview → waitlisted → offer → accepted → onboarded →
active → completed`, plus the closed branches `rejected` and `withdrawn`.

- `waitlisted` keeps the application open when the cohort is full or the panel
  wants a second look. It is not a rejection.
- `offer` records an offer deadline in `offer_expires_at`. If an admin moves an
  application to Offer without choosing a deadline, the API defaults to seven
  days. The deadline appears on the public status page and in the stage email.
- `completed` automatically creates an alumni record if one does not exist.
- `rejected` and `withdrawn` stop a repeat application for the same email from
  being submitted while the record is active.

### Application review

Admins assign independent reviewers in the **Reviews** tab. Each reviewer gets a
private `/mentor/review/<token>` link with the application, motivation and the
same six-criteria rubric used at interview. Reviewer links expire after 14 days
by default and can be revoked or deleted. Admins can also submit their own
review without using the link.

The review summary shows assigned count, submitted count and average score. Keep
review evidence separate from interview evidence. Internal notes are never
included in applicant email or the public status response.

### Mentors and interview panels

Admins create mentors in the **Mentors** tab: name, email, phone, role/title,
expertise, notes and active/inactive status. Only active mentors can be assigned
to new panels. Deactivating a mentor keeps existing interviews and scorecards.

An interview has a date/time, mode (`online` or `offline`), location, meeting URL
and a panel. A panel can contain:

- one or more mentors from the mentor directory;
- one or more admin email addresses.

At least one panelist is required. Scheduling an interview moves an application
in `applied`, `review` or `waitlisted` to `interview`.

Each panelist gets a private tokenised scorecard link:
`/mentor/interview/<token>`. Mentors do not need a login account. The link shows
the candidate's name, track, cohort, city, motivation, interview time/mode/link
and a six-part scorecard:

| Criterion | What it covers |
| --- | --- |
| Motivation and self-awareness | Why this work, why now, self-understanding |
| Commitment and resilience | Full-time availability, 11 months, Vipassana, field work |
| Communication and collaboration | Clarity, listening, feedback, teamwork |
| Track aptitude / problem solving | Reasoning through a real track scenario |
| Field and service readiness | Respect for community context and willingness to serve |
| Support needs and cohort fit | Support required and whether the cohort can provide it |

Scores are 1–5, with a recommendation of `offer`, `waitlist` or `reject` and
written evidence. Admins can score their own interviews from the Interviews tab
without using the email link. An interview becomes `completed` when every
panelist has submitted. Admins can also mark `no_show`, `cancelled` or manually
`completed`, reschedule, and resend/cancel notifications.

Panel invitation emails include the private scorecard link. Candidate emails
include the time, mode, location/meeting link and panel names. Rescheduling
re-sends the invitation; cancelling sends a cancellation email. Mail failures
are logged but never lose the interview record.

Token links are bearer secrets: anyone with the link can see the candidate's
application details and submit that panelist's scorecard. Treat them as private,
send them only to the named interviewer, and do not forward them. Panel tokens
expire after 14 days by default. Admins can rotate a token (old link stops
working immediately), revoke it, or resend the invitation from the interview
details. A panelist who has already submitted cannot be removed.

Panels can be edited after scheduling. Adding a panelist creates a new token and
sends an invitation; removing an unsubmitted panelist deletes that token.

Each mentor also has a private portal link `/mentor/portal/<token>` that lists
all assigned interviews, scorecard status, candidate confirmations and reschedule
requests. Admins can copy or rotate that link from the Mentors tab.

Candidates receive a private interview page `/fellowship/interview/<token>`.
They can confirm attendance or request a reschedule with a short reason. The
admin sees the confirmation/reschedule request on the interview card. The page
and both invitation emails include a downloadable `.ics` calendar file. Interview
reminders can be sent manually from the Interviews tab or the Dashboard; the
maintenance endpoint sends reminders for interviews in the next 48 hours and
records `reminder_sent_at`.

### Offer, acceptance and waitlist

The offer decision stays with the programme lead. Before moving to Offer, confirm
the written cohort terms: dates, location/residency, fee/contribution,
scholarship, stipend/project payment, accommodation/food, insurance, code of
conduct, POSH/grievance route, completion and early-exit terms, and the response
deadline. These values live in the policy editor; do not put promises in the
public copy that the programme cannot deliver.

- Offer emails include the response deadline when one is set.
- Waitlisted candidates get a position and a review date. The first waitlisting
  assigns the next position and a 30-day review window unless the admin sets one.
- Offer emails link to `/fellowship/offer/<token>` where the candidate can accept
  or decline. The API enforces the offer deadline and records the decision.
- Offer reminders can be run from the Dashboard; the endpoint contacts offers
  expiring within 72 hours and records `offer_reminder_sent_at`.
- Accepted candidates move to onboarding only after the written terms and
  consents are confirmed.
- Never make verbal promises outside the written terms.

### Onboarding

The **Onboarding** tab stores one checklist per application:

- ID verified
- education documents verified
- emergency contact
- medical/accessibility notes
- code of conduct acknowledgement
- POSH and grievance channel acknowledgement
- photo/media consent
- device/data needs
- baseline skills and confidence survey
- Vipassana and residency logistics acknowledgement

The checklist shows `x/8 complete`; emergency contact counts as one required
item. Saving the checklist does not change the stage. Use **Mark onboarding
complete** or move the application to `onboarded` after the induction is done.
Onboarding notes are internal.

Logistics fields cover accommodation, food needs, travel/arrival notes and the
arrival date/time. The **Fellowship** tab stores private documents (PDF/JPG/PNG/
WebP, max 10MB) in the private storage bucket. Documents can be downloaded by
admins, marked verified/rejected and deleted. They are not exposed publicly.

### Active fellowship and completion

The application stages `onboarded`, `active` and `completed` cover the delivery
period. The **Fellowship** tab stores weekly, phase, capstone and exit reviews
with:

- phase and week
- reviewer name/email
- attendance percentage
- deliverable, collaboration and field scores (1–5)
- written evidence
- at-risk flag and support plan

At-risk reviews are highlighted and counted on the Dashboard. Completion still
requires the programme team to confirm attendance, phase reviews, the DSN field
project, a public capstone, an exit interview and a next-step plan. The verifiable
certificate system remains separate (`/verify/<id>`) and is not auto-issued yet.
Moving an application to `completed` sets `completed_at` and creates the alumni
record automatically.

### Alumni

The **Alumni** tab stores:

- name, email, cohort, track
- destination type (employment, freelance/consulting, venture, further study,
  another fellowship, other)
- organisation and role
- 6-month and 12-month outcome notes
- willingness to mentor or speak
- testimonial/publication consent
- internal verification notes

Only publish outcomes that are verified and consented. Do not invent alumni
testimonials or placement claims before the first cohort completes. A record can
be added manually or started from a completed application.

Each alumni record has a next follow-up date, a private self-service link
`/alumni/update/<token>`, verified status, a public story and a publish toggle.
Running alumni follow-ups from the Dashboard emails records whose follow-up is
due and marks `follow_up_sent_at`. Self-service edits can update destination,
organisation, outcomes, mentoring willingness, consent and the story text, but
cannot publish the story. Only records with `story_published` **and**
`testimonial_consent` appear on `/fellowship`; names are shortened to first name
plus initial. The public section stays hidden when there are no consented
stories.

The **Dashboard** also exposes aggregate alumni counts by destination and cohort.
Do not describe these as placement guarantees.

### Cases and audit

The **Cases** tab records confidential POSH, safeguarding, grievance, wellbeing
and other cases. Cases have severity, owner, status, details and resolution,
and are admin-only. This is a record-keeping tool, not a substitute for Kavi's
written investigation and legal process.

Every application stage change, interview, review, document, case, mentor and
alumni change writes to `fellowship_audit_log` with the actor email. The
Dashboard shows the latest entries. The log is append-only through the app; there
is no UI to edit or delete audit rows.

### Dashboard, CSV and bulk actions

The default admin tab is a dashboard with pipeline counts, interview/offer/
completion conversion, upcoming interviews, offers expiring in 72 hours,
pending reviews, at-risk fellows, open cases, waitlist and alumni totals. It also
runs interview, offer and alumni reminder batches.

Applications can be exported to CSV (`GET /api/fellowship-applications/export.csv`,
admin only), filtered by stage/search. The applications list supports checkbox
selection and bulk stage changes through `PATCH /api/fellowship-applications/bulk`.
Deleting an application requires typing `DELETE`; related interview, review,
document, delivery and onboarding rows cascade, and linked alumni records keep
their history with the application link set to null.

### Stage email templates

Stage emails can be overridden from the Dashboard. Templates are keyed
`stage.<stage>` and support `{{name}}`, `{{reference}}`, `{{track}}`,
`{{cohort}}`, `{{stage}}`, `{{offerExpiry}}` and `{{offerUrl}}`. Empty overrides
fall back to the built-in copy. Interview, review, reminder and alumni emails are
still code-managed.

The cohort terms shown in the public “COHORT TERMS” panel and the guide are
admin-editable under `/admin/fellowship` → **Cohort and policy terms**. They are
stored in `app_settings` with the `fellowship.` prefix and exposed through
`GET /api/fellowship-policy`; `PUT /api/fellowship-policy` is admin-only. This
covers fee, scholarship, stipend, accommodation, insurance, eligibility, leave,
next intake, seats and location/residency. Do not set promises the programme
cannot deliver.

The print-friendly programme guide lives at `/fellowship/guide` and covers the
same details plus the parents/guardians letter. The fellowship route also emits
`EducationalOccupationalProgram` JSON-LD.

`FellowshipOutcomes.tsx` adds an honest post-fellowship section: four next-step
paths, the outcome measures that will be published after the first cohort, and a
clear empty state (“first cohort: January 2027”) instead of invented alumni
testimonials. `FellowshipPeople.tsx` lists the existing mentors and the partner
groups and avoids naming unconfirmed partner organisations.

The section is marked as current to November 2026 and says cohort-specific terms
are confirmed in writing before an offer. Do not add stipend, insurance,
accommodation or location promises unless the programme team can deliver them.

The detailed month-by-month plan, assessment weights and mentor map live in
[`fellowship-curriculum.md`](fellowship-curriculum.md).

## Programme shape

| Phase | Months | Focus |
| --- | --- | --- |
| Foundation | 1–2 | Vipassana, habits, communication, digital literacy, first build |
| Craft | 3–5 | Track skills, weekly mentor reviews, YLTP leadership labs |
| Practice | 6–8 | Live projects, DSN field immersion, client communication |
| Specialise | 9–10 | Portfolio, interviews, advanced track, capstone scoping |
| Capstone & launch | 11 | Capstone delivery, demo day, next-step plan |

Tracks: Technology, Research & field operations, Marketing & communications,
Operations & finance.

## Language architecture

English is the primary language; Telugu is the support language. Content is
kept in data files so a fuller Telugu experience can be added without
duplicating the layout. When translated media is added, use a language-first
folder convention:

```
public/fellowship/
  en/
    images/
    video/
  te/
    images/
    video/
```

The page currently renders one English content set. A future language toggle
should read a `language` field from the same data module rather than branching
inside JSX.

## Internal execution plan (not public)

This section is for the team. It is deliberately not rendered on the website.

### Teams

| Team | Responsibility | People |
| --- | --- | --- |
| Marketing (offline + digital) | Content, posters, video, college outreach, social posts, FAQs from the field | Siri, Naveen, Ashok |
| Recruitment & admissions | Identify candidates, interviews, offer letters, induction | Ramesh Raju, Bhavani |
| Admin & facilitation | Space, systems, food, accounts, stipends, legal documents | Naveen, Saidaiah |
| Website & technology | Figma, frontend, backend, DB, cloud, domain, monitoring | Teja, Sriram |
| Execution & curriculum | 11-month plan, daily/weekly/monthly connects, workshops, growth | Srinu, Murali (AchieversIT) |
| Post-fellowship | Mentorship, alumni connect, placement support | Cross-team representatives |

### Outreach sequence

1. Prepare content, posters, audio, YouTube videos and social posts.
2. Identify colleges and build a priority list.
3. Pitch to college management; handle questions from management, parents and
   students.
4. Publish the answers as public FAQs.
5. Run information sessions and collect expressions of interest.
6. Interview, select and issue offer letters.
7. Run induction and the Vipassana course before project work starts.

### Operating rhythm

- Daily debrief during residencies.
- Weekly cohort connect and mentor reviews.
- Monthly progress review with the execution team.
- Quarterly curriculum review with mentors and the founding team.

### Honesty guardrails

- No placement guarantee.
- No salary promise during the learning phase.
- Vipassana is compulsory; say so before selection.
- Fees, scholarships and stipends are explained in the application
  conversation, not collected through the website.
- Certificates are issued only after completion and use the verifiable
  certificate system (`/verify/<id>`).

## API and data map

Public endpoints:

- `POST /api/fellowship-applications` — submit an application.
- `POST /api/fellowship-applications/status` — reference + email lookup.
- `GET /api/fellowship-applications/offer/:token` — load the candidate offer.
- `POST /api/fellowship-applications/offer/:token` — accept/decline an offer.
- `GET /api/fellowship-policy` — public cohort terms.
- `GET /api/fellowship-alumni/public` — consented public stories only.
- `GET/PATCH /api/fellowship-alumni/token/:token` — alumni self-service.
- `GET /api/fellowship-interviews/token/:token` — load a private scorecard.
- `POST /api/fellowship-interviews/token/:token` — submit a private scorecard.
- `GET /api/fellowship-interviews/token/:token/calendar.ics` — panel calendar.
- `GET /api/fellowship-interviews/candidate/token/:token` — candidate interview.
- `POST .../confirm` and `POST .../reschedule` — candidate response.
- `GET .../calendar.ics` — candidate calendar.
- `GET/POST /api/fellowship-reviews/token/:token` — private application review.
- `GET /api/fellowship-mentors/portal/:token` — mentor portal.

Admin-only endpoints (session + admin role/email, rate limited):

- `GET/PATCH /api/fellowship-applications`, `PATCH /bulk`, `DELETE /:id`,
  `GET /export.csv`, `GET /offers/due`, `POST /offers/reminders/run`
- `GET/POST /api/fellowship-mentors`, `PATCH/DELETE /:id`,
  `POST /:id/rotate-portal`
- `GET/POST /api/fellowship-interviews`, `PATCH /:id`,
  `PATCH /:id/panel`, `POST /:id/panel/:panelId/rotate|revoke|resend`,
  `POST /:id/scorecard`, `GET /reminders/upcoming`, `POST /reminders/run`
- `GET /api/fellowship-reviews`, `POST /api/fellowship-reviews`,
  `POST /application/:applicationId/scorecard`, `POST /:id/revoke`, `DELETE /:id`
- `GET /api/fellowship-onboarding`, `GET/PUT /:applicationId`,
  `GET/POST /:applicationId/documents`, `PATCH/DELETE /documents/:id`,
  `GET /documents/:id/file`
- `GET/POST /api/fellowship-delivery`, `PATCH/DELETE /api/fellowship-delivery/:id`
- `GET/POST /api/fellowship-cases`, `PATCH/DELETE /api/fellowship-cases/:id`
- `GET/POST /api/fellowship-alumni`, `PATCH/DELETE /:id`, `GET /summary`,
  `GET /follow-ups/due`, `POST /follow-ups/run`
- `GET /api/fellowship-operations/dashboard`, `GET /api/fellowship-operations/cohorts`
- `GET /api/fellowship-audit`
- `GET /api/fellowship-email-templates`, `PUT/DELETE /:key`
- `PUT /api/fellowship-policy`

Tables in `api/src/db/drizzle/schema.ts`:

- `fellowship_applications` — candidate, stage, cohort, offer/waitlist dates,
  candidate token, completion date, notes.
- `fellowship_mentors` — mentor directory, status and private portal token.
- `fellowship_application_reviews` — assigned pre-interview reviewer scorecards.
- `fellowship_interviews` — schedule, mode, location, status, candidate token,
  confirmation/reschedule/reminder fields.
- `fellowship_interview_panel` — panelist identity, token lifecycle and scorecard.
- `fellowship_onboarding` — checklist and accommodation/travel/food logistics.
- `fellowship_documents` — private document metadata and verification status.
- `fellowship_delivery_reviews` — weekly/phase/capstone/exit reviews and risk flags.
- `fellowship_cases` — confidential POSH/safeguarding/grievance/wellbeing cases.
- `fellowship_alumni` — outcomes, follow-ups, self-service token and public story.
- `fellowship_audit_log` — append-only actor/action trail.
- `fellowship_email_templates` — optional stage-email overrides.

Migrations `0009`, `0010` and `0011` add the admissions, delivery, alumni,
audit, case and template tables. The deploy script runs `npm run db:migrate`
before building the API.

Verification used for this build:

```bash
cd api && npm run type-check && npm run lint && npm test
cd app && npx tsc --noEmit && npm test && npm run build
```

The end-to-end check covers: mentor and portal creation → application → reviewer
assignment and review → interview panel and candidate confirmation → scorecards →
offer with candidate accept/decline → onboarding checklist and private document →
delivery reviews including at-risk flags → completion and automatic alumni
record → alumni follow-up/self-service/public story → dashboard, audit and CSV.

## Still missing

These are the remaining real gaps.

**Automation and scheduling**

- Reminder batches exist as admin-triggered endpoints and Dashboard buttons, but
  no cron or in-process scheduler calls them automatically. Wire the three
  `POST .../run` endpoints into the server cron/monitoring setup.
- Waitlist positions/expiry are stored, but there is no automatic promotion when
  a seat opens. Promotion stays a human decision.
- Interview reschedules are requests; the team confirms the new time manually.

**Admissions analytics**

- Dashboard conversion is stage-based. Time-to-stage, source conversion, saved
  views and interviewer/panel performance are not reported yet.
- CSV export covers applications. A full subject-access export (documents,
  scorecards, emails) is not implemented.

**Delivery and certification**

- Certificate auto-issue and a formal capstone rubric remain separate from the
  delivery review record. Certificates still use the certificates module.
- Attendance is recorded per review as a percentage; there is no daily attendance
  ledger or automated threshold alert.
- Cases are a confidential record. The written POSH/safeguarding investigation,
  legal escalation and response-time commitments must be defined outside this
  app.
- Accommodation/food/travel are notes, not inventory or booking records.

**Alumni**

- Organisation names are free text. There is no employer normalisation or
  aggregate public outcome report beyond the dashboard counts.
- Public stories are reviewed by an admin through the publish toggle; there is no
  separate editorial workflow or scheduled takedown date.
- Alumni follow-up cadence needs a real cron job; the current button sends due
  records only.

**Platform**

- Mentors use private portal links, not login accounts. There is no mentor MFA,
  role scope or per-mentor access revocation beyond rotating the portal token.
- Email templates cover stage emails only. Interview, review, reminder and alumni
  emails are code-managed.
- Telugu parity, captions and translated scorecard guidance are not done.
- SMS/WhatsApp is not configured; email is the only notification channel.
- There is no retention schedule or automated purge for candidate documents and
  scorecards. Application deletion removes related rows, but a written retention
  policy is still needed.
- Automated accessibility checks are not part of CI. The public token pages and
  admin tabs were browser-tested manually.
- Token pages show candidate name, track, city and motivation to the named
  interviewer/reviewer. A formal privacy review of that scope and token lifetime
  is still required.

## Decisions needed from Kavi

1. Who owns admissions day to day, and who sits on interview panels?
2. Offer validity period and waitlist policy (the system defaults to seven days
   for offers and 30 days for waitlist review when no date is chosen).
3. Final fee, scholarship and stipend values.
4. Accommodation, food, insurance and travel policy.
5. Attendance and completion thresholds, early-exit terms and the capstone rubric.
6. POSH/safeguarding owner, escalation route, investigation process and response
   times.
7. Alumni tracking owner, follow-up cadence and who approves public stories.
8. Whether mentors should get real accounts and a portal instead of token links.
9. Who owns the cron/monitoring job for reminders, and the data retention period
   for applications, documents and scorecards.

Until these are confirmed, keep the public copy and policy editor conservative.
The policy editor can hold the final wording without a code change, but legal
and programme review is still required before publishing POSH, code-of-conduct,
fee, scholarship and early-exit terms.

## Future scope

- Cron-backed reminders, waitlist promotion rules and calendar sync.
- Mentor accounts with role scope, MFA and per-assignment access.
- Time-to-stage, source and panel analytics.
- Certificate auto-issue from signed capstone/exit reviews.
- Telugu content parity, captions and SMS/WhatsApp notifications.
- A separate fellowship domain if the programme outgrows this site.
