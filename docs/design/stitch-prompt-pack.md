# Kavi Solutions — Google Stitch Prompt Pack

Copy-paste prompts for [Google Stitch](https://stitch.withgoogle.com).  
Read `kavi-stitch-figma-brief.md` first for the full design system, screen specs, and flows.

> **Rule:** Stitch drifts toward purple and generic AI styling. Keep the Master Style Prompt in every generation, or paste the short reminder line at the top of each screen prompt.

---

## 0. Project setup

- Project name: **Kavi Solutions — Website & Admin**
- Platform: **Web**
- Base theme: **Dark** for public pages, **Light/Dark** for admin
- Desktop frame: **1440 px wide, auto height**
- Mobile frame: **390 × 844 px**
- Generate one screen per prompt. Split very long pages into two prompts if Stitch truncates.

---

## 1. Master Style Prompt

Paste this first, then keep it in the project context.

```text
Design the Kavi Solutions website and admin console. Kavi Solutions is a senior digital product studio in India. The tone is premium, calm, technical and honest — a studio that ships real work, not a startup that hypes.

Use ONLY this design system.

COLOURS
- Page background: #0B1220 (near-black navy)
- Raised surface: #111C2E
- Deepest surface / logo tile: #06060F
- Glass card: rgba(18, 29, 47, 0.84), 1px border rgba(148, 163, 184, 0.14), 16px backdrop blur
- Headings: #F7F9FC
- Body copy: #A5B3C7
- Captions / metadata: #7889A0
- Accent words and text links: #91B4FF
- Primary button: #175CD3 background, white text, hover #1849A9
- Secondary button: transparent glass, white text, 1px rgba(255,255,255,0.15) border
- Success: #34D399. Warning: #FBBF24. Error: #F87171.
- Do not introduce any other colour.

TYPE
- Display: Space Grotesk, 600/700, tight tracking.
- Body: Geist, 400/500.
- Eyebrows: 11px uppercase, 0.2em tracking, 600.
- Hero H1: 72px desktop / 60px tablet / 36px mobile.
- Page H1: 60px desktop / 36px mobile.
- Section H2: 48px desktop / 30px mobile. Card H3: 18–24px. Body: 16–18px.

SHAPE AND LAYOUT
- Desktop content max width: 1152px. Hero copy max width: 896px.
- Section padding: 96–128px vertical, 24px horizontal.
- Cards: 24px radius. Buttons and inputs: 12px radius. Pills: 999px.
- Floating navbar: 16px from top, 1152px max width, 12px radius, glass.
- Soft blue glow orbs (#3B82F6 at 15–30% opacity, 64px blur) behind heroes.
- Hairline dividers: rgba(255,255,255,0.08).

AVOID
- Purple-dominant AI styling, neon, rainbow gradients, 3D blobs.
- Glassmorphism on every element.
- Pure black #000000 backgrounds.
- Generic stock photos, fake client logos, fake testimonials.
- Extra colours, extra fonts, lorem ipsum.
```

### 1.1 Optional first generation — style tile

Use this once to lock the palette before generating screens. Keep the result as a reference.

```text
Create a single desktop style tile for the Kavi Solutions design system, 1440×900, dark navy #0B1220 background.

Show, clearly labelled:
- Colour swatches: Ink #0B1220, Ink Soft #111C2E, Text #F7F9FC, Mist #A5B3C7, Fog #7889A0, Accent #91B4FF, Primary #175CD3, Primary hover #1849A9, Success #34D399, Warning #FBBF24, Error #F87171.
- Type scale in Space Grotesk and Geist: Hero 72, Page title 60, Section 48, Card 24, Body 16, Caption 12, Eyebrow 11 uppercase.
- Buttons: primary #175CD3, secondary glass, destructive red, disabled.
- One glass card sample with rgba(18,29,47,0.84) fill, 1px rgba(148,163,184,0.14) border, 24px radius, 16px blur.
- One gradient strip for the Kavi logo: #2563EB → #06B6D4 → #8B5CF6.
- Radius samples: 24px card, 12px button/input, 999px pill.

No extra colours. No purple AI theme. No decorative 3D shapes.
```

---

## 2. Public screen prompts

### P01 — Home

```text
Design a long desktop website home page for Kavi Solutions, 1440px wide, auto height, using the Kavi design system from the master prompt.

NAVBAR: floating glass bar 16px from top, 1152px max width, 12px radius. Left: logo tile with a gradient K + "Kavi Solutions" wordmark. Centre links: Showcase, Projects, Fellowship, Team. Right: "Login" text link + solid #175CD3 "Let's Talk" button. Mobile view uses a hamburger and right-side drawer.

HERO: centered, fills the first viewport. Pill badge "Digital product studio · India & beyond" with a small blue dot. H1 72px Space Grotesk: "Ideas become experiences. We build the rest." with "experiences." in #91B4FF. Subcopy: "Kavi Solutions is a full-stack digital studio crafting stunning web apps, native mobile apps, product experiences and growth marketing — engineered to impress and built to perform." Two buttons: "Start your project →" (#175CD3) and "Explore services" (glass). Below: a joined 4-tile stat strip: 120+ Projects shipped, 40+ Happy clients, 6+ Years crafting, 99% On-time delivery. Soft blue/violet glow orbs behind the hero.

SHOWCASE: eyebrow "Showcase", H2 "Four doors into the work", subcopy. Four glass cards in a 2×2 grid. Each card: icon tile, small tag pill, title, description, 3–4 link chips, "Explore … →".
1. Engineering & technology — "Web, mobile, product and AI" — "From marketing sites and full web apps to mobile products and production AI or blockchain systems — one engineering team across the stack." Chips: Web, Mobile, Product, AI & Blockchain.
2. Growth & marketing — "Campaigns that compound" — "SEO, paid acquisition, content and analytics wired into one growth system — measured against pipeline, not vanity impressions." Chips: SEO, Paid ads, Content, Analytics.
3. Kavi Fellowship — "Eleven months to build a career" — "A cohort programme for diploma students, final-year students, graduates and people returning to work — built around real projects, Vipassana and field practice." Chips: 11 months, Vipassana, YLTP, DSN.
4. Selected work — "See what we have shipped" — "Live products, platforms and client builds — with the stack, scope and links. A portfolio is a better argument than a service list." Chips: Portfolio, Web platforms, Mobile apps, Case studies.

EMERGING TECH: eyebrow "Emerging technology", H2 "AI and blockchain, without the theatre", two large glass cards side by side. AI card (violet→fuchsia glow): "AI that earns its place in the product", copy, chips "LLM apps & agents", "RAG & private knowledge", "Document intelligence", "Computer vision". Blockchain card (cyan→sky glow): "Trust infrastructure, not hype", copy, chips "Smart contracts", "Audit trails", "Tokenisation", "Wallet integration". Both have "Explore capability →".

WHY KAVI: H2 "Built to impress. Engineered to last." Four cards with a 4px gradient top bar: Performance first, Design that sells, Secure by default, Shipped to scale. Each icon, title, 1–2 line description.

FELLOWSHIP TEASER: pill "Fellowship", H2 "Launch your career with Kavi Fellows", subcopy, three cohort pills (January 2027, May 2027, September 2027), four glass cards: Mentorship, Build in public, Network, Opportunities. CTA "Apply for the fellowship →".

TEAM: H2 "The people behind the magic", 4-column grid of member cards with photo or initials on a coloured gradient tile, name, role in blue, LinkedIn/portfolio links.

CONTACT: split layout. Left: eyebrow "Let's talk", H2 "Have a project in mind? Let's build it.", copy, email kavisolutions1@gmail.com, "Worldwide · Remote-first". Right: glass form with name, email, phone, service select, message textarea, full-width primary "Send message →". Soft sky and violet glows behind.

FOOTER: logo, "Web · Mobile · Product · Marketing · AI · Fellowship", links, copyright.

Use real copy above. No lorem ipsum. No extra sections.
```

### P02 — Service detail (Web template)

```text
Design a desktop service detail page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Use the Web Development variant: violet #8B5CF6 → purple #A855F7 accent.

HERO: centered, violet glow orbs left and right. Small uppercase pill with 🌐 icon: "WEB DEVELOPMENT". H1: "Websites & web apps that win customers" with the second phrase in #91B4FF. Subcopy: "From blazing-fast marketing sites to full-scale web applications — we design, build and deploy web experiences that are fast, secure and beautiful on every screen." Buttons: "Start your project →" (violet gradient) and "Explore features" (glass). Four metric tiles in a joined strip: 80+ Web projects shipped, 90+ Average Lighthouse score, <1s Typical load time, 100% Mobile responsive.

FEATURES: H2 "What we build", 8 cards in a 4-column grid, 2 rows. Cards: icon tile, title, 1–2 line description, glass surface, hover lift.
Corporate websites; E-commerce stores; SaaS dashboards; Web portals; Headless CMS; SEO-first builds; Progressive web apps; Landing pages.

PROCESS: H2 "Our web process", 5 stacked glass rows. Each row: violet gradient number tile (01–05), title, description.
01 Discover; 02 Design; 03 Build; 04 Launch; 05 Grow.

STACK: H2 "Technologies we use", centred chips: Next.js, React, TypeScript, Node.js, Tailwind CSS, PostgreSQL, Redis, Nginx, Docker, Vercel / VPS.

FAQ: H2 "Common questions", 4 accordion rows with + icons.

CTA: full-width violet-to-purple gradient panel with white heading "Ready to launch your web presence?", copy "Tell us about your project and we'll come back with a plan within 24 hours.", white button "Get in touch →".

Keep the layout reusable for Mobile, Product, Marketing and AI & Blockchain by swapping the gradient and copy.
```

### P03 — Projects

```text
Design a desktop Projects page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt.

HEADER: small logo wordmark above, centred H1 "Our Projects" with "Projects" in #91B4FF, subcopy "Products we've designed, built and shipped — from web platforms to mobile apps."

FILTERS: centred pills: All (active, #175CD3), App, Web. Inactive pills are white/5 with mist text.

GRID: 2 columns, 6 project cards. Each card: 48px gradient icon tile with 🚀, type badges top-right (APP, WEB) in sky-blue tint, project name, 2-line description, skill chips, footer links "Visit website" and "Open app". Use sample project names and neutral descriptions; note "sample data" in your output. Cards are glass with 24px radius, hover lift.

EMPTY/LOADING STATES: show one frame with a centred "Projects are being updated. Please check back soon." message.

CTA: centred "Want a project like these? Let's talk" button.

No fake client logos. No stock images.
```

### P04 — Fellowship

```text
Design a long desktop Fellowship page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Accent: violet #7C3AED → sky #0EA5E9.

HERO: violet and sky glow orbs. Pill "🎓 KAVI FELLOWSHIP". H1: "Eleven months to build a life you can stand behind." with the second phrase in #91B4FF. Subcopy: "A cohort-based fellowship for diploma students, final-year students, graduates and people returning to work. Learn by doing real projects, sit with silence, lead in the field and leave with a portfolio — not just a certificate." Buttons: "Register your interest →" (solid #175CD3 primary) and "See the 11-month journey" (glass). Four metrics: 11 Months, full journey; 3 Core practices; EN + TE English primary, Telugu support; Cohort Learn with a team. Footnote: "English primary · Telugu support · No placement guarantee".

WHO IT'S FOR: H2 "If you are willing to do the work, the door is open", six bullets for diploma graduates, final-year students, graduates without direction, women returning to work, people who discontinued formal education, professionals re-skilling.

THREE PILLARS: three glass cards — Vipassana (silence and self-awareness), YLTP (leadership practice), DSN (field service).

CURRICULUM: H2 "From foundation to a public capstone", vertical 5-phase timeline: Foundation (months 1–2), Craft (3–5), Practice (6–8), Specialise (9–10), Capstone & launch (11). Each phase: month range, focus, 2–3 bullet outcomes.

WEEKLY RHYTHM: H2 "A week that has a shape", then a 4-column card grid (7 day cards: Mon Learning sprint, Tue Build, Wed Mentor review, Thu Build / field, Fri Leadership lab, Sat Reflection, Sun Rest). Each card: day label in violet, focus, 1-line detail.

TRACKS: four cards — Technology, Research & field operations, Marketing & communications, Operations & finance.

MENTORS & LANGUAGE: two-column panel: mentor cards with initials/photo; language note English primary, Telugu support.

COHORTS: H2 "The next intake", three cohort cards (January 2027, May 2027, September 2027) with status.

FAQ: H2 "The honest answers", accordion with no placement guarantee, no salary promise, Vipassana compulsory, fees explained in conversation.

APPLY: solid #175CD3 CTA panel "Give the next eleven months a direction" + white button "Register your interest →" and outline "Email the team".

No hype. No salary or placement promises.
```

### P05 — Team

```text
Design a desktop Team page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt.

HEADER: wordmark, H1 "Meet the Team" with "Team" in #91B4FF, subcopy "The people behind Kavi Solutions — a small, senior team obsessed with craft."

SUMMARY STRIP: glass card with "12 Members" and a primary "Manage team →" button (admin variant) plus a secondary "Edit my profile →" (member variant).

GRID: 4 columns, 8 member cards. Each card: 96px photo or initials on a gradient tile (violet, sky, emerald, fuchsia, amber, rose, indigo, lime), name, role in blue, LinkedIn icon and "View portfolio" link. Centre-aligned, 24px radius, glass, hover lift.

Use neutral sample names or "Member name" placeholders; do not invent real people or use AI-generated faces. Add an empty state: "Team details are being updated. Please check back soon."

No fake client logos.
```

### P06 — Login

```text
Design a desktop Login screen for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt.

LAYOUT: #0B1220 full-screen background. Centered glass card, 448px wide, 32px radius, 32px padding. Logo wordmark "Kavi Solutions" above the card. Subtle blue glow orb behind.

CARD CONTENT: H1 "Login" in Space Grotesk, subcopy "Sign in to manage your team profile and the website." Email input, password input, inline red error slot, full-width primary "Sign in" button. Divider with "or". Full-width white "Continue with Google" button with the Google G mark. Footer note: "Team logins are created by an admin. Contact support@kavisolutions.in if you need access." Below the card: "← Back to home".

STATES: default, signing-in (button label "Signing in…", disabled), invalid credentials error, Google "Redirecting…".

Inputs: 12px radius, white/5 fill, 1px white/10 border, focus border #91B4FF at 60%.
```

### P07 — Member profile

```text
Design a desktop Member Profile screen for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt.

LAYOUT: #0B1220 background. Centered content max 672px. Logo wordmark, H1 "My Profile", caption "Signed in as member@kavisolutions.in".

CARD: glass, 24px radius, 24px padding. Top row: 80px avatar (photo or gradient initials) + "Change photo" glass button. Form fields stacked: Name, Role select, Portfolio URL (optional), LinkedIn URL (optional), read-only Team row, "Card colour" gradient picker with 8 circular swatches: violet, sky, emerald, fuchsia, amber, rose, indigo, lime. Bio textarea (4 rows). Footer actions: primary "Save profile", secondary "View team page", ghost "Sign out" on the right.

STATES: logged-out card with "Login" CTA; no-member card "No team profile — ask an admin to add you"; upload in progress; save success in emerald; save error in red.

Use 12px radius inputs, white/5 fill, white/10 border.
```

### P08 — Certificate verification

```text
Design a desktop Certificate Verification page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt.

LAYOUT: #0B1220 background, content max 768px. Wordmark top-left. Eyebrow "CERTIFICATE VERIFICATION" in fog, H1 "Verify a Kavi Solutions certificate" with "certificate" in #91B4FF. Subcopy: "Every certificate we issue carries a unique ID and a QR code. Enter the ID printed on the document to confirm it was issued by Kavi Solutions and has not been revoked."

FORM: monospace uppercase input with placeholder "KV-FEL-2026-0001" + primary "Verify" button on the same row. Loading label "Checking…".

RESULT CARD — VALID: emerald banner with check icon, "Certificate verified", "Issued by Kavi Solutions and currently valid.", certificate ID right-aligned. Body: seal label "FELLOWSHIP · KAVI FELLOWS PROGRAMME", title "Kavi Fellowship — Completion", fields Awarded to "Sample Recipient", Programme, Role, Period, Issued on, Certificate type, Summary. No public PDF download.

RESULT CARD — REVOKED: red banner, warning icon, "Certificate revoked", "This document is no longer valid. Contact us if you believe this is an error.", same metadata.

OTHER STATES: "Check the ID" amber notice for invalid format; "No certificate found" amber notice with submitted ID; red "Something went wrong" service error.

Show the valid and revoked result cards side by side as separate frames, plus a small state strip for idle/loading/invalid/missing/error.
```

### P09 — Survey & Research (gated)

```text
Design a long desktop Survey & Research page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Accent: teal #14B8A6 → emerald #10B981.

HERO: teal/emerald glow orbs. Pill "🔎 SURVEY & RESEARCH SOLUTIONS". H1: "Field research, survey data and insight you can act on." with the second phrase in #91B4FF. Subcopy: "We design surveys, run field teams across districts and states, clean and analyse the data, and deliver reports and presentations that answer the question you actually asked. Government, institutional, academic and private-sector assignments." Buttons: "Discuss a survey project →" (teal→emerald) and "Join the survey network" (glass). Four metrics: 6 Research verticals; 5 Engagement models; PAN-INDIA Field network; END-TO-END Design to report.

SECTIONS:
1. Approach — "Research you can defend", 5 steps (01–05) in a 5-column strip.
2. Six research verticals — 6 cards with emoji icon, title, bullet list.
3. Market research band — narrative with a pull quote.
4. Field operations & network — copy, checklist, capability table.
5. Data analysis & reporting — "From raw responses to a decision", 3-step flow.
6. Predictive research — "Forecasting that states its limits".
7. Academic support — card with a clear "no fabricated data" note.
8. Engagement models — 5 pricing/engagement cards.
9. Industries + opportunities — sector chips; opportunities labelled "under discussion", not clients.
10. Join network + client enquiry — one glass card with a two-tab switch: "Client / project enquiry" and "Join our survey network".
    - Client fields: name, email, phone, organisation, service, message.
    - Surveyor fields: name, email, phone, location, languages, experience, about.
    - States: idle, sending, sent, error.
11. FAQ — two columns: client questions, surveyor questions.
12. Contact strip.

Use teal accents only for this page. No fake client logos. Mark the opportunities section as "under discussion".
```

### P10 — Financial Services (gated)

```text
Design a long desktop Financial Services page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Accent: emerald #10B981 → teal #14B8A6.

HERO: emerald/teal glow orbs. Pill "💼 FINANCIAL SERVICES". H1: "Tax, planning and cash flow — handled properly." with "handled properly." in #91B4FF. Subcopy: "Support for individuals and businesses across income tax filing, tax planning, budgeting, cash-flow management and long-term financial planning. Where a service is regulated, it is delivered through appropriately qualified professionals." Buttons: "Request a consultation →" (emerald→teal) and "Explore services" (glass). Four metrics: 2 Tracks: individual & business; 5 Service areas; YEAR-ROUND Not just filing season; DOCUMENTED Every engagement.

SECTIONS:
1. Approach — "Advice that starts with your numbers", 5 steps.
2. Two tracks — Individual and Business cards.
3. Individual services — 4 cards: ITR filing, tax planning, budgeting, financial planning.
4. Business services — 4 cards: bookkeeping, GST, payroll, cash-flow.
5. Tax planning — checklist + note "No guaranteed outcomes".
6. Investment planning — goal-based planning, education-only, no products sold.
7. Financial planning — written plan, not a conversation.
8. Cash flow management — "Know what is coming before it arrives".
9. Trust & compliance — conservative compliance statement; include "not a registered investment adviser / CA firm / GST practitioner" boundary as a neutral note, not a badge.
10. Client types — chips.
11. Enquiry — glass card with Individual / Business tabs.
    - Common: name, email, phone, message.
    - Individual: service, financial year.
    - Business: organisation, financial year, entity type, service.
    - Note: "Please do not send PAN, Aadhaar, bank details or financial documents through this form."
    - States: idle, sending, sent, error.
12. FAQ accordion.

No guaranteed returns. No claim of registration. No document upload.
```

### P11 — Government Technology (gated)

```text
Design a long desktop Government Technology page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Accent: blue #2563EB → cyan #06B6D4.

HERO: blue/cyan glow orbs. Pill "🏛️ GOVERNMENT TECHNOLOGY SERVICES". H1: "Modern public platforms. Better citizen journeys." with the second phrase in #91B4FF. Subcopy: "We help government departments, universities, examination boards and public institutions modernise websites, portals and service workflows — across data, frontend, backend and security. Assessments are only carried out with written authorisation." Buttons: "Discuss a modernisation brief →" and "Explore focus areas". Four metrics: 3 Layers: data, frontend, backend; AP-FIRST Initial focus; CITIZEN-FIRST Journey-led modernisation; AUTHORISED Assessments only.

SECTIONS:
1. Approach — "Start with the citizen journey, not the homepage", 5 steps.
2. Focus areas — 6 cards.
3. Platform directory — table of assessment candidates (platform, owner, stage), clearly labelled "assessment candidates, not clients".
4. POLYCET reference journey — horizontal 7-step timeline from notification to admission, labelled "reference workflow, not a claim that Kavi built or operates POLYCET".
5. Assessment framework — 5-step repeatable framework.
6. Security — written authorisation only; no citizen data, credentials or documents through the form.
7. Capabilities — data, frontend, backend.
8. FAQ — "Before you brief us".
9. Enquiry — glass form: name, email, phone, organisation/department, role, portal name/URL (optional), service, message. States idle/sending/sent/error.

No empanelment, accreditation, endorsement or partnership claims.
```

### P12 — Kavi Farms (gated)

```text
Design a long desktop Kavi Farms page for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt. Accent: emerald #10B981 → lime #84CC16.

HERO: emerald/lime glow orbs. Pill "🌾 KAVI FARMS". H1: "From our fields to your table — and back to the village." with the second phrase in #91B4FF. Subcopy: "Farm-grown products and weekend village experiences from Polepalli, Palnadu. Buy seasonal produce directly from the farm, or spend three days living and working alongside the people who grow it." Buttons: "Explore farm products →" and "Weekend village experience". Four metrics: 2 Tracks: products & tourism; 3 DAYS Weekend village experience; POLEPALLI Palnadu, Andhra Pradesh; DIRECT Farm to customer.

SECTIONS:
1. About — the farm and the village.
2. Farm products — "Grown here, packed here", product cards (grains & millets, pulses, cold-pressed oils, seasonal produce). Every price is "Price on enquiry". No checkout.
3. Farm tourism — "Three days in a real village", package card with inclusions and honest limits (working farm, not a resort; no guaranteed waterfalls or weather).
4. Itinerary — 3-day timeline.
5. Destinations — cards for temples, water and village lanes.
6. Gallery — labelled placeholder grid until real photos are supplied.
7. FAQ — "Before you book".
8. Enquiry — glass card with Farm products / Village visit tabs.
    - Common: name, email, phone, message.
    - Product: product, quantity.
    - Tourism: month, group size, service.
    - States: idle, sending, sent, error.

No prices, no hotel-style promises, no stock photos.
```

### P13 — Contact form states

```text
Design four states of the Kavi Solutions contact form as desktop frames, 1440px wide, using the Kavi design system from the master prompt.

Shared layout: split section on #0B1220. Left column: eyebrow "LET'S TALK", H2 "Have a project in mind? Let's build it.", copy "Tell us what you want to create. We'll reply within 24 hours with a plan and a quote.", email kavisolutions1@gmail.com, "Worldwide · Remote-first" with icons. Right column: glass form.

Fields: name, email, phone, service select (Web development, Mobile app, Digital product, Digital marketing, Fellowship, Something else), message textarea, full-width primary button.

STATE 1 — IDLE: empty fields, button "Send message →".
STATE 2 — SENDING: filled fields, button "Sending..." disabled.
STATE 3 — SUCCESS: fields reset, button "✓ Message sent!", quiet emerald confirmation.
STATE 4 — ERROR: fields retained, red inline "Something went wrong. Please try again.", button "Send message →" enabled.

Show all four frames side by side. Keep the same dimensions and alignment.
```

---

## 3. Admin screen prompts

> Admin uses shadcn-style surfaces, Geist throughout, 8px cards, 6px buttons/inputs, 256px sidebar, 64px top bar. Light primary `#2563EB` on `#F8FAFC`; dark primary `#3B82F6` on `hsl(222 47% 7%)`. Generate light and dark variants. Use sample rows but do not invent real people.

### A01 — Admin access states

```text
Design three desktop admin access states for Kavi Solutions, 1440px wide, using the Kavi design system from the master prompt, but with shadcn-style admin tokens.

FRAME 1 — LOADING: full-screen admin background. Centered blue-tinted rounded icon tile with a spinner, text "Loading workspace…" in muted foreground.

FRAME 2 — SIGNED OUT: centered card, 448px wide, 8px radius, white surface. "K" tile in primary blue, H1 "Admin Portal", description "Sign in with an authorised administrator account to access this workspace.", full-width primary "Sign In to Continue", small link "← Return to public team page".

FRAME 3 — ACCESS DENIED: centered card. Red-tinted shield icon tile, H1 "Access Denied", copy "member@example.com is not listed as an administrator for Kavi Solutions.", outline "Sign out" button, "← Return to public team page" link.

Use light theme. Add a dark-theme variant of the signed-out card.
```

### A02 — Admin shell + Team members

```text
Design a desktop admin console screen for Kavi Solutions, 1440px wide, using the admin design system: 256px left sidebar, 64px sticky top bar, 1152px max content, light theme (#F8FAFC canvas, white cards, #2563EB primary, #E2E8F0 borders). Add a dark-theme variant.

SIDEBAR: logo tile + "Kavi Solutions" + green dot "Admin Console". Section label "WORKSPACE". Nav items with icons and count badges: Team members (12), Roles (4), Teams (3), Projects (8), Certificates (24), Surveyors (15), Social agent, Administrators (2), Settings. Active item: light blue background, blue text, 1px blue border. Bottom user card: avatar initials, email, "Administrator", logout icon.

TOP BAR: breadcrumb "Kavi Solutions > Workspace > Team members", right side: theme toggle (sun/moon), outline "Live team page ↗".

MAIN: eyebrow "WORKSPACE / ADMINISTRATION" in blue, H1 "Team members", description "Manage your public team directory and member profiles", right side: count pill "12 members" + primary "Add member" button.

FILTERS: search input "Search by name, role or team…", role select "All roles", team select "All teams".

TABLE: columns Member (avatar + name + email), Role (blue chip), Team (neutral chip), Order, Actions (edit, delete icons). 8 rows. Use sample names and roles: "Sample Member", "Frontend Engineer", "Design", etc. Hover row. Toolbar shows "Showing 8 of 12".

Add a compact mobile variant: sidebar collapsed into a drawer, filters stacked, table becomes member cards.
```

### A03 — Roles and teams

```text
Design two desktop admin management screens side by side for Kavi Solutions, 1440px wide, using the admin design system and light theme.

SCREEN 1 — ROLES: page header "Roles", description "Define titles and job responsibilities". Card with inline input "New role name" + primary "Add role". List of 6 role rows: name, member count, inline rename pencil, delete icon. Empty state below.

SCREEN 2 — TEAMS: same structure, title "Teams", description "Organize people into functional teams and departments". 4 team rows.

Include a delete confirmation dialog: "Delete role 'Designer'? Members with this role will be set to unassigned." Cancel + destructive Delete.

Use table rows with 1px borders, 16px padding, 8px radius cards.
```

### A04 — Projects admin

```text
Design a desktop Projects admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: eyebrow "WORKSPACE / ADMINISTRATION", H1 "Projects", description "Manage featured work, tech stacks, and live links", right: "8 projects" pill + primary "Add project".

TABLE: columns Project (rocket icon tile + name + 1-line description), Types (APP/WEB badges), Links (app/web URLs), Order, Actions (edit/delete). 6 rows. Use a clean admin table with 1px row borders and hover state.

ADD/EDIT MODAL: centered, 640px, white card, 8px radius. Fields: name, description textarea, project types checkboxes (App, Web), app link, web link, skills chip editor with "Add skill" input, sort order number. Footer: Cancel + primary "Save project". Show a helper line: "The public card shows a website button, an app button, or both based on the selected types."

Include an empty state: "No projects yet. Add your first project."
```

### A05 — Certificates admin

```text
Design a desktop Certificates admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: eyebrow "WORKSPACE / ADMINISTRATION", H1 "Certificates", description "Issue, revoke and reinstate verifiable certificates", right: "24 certificates" pill + primary "Issue certificate".

FILTERS: search "Search by ID, recipient or programme…", status select "All statuses" with options All, Issued, Revoked only (4), Deleted only (2). Add a quiet amber/red notice row when revoked or deleted records exist.

TABLE: columns Certificate (ID in monospace + type), Recipient, Programme / period, Issued on, Status (badge: issued/revoked/deleted), PDF (attached/—), Actions (edit, revoke, delete, upload PDF, open public verification). 7 rows. Sample IDs: KV-FEL-2026-0001, KV-INT-2026-0003, etc.

ISSUE MODAL: 640px. Fields: certificate ID with helper "Format: KV-FEL-2026-0001", type select, recipient name, programme, role, start date, end date, issued on, summary textarea. Footer: Cancel + primary "Issue certificate". Inline error slot.

REVOKE DIALOG: small destructive dialog: "Revoke KV-FEL-2026-0001?", recipient, reason textarea, Cancel + destructive "Revoke certificate". Note: "Public verification changes immediately."

Show the table plus the issue modal and revoke dialog as separate frames.
```

### A06 — Surveyors admin

```text
Design a desktop Surveyors admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: eyebrow "WORKSPACE / ADMINISTRATION", H1 "Surveyors", description "Review and verify the field surveyor network", right: "15 surveyors" pill + primary "Add surveyor".

FILTERS: search "Search by name, email, location or language…", status select with counts: All 15, Applied 6, Verified 4, Active 3, Inactive 1, Rejected 1.

TABLE: columns Surveyor (name + email + phone), Location, Languages (chips), Status badge, Actions (edit, verify, activate, reject, delete). 6 rows with sample data.

ADD/EDIT MODAL: name, email, phone, location, languages (comma-separated), skills (comma-separated), experience textarea, notes textarea, status select. Helper: "New registrations always arrive as Applied. Verifying stamps the date; rejecting clears it."

Status colors: applied amber, verified sky-blue, active emerald, inactive muted, rejected red.
```

### A07 — Social agent

```text
Design a desktop Social agent admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: eyebrow "WORKSPACE / ADMINISTRATION", H1 "Social agent", description "Plan a year of images, generate captions and publish on schedule", right: "Run due" secondary button.

STATUS STRIP: 4 small cards — Scheduler (On, 08:30 IST), Auto-publish (Off), Vision provider (Gemini), Accounts (LinkedIn, Facebook, Instagram connected). Include a green "Reachable" dot.

IMPORT CARD: title "Import from Google Drive", fields: folder link, start date, topic hint (optional), primary "Import". Progress row with counts and an error list slot.

UPLOAD CARD: "Add images manually", drag-and-drop area, supporting copy, secondary "Choose files".

CALENDAR: card titled "Calendar" with month picker "November 2026", status filter, and a vertical list (not a month grid). Each row: 80px thumbnail, status badge (Planned, Draft ready, Published, Skipped, Missed, Failed), editable date input, topic-hint input, description preview, and actions: Draft now, Skip/Restore, Delete. Show 6 rows.

RECENT DRAFTS: table with topic, caption preview, targets, status, created date, "Publish" button.

Use blue/amber/emerald/muted/red status chips. No fake analytics.
```

### A08 — Administrators

```text
Design a desktop Administrators admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: H1 "Administrators", description "Control workspace access and administrative privileges", right: "2 administrators" pill.

ADD CARD: input "admin@kavisolutions.in" + primary "Add administrator". Helper: "The person must already have a Kavi login. Adding them grants admin access."

LIST CARD: two rows — "ops@kavisolutions.in" with source badge ENV and note "Configured by environment", "founder@kavisolutions.in" with source badge DB and a remove action. Include a confirm dialog: "Remove admin privileges for founder@kavisolutions.in?"

Use 8px radius cards, 1px borders, muted metadata.
```

### A09 — Settings and live pages

```text
Design a desktop Settings admin screen for Kavi Solutions, 1440px wide, using the admin design system and light theme.

HEADER: H1 "Settings", description "Update company profile and public page metadata".

CARD 1 — COMPANY PROFILE: tagline input, description textarea, contact email input, primary "Save settings". Helper: "Used in the public team page and as the recipient for enquiries."

CARD 2 — LIVE PAGES: four rows, each with page name, route, one-line blurb, and a toggle:
1. Survey & Research — /survey — "Field surveys, market research and the surveyor network." — On
2. Financial Services — /financial — "Tax filing, planning, accounting and cash flow support." — Off
3. Government Technology — /government — "Modernisation, security and digital service delivery for public platforms." — Off
4. Kavi Farms — /farms — "Farm products, village experiences and weekend tourism packages." — Off

Helper: "A hidden page returns 404 and has no navigation link. Changes take effect on the next request."

Show a save-success toast and an error banner slot.
```

### A10 — Member add/edit modal

```text
Design a desktop Add/Edit Member modal for Kavi Solutions, using the admin design system and light theme.

Centered modal, 640px wide, max-height 90vh, scrollable. Header "Add team member" with close icon. Body fields:
- Name, Role, Team
- Email + temporary password (add only)
- Bio textarea
- Profile URL, LinkedIn URL
- Sort order
- Image upload dropzone with preview
- Card colour gradient picker: 8 circular swatches
Footer: Cancel + primary "Save member". Inline error slot at the top of the body.

Helper: "Email and password create the member's login. On edit, leave the password blank to keep it unchanged."

Use 6px inputs, 8px card, 1px borders.
```

### A11 — Certificate issue/revoke overlays

```text
Design two desktop overlay frames for Kavi Solutions admin, using the admin design system and light theme.

FRAME 1 — ISSUE CERTIFICATE: centered 640px modal. Fields: Certificate ID (helper "KV-FEL-2026-0001"), Type select, Recipient name, Programme, Role, Start date, End date, Issued on, Summary textarea. Footer Cancel + primary "Issue certificate". Inline error slot.

FRAME 2 — REVOKE CERTIFICATE: 480px destructive dialog. Title "Revoke KV-FEL-2026-0001?", recipient "Sample Recipient", reason textarea, warning "Public verification will show this certificate as revoked immediately." Footer Cancel + destructive "Revoke certificate".

Use red only for destructive action and warning. No other accents.
```

### A12 — Project add/edit modal

```text
Design a desktop Add/Edit Project modal for Kavi Solutions, using the admin design system and light theme.

Centered 640px modal. Header "Add project". Fields: name, description textarea, project type checkboxes (App, Web), app link, web link, skills chip editor with existing chips and an "Add skill" input, sort order. Footer Cancel + primary "Save project".

Helper: "App and Web control the badges and the buttons shown on the public Projects page."

Show a filled state with 4 skill chips.
```

### A13 — Surveyor add/edit modal

```text
Design a desktop Add/Edit Surveyor modal for Kavi Solutions, using the admin design system and light theme.

Centered 640px modal. Header "Add surveyor". Fields: name, email, phone, location, languages (comma-separated), skills (comma-separated), experience textarea, notes textarea, status select.

Helper: "New registrations arrive as Applied. Verifying stamps the date; rejecting returns the profile to Applied."

Footer Cancel + primary "Save surveyor". Inline error slot.

Use 6px inputs, 8px card, 1px borders.
```

---

## 4. Flow prompts

Use these to generate connected frames. If Stitch cannot connect frames, generate each screen and wire them in Figma.

### F01 — Public lead flow

```text
Create a 4-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system from the master prompt.

1. HOME: hero with "Start your project →" highlighted.
2. CONTACT: scrolled to the contact section, form filled with Name "Anita Rao", Email "anita@example.com", Phone "+91 98765 43210", Service "Web development", Message "We need a marketing site and a client portal."
3. SENDING: same form, button "Sending..." disabled.
4. SUCCESS: same form, fields reset, button "✓ Message sent!", quiet emerald confirmation.

Connect left-to-right. Label the connection "Submit enquiry".
```

### F02 — Authentication and role flow

```text
Create a 4-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system.

1. LOGIN: email/password form with "Sign in".
2. LOADING: centered "Loading workspace…" with spinner.
3. ADMIN CONSOLE: Team members screen with sidebar active.
4. MEMBER TEAM PAGE: public team page with "Edit my profile →".

Add a branch from Login to "Access Denied" for a signed-in non-admin. Label branches "Admin" and "Member".
```

### F03 — Certificate lifecycle flow

```text
Create a 5-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system.

1. ADMIN CERTIFICATES: table with 24 certificates, "Issue certificate" primary.
2. ISSUE MODAL: filled with ID KV-FEL-2026-0001, type Fellowship, recipient "Sample Recipient", programme "Kavi Fellows 2026", issued on 14 Nov 2026.
3. PUBLIC VERIFY: input with the ID and "Verify" button.
4. VALID RESULT: emerald "Certificate verified" card with metadata.
5. REVOKED RESULT: red "Certificate revoked" card with the same metadata.

Connect 1→2→3→4, then a branch from 4 to 5 labelled "Revoke in admin".
```

### F04 — Surveyor onboarding flow

```text
Create a 4-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system.

1. SURVEY PAGE: scrolled to "Join our survey network" tab, filled with name, email, phone, location, languages, experience.
2. SUCCESS: "Registration received" state.
3. ADMIN SURVEYORS: table with the new row status "Applied".
4. VERIFIED: same row status "Verified" with a green badge and verified date.

Label connections "Register", "Review", "Verify".
```

### F05 — Gated page publishing flow

```text
Create a 3-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system.

1. ADMIN SETTINGS: "Live pages" card with Survey & Research toggle Off.
2. SAME SCREEN: toggle On, success toast "Survey & Research page published".
3. PUBLIC SURVEY PAGE: hero visible, with navigation link "Survey" now present.

Label connections "Publish" and "Next request".
```

### F06 — Social agent flow

```text
Create a 4-screen desktop flow for Kavi Solutions, 1440×900 each, using the Kavi design system.

1. SOCIAL AGENT: import card + status strip.
2. CALENDAR: month grid with image thumbnails and "Planned" chips.
3. DRAFT READY: day cell with "Draft ready" status and a caption preview.
4. PUBLISHED: "Published" status, recent drafts table showing the post.

Label connections "Import", "Draft", "Approve & publish".
```

---

## 5. Mobile prompts

Generate these at **390 × 844 px**. Keep the same palette and type scale (H1 40px, H2 30px, body 16px).

### M01 — Home mobile

```text
Design the mobile version of the Kavi Solutions home page, 390×844, using the Kavi design system. Stack everything in one column. Navbar becomes a compact glass bar with logo + hamburger. Hero H1 40px, subcopy 16px, buttons full-width stacked. Stat strip becomes 2×2. Showcase cards stack. Section padding 64px. Keep the dark navy background and #175CD3 CTA.
```

### M02 — Service detail mobile

```text
Design the mobile version of the Kavi Solutions Web Development service page, 390×844, using the Kavi design system. Hero centered, H1 40px, buttons full-width stacked, metrics 2×2. Feature cards single column. Process rows stack with number tiles. Stack chips wrap. FAQ full-width. Gradient CTA panel full-width.
```

### M03 — Verify mobile

```text
Design the mobile version of the Kavi Solutions certificate verification page, 390×844, using the Kavi design system. Input and Verify button stack full-width. Valid result card stacks metadata in one column. Show a revoked variant below. Keep the emerald/red banners.
```

### M04 — Login mobile

```text
Design the mobile version of the Kavi Solutions login page, 390×844, using the Kavi design system. Full-screen #0B1220, centered glass card with 24px padding, 16px side margins. Inputs full-width. Primary and Google buttons full-width. Keep the support note below.
```

### M05 — Admin mobile

```text
Design the mobile version of the Kavi Solutions admin Team members screen, 390×844, using the admin design system. Top bar with hamburger, logo, theme toggle. Sidebar becomes a 288px right-side drawer. Main content: page title, count pill, Add member button, stacked search + filters, member cards instead of a table. Each card: avatar, name, email, role chip, team chip, edit/delete actions. Use light theme.
```

---

## 6. Correction prompts

Use these when Stitch drifts.

### Fix colour drift

```text
Recolour this screen to the exact Kavi palette. Page background #0B1220. Raised surfaces #111C2E. Primary button #175CD3 with #1849A9 hover. Headings #F7F9FC. Body #A5B3C7. Captions #7889A0. Accent words #91B4FF. Remove every colour not in this list.
```

### Remove default purple AI styling

```text
Remove the purple/pink AI-style gradients. This is a premium dark navy studio site, not a generic AI product. Use only #175CD3 for primary actions and the documented vertical gradient for the page accent. Keep the rest of the layout.
```

### Fix typography

```text
Set headings to Space Grotesk 600/700 with -0.02em tracking. Set body to Geist 400. Use 72px hero H1 on desktop, 36px on mobile, 48px section H2, 30px mobile section H2, 16–18px body. Remove any other font families. Make eyebrows 11px uppercase with 0.2em tracking.
```

### Increase admin density

```text
Make this admin screen denser and more tool-like. 256px sidebar, 64px top bar, 8px card radius, 6px input radius, 13–14px table text, 48px rows, 24px card padding. Remove decorative gradients and oversized headings.
```

### Fix glass contrast

```text
Use the exact glass recipe: background rgba(18,29,47,0.84), 1px border rgba(148,163,184,0.14), 16px backdrop blur, 24px radius. Increase text contrast where needed. Do not turn every surface into glass; only cards and the navbar.
```

### Remove stock imagery

```text
Remove all stock photography and photorealistic people. Use the existing icon tiles, gradient initials, product screenshots and abstract glow orbs. Keep the layout and spacing.
```

### Add missing states

```text
Add the missing states for this component: default, hover, loading, success, error, empty. Keep the same dimensions and design system. Show them as a row of frames.
```

### Responsive reflow

```text
Create a 390px mobile version of this desktop screen. Stack cards in one column, make buttons full-width, collapse the navbar into a drawer, reduce section padding to 64px, and keep the same palette and type hierarchy.
```

---

## 7. Generation checklist

- [ ] Master prompt pasted before the first screen.
- [ ] Home generated first and approved.
- [ ] Every screen uses `#0B1220` + `#175CD3`.
- [ ] No unlisted colours.
- [ ] Space Grotesk headings, Geist body.
- [ ] Glass cards use the exact recipe.
- [ ] Public screens are desktop 1440; mobile variants are 390.
- [ ] Admin screens exist in light and dark.
- [ ] Modals and dialogs generated separately.
- [ ] Flow frames generated for the six core journeys.
- [ ] Screens exported/pasted to Figma with the naming from the brief.
