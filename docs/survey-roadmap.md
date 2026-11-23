# Survey & Research — build roadmap

Status of the five business priorities and the next engineering steps.

## 1. Surveyor network — **baseline built**

Already live:

- `surveyors` registry with name, contact, primary role, location, coverage,
  availability, capacity, languages, skills, experience, notes and status.
- Structured role: surveyor / field executive / coordinator / researcher /
  analyst.
- Coverage, availability and capacity fields, editable by admins.
- Public registration from the survey frontend, including role and coverage.
- Admin review at **Survey services → Users**: view submission, filter by role,
  verify, activate, reject, edit, audit history, CSV export.
- Retention purge (`npm run surveyors:purge`) and audit log.

Next improvements:

- Travel radius and rate fields for assignment planning.
- Duplicate detection across phone/email and a merge workflow.
- Availability calendar instead of free text.

## 2. Reusable survey templates — **content built, admin library pending**

Six starting templates already exist in
[`survey-templates.md`](survey-templates.md):

- Political and public opinion
- Product and brand
- Customer satisfaction
- Government scheme and social impact
- Household
- Academic research

Next:

- Move templates into an admin-managed library with versioning.
- Add language variants and mode variants (face-to-face, phone, online).
- Attach a template to a project and track the version used.
- Keep consent, back-check and data-minimisation rules in every template.

## 3. Survey management platform — **future**

Proposed phases:

1. Projects and assignments: project → surveyor assignment → quotas → status.
2. Mobile data collection: offline forms, GPS with consent, photos, sync.
3. Validation: back-checks, duplicate detection, logic checks, audit trail.
4. Monitoring: daily submissions, coverage, completion rates, field activity.
5. Reporting: aggregation, dashboards and exportable reports.

This is a separate application from the public survey frontend. The existing
`surveyors`, `survey_enquiries` and `survey_content` tables stay the shared
source of truth for the website; project/assignment tables should be added only
when the platform work starts.

## 4. Reporting as a separate revenue stream — **service lines live**

The public page already sells:

- Research data analysis and reporting.
- Prediction-Based Research & Presentations.
- Academic & Institutional Research Support.
- Analysis & reporting as an engagement model.

Next:

- Productise fixed-scope packages: data cleaning, analysis, report, deck,
  dashboard.
- Publish sample deliverables and turnaround ranges.
- Track reporting-only leads separately from fieldwork leads.

## 5. Industry and location expansion — **sector list live**

Current sectors include government, private companies, research institutions,
academia, NGOs, political campaigns, market research agencies, FMCG, telecom,
infrastructure, healthcare, education and financial services.

Next:

- Maintain a target list by district/state and sector.
- Add case studies only where assignment references are confirmed.
- Track opportunities as “under discussion”, never as clients before agreement.

## Recommended next build

1. Admin-managed survey template library.
2. Project/assignment tables only after the template library is stable.
