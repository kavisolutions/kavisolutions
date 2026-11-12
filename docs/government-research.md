# Government technology — research and assessment notes

This document backs the `/government` page. It is a starting point for
conversations, not a claim that Kavi Solutions has assessed, partnered with or
been authorised by any listed organisation.

## 1. Initial focus: Andhra Pradesh

Start with public platforms where the citizen journey is easy to describe and
the modernisation need is visible. Verify every URL and department name before
outreach; government sites move.

| Platform | Owner / department | Citizen task | Why it is worth studying |
| --- | --- | --- | --- |
| AP POLYCET | Department of Technical Education, AP | Notification → application → hall ticket → result → counselling → admission | High-volume, deadline-driven, multi-stage journey with repeated document handling |
| AP State Government portal | Government of Andhra Pradesh | Find departments, schemes, services and notices | Information architecture and search are the main challenges |
| Andhra University | Andhra University | Admissions, results, notifications, student services | University sites often mix legacy pages with newer portals |
| JNTU Kakinada / JNTU Anantapur | JNTU | Admissions, examinations, results, affiliated colleges | Multiple audiences: students, colleges, faculty |
| Government polytechnic colleges | Department of Technical Education | Admissions, notices, results, student support | Many small sites with inconsistent UX and accessibility |
| AP counselling / admission portals | AP government | Registration, certificate verification, web options, allotment | The hand-offs between stages matter more than any single screen |
| AP Tourism | AP Tourism | Destination discovery, itineraries, bookings | Content-heavy, mobile-first audience, seasonal peaks |

### National / other candidates (later)

| Platform | Citizen task | Why it is worth studying |
| --- | --- | --- |
| EPFO | Member claims, employer filings, passbook | High-stakes, high-volume, frequently criticised UX |
| IRCTC | Search, booking, tatkal, PNR status | Extreme peak load and a high cost of failure |
| TTD | Darshan, accommodation, seva bookings | High demand, queueing, identity and payment complexity |
| State tourism portals | Discovery and bookings | Content and seasonal traffic patterns |

## 2. Assessment method

Do not scan, probe or test a live system without written authorisation. The
desk review below uses only public pages and normal browsing.

### Desk review

1. Pick one end-to-end citizen task, not the homepage.
2. Walk the journey on desktop and mobile.
3. Record where you got stuck, what you had to re-enter and what you could not
   find.
4. Check the public accessibility basics: keyboard navigation, labels, contrast,
   zoom and screen-reader structure.
5. Note performance from a normal connection: first load, large PDFs, blocking
   scripts and image weight.
6. Check whether the same information exists in more than one place and which
   version is current.
7. Record broken links, stale notices and inconsistent department names.
8. Stop at the boundary: no login attempts, no scanning, no exploitation.

### Authorised assessment (after engagement)

- Confirm scope, contacts, test windows and escalation paths in writing.
- Use a staging environment wherever possible.
- Review authentication, authorisation, session handling, secrets, dependency
  risk, API access and database permissions.
- Test peak-load behaviour for result/counselling days.
- Produce a prioritised report with evidence, risk and a recommended sequence.
- Do not publish findings or share them outside the agreed recipients.

## 3. POLYCET journey map

| Stage | Citizen task | Common failure | Modernisation opportunity |
| --- | --- | --- | --- |
| Notification | Find the notification and prospectus | Multiple copies, poor mobile PDFs | Canonical page, HTML summary, change log |
| Registration | Create an account and apply | OTP/payment failures, data loss | Save-and-resume, clear validation, retry |
| Fee payment | Pay and get a receipt | Pending payments, no reconciliation | Idempotent payment flow, receipt download |
| Correction | Fix permitted fields | Unclear windows and rules | Status timeline and explicit rules |
| Hall ticket | Download and check centre | Server overload, missing ticket | Self-service download, centre lookup |
| Examination | Attend the test | Centre/address confusion | Clear instructions and maps |
| Results | Check result and rank | Peak-load errors | Static-first pages, CDN, queueing |
| Counselling | Register and enter options | Confusing seat availability | Guided option entry, phase status |
| Allotment | Check and accept seat | No clear next action | Allotment letter and checklist |
| Admission | Report to college | Duplicate paperwork | Digital checklist and confirmation |

## 4. Reusable assessment framework

Score each area red / amber / green with evidence:

1. **Citizen experience** — task completion, navigation, language, mobile,
   accessibility, error recovery.
2. **Platform health** — performance, availability, peak-load readiness,
   browser/device coverage, observability.
3. **Architecture** — frontend structure, API design, database integrity,
   integrations, deployment and recovery.
4. **Security and privacy** — authentication, authorisation, secrets,
   dependency risk, personal-data handling.
5. **Operations** — ownership, documentation, incident process, backup and
   restore testing.

## 5. Roadmap

### Phase 1 — AP education and examination platforms

- Build the directory and complete desk reviews for POLYCET, AU, JNTU and
  selected polytechnic colleges.
- Prepare a one-page modernisation brief per platform.
- Identify the two or three journeys with the clearest citizen impact.
- Seek written authorisation for a deeper assessment.

### Phase 2 — AP service portals

- Extend the directory to municipal, tourism and public-service platforms.
- Reuse the same assessment framework and report format.
- Build a reusable component and accessibility baseline for future work.

### Phase 3 — national platforms

- Approach EPFO, IRCTC, TTD and state tourism bodies only through the correct
  procurement or partnership route.
- Do not imply empanelment or an existing relationship.

## 6. Deliverables for a real engagement

- Written scope and authorisation.
- Journey map with evidence.
- Prioritised findings (impact × effort × risk).
- Architecture and data-flow notes.
- Security and privacy observations.
- Remediation roadmap with owners and sequencing.
- Handover pack: runbooks, environment notes and training.
