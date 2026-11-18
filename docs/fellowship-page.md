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

Admins read the motivation, commitments, track, city and internal notes, then
move the application to `review` or `interview`. Keep interview evidence in the
scorecard rather than only in the free-text notes. Internal notes are never
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
send them only to the named interviewer, and do not forward them. There is no
expiry or revocation UI yet; deleting the interview/panel row is not currently
exposed.

### Offer, acceptance and waitlist

The offer decision stays with the programme lead. Before moving to Offer, confirm
the written cohort terms: dates, location/residency, fee/contribution,
scholarship, stipend/project payment, accommodation/food, insurance, code of
conduct, POSH/grievance route, completion and early-exit terms, and the response
deadline. These values live in the policy editor; do not put promises in the
public copy that the programme cannot deliver.

- Offer emails include the response deadline when one is set.
- Waitlisted candidates stay open and can be moved to Offer later.
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

### Active fellowship and completion

The application stages `onboarded`, `active` and `completed` cover the delivery
period. The current admin system records the stage, cohort and internal notes.
Weekly mentor reviews, attendance, phase assessments, at-risk flags and capstone
sign-off are **not yet structured records**; see “Still missing” below.

Completion requires the programme team to confirm attendance, phase reviews, the
DSN field project, a public capstone, an exit interview and a next-step plan.
The verifiable certificate system remains separate (`/verify/<id>`). Moving an
application to `completed` creates the alumni record automatically.

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
- `GET /api/fellowship-policy` — public cohort terms.
- `GET /api/fellowship-interviews/token/:token` — load a private scorecard.
- `POST /api/fellowship-interviews/token/:token` — submit a private scorecard.

Admin-only endpoints (session + admin role/email, rate limited):

- `GET /api/fellowship-applications`, `PATCH /api/fellowship-applications/:id`
- `GET/POST /api/fellowship-mentors`, `PATCH/DELETE /api/fellowship-mentors/:id`
- `GET/POST /api/fellowship-interviews`, `PATCH /api/fellowship-interviews/:id`,
  `POST /api/fellowship-interviews/:id/scorecard`
- `GET /api/fellowship-onboarding`, `GET/PUT /api/fellowship-onboarding/:applicationId`
- `GET/POST /api/fellowship-alumni`, `PATCH/DELETE /api/fellowship-alumni/:id`
- `PUT /api/fellowship-policy`

Tables in `api/src/db/drizzle/schema.ts`:

- `fellowship_applications` — candidate, stage, cohort, offer expiry, notes.
- `fellowship_mentors` — mentor directory and active/inactive status.
- `fellowship_interviews` — schedule, mode, location, meeting link, status.
- `fellowship_interview_panel` — panelist identity, private token and scorecard.
- `fellowship_onboarding` — one checklist row per application.
- `fellowship_alumni` — outcomes and consent, optionally linked to an application.

Migration `0009_deep_wendell_vaughn.sql` creates the mentor, interview, panel,
onboarding and alumni tables and adds `offer_expires_at`. Apply migrations before
deploying the API:

```bash
cd api
npm run db:migrate
```

Verification used for this build:

```bash
cd api && npm run type-check && npm run lint && npm test
cd app && npx tsc --noEmit && npm test && npm run build
```

The end-to-end check covers: create mentor → submit application → schedule panel
→ submit mentor and admin scorecards → move to offer (expiry default) → save
onboarding → accepted/onboarded/active/completed → automatic alumni record →
public status lookup. The mentor scorecard page and all five admin tabs are
also tested in the browser.

## Still missing

These are real gaps, not hidden behind the pipeline UI.

**Admissions operations**

- Structured pre-interview review scoring with two reviewers, a rubric and a
  weekly calibration call. Review is currently a stage plus internal notes, not a
  scored record.
- Reviewer assignment and reviewer-level comments separate from free-text notes.
- Panel editing after scheduling (add/remove/replace a panelist) needs an API and
  UI. Today cancel and reschedule the interview if the panel changes.
- Scorecard token expiry, revocation and “resend link” controls.
- Calendar integration (Google Calendar/ICS), automated reminders, and a
  candidate self-serve reschedule flow.
- Waitlist position, expiry and automatic conversion when a seat opens.
- Offer reminder automation before the deadline and an acceptance confirmation
  flow for candidates.
- CSV export, bulk stage changes, saved views and conversion/time-to-stage
  analytics.
- Audit log for who changed a stage or scorecard.
- Email template editing. Interview, stage and offer copy lives in
  `api/src/_shared/mailer.ts` and needs a developer to change.

**Onboarding and delivery**

- Document upload/storage and verification status (ID, education, signed
  consents). The checklist only records that a human verified them.
- Structured weekly mentor reviews, attendance, phase assessments, deliverable
  tracking and at-risk flags. The `active` stage is currently a label plus notes.
- Capstone rubric, exit interview and certificate auto-issue. Certificates stay
  in the separate certificate module.
- Accommodation, food, device and travel logistics records.
- Safeguarding/POSH case management. The acknowledgement is recorded, but there
  is no incident workflow or restricted-access case log.

**Alumni**

- Automated 6-month and 12-month follow-up reminders.
- Consent-aware public alumni stories and outcome reporting.
- Employer/organisation normalisation and aggregate outcome dashboard.
- Alumni self-service profile updates.

**Platform**

- Mentor accounts/portal. Token links are deliberate for now, but mentors cannot
  log in to see all their assigned interviews.
- Telugu parity, captions and translated scorecard guidance.
- SMS/WhatsApp notifications.
- Data retention, export and deletion policy for candidate documents and
  scorecards.
- Automated accessibility checks for the public status, scorecard and admin
  screens.
- Privacy review of what candidate data is shown on the token page and for how
  long tokens remain valid.

## Decisions needed from Kavi

1. Who owns admissions day to day, and who sits on interview panels?
2. Offer validity period and waitlist policy (the system currently defaults to
   seven days when no deadline is chosen).
3. Final fee, scholarship and stipend values.
4. Accommodation, food, insurance and travel policy.
5. Attendance and completion thresholds, and early-exit terms.
6. POSH/safeguarding owner, escalation route and response times.
7. Alumni tracking owner and the 6/12-month follow-up cadence.
8. Whether mentors should get real accounts and a portal instead of token links.

Until these are confirmed, keep the public copy and policy editor conservative.
The policy editor can hold the final wording without a code change, but legal
and programme review is still required before publishing POSH, code-of-conduct,
fee, scholarship and early-exit terms.

## Future scope

- Mentor/panel accounts with a dashboard of assigned interviews.
- Attendance, phase review, at-risk and capstone records on the application.
- Calendar, reminder and waitlist automation.
- A consented public alumni outcome report after the first cohort.
- Telugu content parity and captions.
- A separate fellowship domain if the programme outgrows this site.
