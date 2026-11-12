# Kavi Fellowship — page and programme handover

Status: **public page updated to the 11-month programme.** No page gate is used
for the fellowship; it is a published programme page.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/FellowshipPage.tsx` |
| Homepage teaser | `app/components/Fellowship.tsx` |
| Editable content | `app/lib/fellowship-data.ts` |
| Route | `app/app/fellowship/page.tsx` |

The public page covers: who the fellowship is for, the three pillars
(Vipassana, YLTP, DSN), the 11-month curriculum, weekly rhythm, tracks,
mentors, language approach, cohorts and FAQs.

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

## Future scope

- A real application form and admissions pipeline (the current CTA goes to the
  contact form).
- A fellows/alumni portal with cohort, track and mentor records.
- Telugu content parity and video captions.
- A separate fellowship domain if the programme outgrows this site.
