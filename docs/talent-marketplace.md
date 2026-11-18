# Internal talent marketplace — product specification

Status: **design ready, not built.** This is the internal people-management tool
described in task #203. It is for Kavi Solutions staff and initiative owners,
not a public job board.

## Problem

The same pool of people can support many initiatives, but availability,
location, skills and engagement terms live in different places. Initiative
owners leave capacity unused because they cannot see who is free, what they can
do and how they should be engaged.

## Users and roles

| Role | Can do |
| --- | --- |
| Admin | manage people, skills, initiatives, rates and access |
| Initiative owner | create an initiative, request people, approve time |
| Team lead | manage assignments for their initiative |
| Contributor | maintain profile, availability, skills and timesheets |
| Finance | see engagement terms, approved time and payout reports |
| Viewer | read-only dashboard |

## Core data

- **Person:** name, email, phone, location, timezone, skills, languages,
  availability, capacity (hours/week), status, engagement model.
- **Engagement model:** `monthly-retainer`, `hourly`, `volunteer`, `stipend`,
  `mixed`, `custom`. Each has a rate, currency, effective dates and notes.
- **Initiative:** name, owner, description, status, required skills, location,
  time commitment, budget, start/end dates.
- **Assignment:** person, initiative, role, allocation %, start/end, engagement
  model, status (`proposed`, `active`, `paused`, `completed`).
- **Availability:** recurring weekly windows plus exceptions.
- **Timesheet:** person, initiative, date, hours, task note, approval status.
- **Skill:** canonical skill list with aliases, so "React" and "React.js" match.
- **Audit log:** who changed a rate, assignment or profile.

## Matching

Rank candidates by:

1. required skill match (must-have before nice-to-have);
2. availability overlap with the initiative's working window;
3. location or remote suitability;
4. prior collaboration and feedback;
5. cost fit against the initiative budget.

Show *why* a person matched, not just a score. Owners can override, but the
override is recorded.

## Main screens

- **Dashboard:** open initiatives, unfilled roles, utilisation, upcoming
  over-allocation.
- **People:** searchable pool with skills, location, availability and current
  allocation.
- **Person profile:** skills, engagement history, availability, documents,
  rate history (restricted).
- **Initiative:** roles, assigned people, budget vs. actual, timeline.
- **Match:** ranked candidates for a role; propose, accept, decline.
- **Timesheets:** weekly entry and approval; export for finance.
- **Reports:** utilisation, bench, cost by initiative, skill gaps.

## Rules

- A person cannot be allocated above 100% without an explicit override.
- Rates are visible only to admin and finance.
- Volunteer and paid engagement are separate models; never hide a paid
  engagement as volunteer work.
- Every rate or allocation change writes an audit entry.
- Personal data is internal; no public profile and no third-party sharing.

## Implementation plan

**Phase 1 — people and initiatives (MVP)**
- Tables: people, skills, person_skills, initiatives, assignments,
  availability.
- Admin CRUD and a simple match list.
- No timesheets or payouts yet.

**Phase 2 — time and cost**
- Timesheets, approvals, rate history, utilisation reports.
- CSV export for finance.

**Phase 3 — matching and planning**
- Skill normalisation, availability overlap, allocation warnings, scenario
  planning.

This belongs in the admin application, not the public marketing site. It can
reuse the existing auth, admin shell and audit patterns.
