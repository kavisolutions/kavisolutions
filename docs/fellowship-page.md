# Kavi Fellowship — page and programme handover

Status: **public page updated to the 11-month programme.** No page gate is used
for the fellowship; it is a published programme page.

## What exists

| Piece | Location |
| --- | --- |
| Page component | `app/components/FellowshipPage.tsx` |
| Hero + 3D programme map | `app/components/FellowshipHero.tsx` + `app/components/fellowship/FellowshipCanvas.tsx` |
| Scroll story | `app/components/FellowshipStory.tsx` + `app/components/fellowship/FellowshipStoryCanvas.tsx` |
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

After the hero, a 500vh sticky section follows one low-poly character through
five acts while the page scrolls:

1. Apply — the cohort gate and sign-up desk.
2. Interview — the candidate meets two Kavi interviewers at a table.
3. Learn & build — a working desk, project screen and mentor.
4. Field — trees, a village hut and community members for DSN immersion.
5. Capstone — a demo-day stage, arch and audience.

The canvas is one lazy-loaded Three.js scene. Scroll progress moves the
character along a path; the camera follows, the walk cycle runs between
stations, and the character switches to waving, handshake, typing and
presenting poses near each station. Overlay copy changes per act, with a
progress bar and step dots. The section is decorative storytelling, not a game:
no keyboard controls, no inventory, no branching. On mobile the same scene
renders at a reduced pixel ratio and the overlay becomes a bottom card. When
WebGL is unavailable, a static stage-icon fallback keeps the story readable.
Under `prefers-reduced-motion`, walk bobbing and particle drift are disabled;
the scene still follows scroll. The story follows the active theme, including
light ground/fog and dark overlay copy in light mode.

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
