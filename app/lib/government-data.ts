/* Content for the Kavi Government Technology Services page.
 *
 * The platform lists are assessment candidates, not clients or partners. Keep
 * that framing when editing: naming a department as a client without an
 * agreement is a legal and reputational risk. The page is gated in the admin
 * panel until it is ready to publish.
 */

export type GovernmentFocusArea = {
  slug: string;
  icon: string;
  title: string;
  summary: string;
  items: string[];
};

export type GovernmentPlatformGroup = {
  id: string;
  title: string;
  summary: string;
  platforms: string[];
};

export type GovernmentJourneyStep = {
  step: string;
  title: string;
  summary: string;
  improvements: string[];
};

export type GovernmentCapability = {
  title: string;
  icon: string;
  items: string[];
};

export const GOVERNMENT_CONTACT = {
  email: "kavisolutions1@gmail.com",
  location: "Hyderabad, India · Working with public-sector teams across India",
} as const;

export const GOVERNMENT_HERO = {
  eyebrow: "Government Technology Services",
  title: "Modern public platforms.",
  highlight: "Better citizen journeys.",
  description:
    "We help government departments, universities, examination boards and public institutions modernise websites, portals and service workflows — across data, frontend, backend and security. Assessments are only carried out with written authorisation.",
  metrics: [
    { value: "3", label: "Layers: data, frontend, backend" },
    { value: "AP-first", label: "Initial focus" },
    { value: "Citizen-first", label: "Journey-led modernisation" },
    { value: "Authorised", label: "Assessments only" },
  ],
} as const;

export const GOVERNMENT_APPROACH = [
  {
    step: "01",
    title: "Map the journey",
    summary:
      "Start with what a citizen, student or applicant actually has to do — not with the homepage.",
  },
  {
    step: "02",
    title: "Assess the platform",
    summary:
      "Review usability, accessibility, performance, architecture, data handling and security with authorisation.",
  },
  {
    step: "03",
    title: "Prioritise the gaps",
    summary:
      "Separate quick operational fixes from structural work, and sequence them by citizen impact and risk.",
  },
  {
    step: "04",
    title: "Modernise in layers",
    summary:
      "Frontend, backend and data changes delivered incrementally so live services keep working.",
  },
  {
    step: "05",
    title: "Measure and hand over",
    summary:
      "Document the architecture, runbooks and improvements, then train the department team to operate them.",
  },
] as const;

export const GOVERNMENT_FOCUS_AREAS: GovernmentFocusArea[] = [
  {
    slug: "website-modernisation",
    icon: "🏛️",
    title: "Government website modernisation",
    summary:
      "Replace outdated interfaces and navigation with responsive, accessible services that work on the devices citizens actually use.",
    items: [
      "Responsive UI/UX across desktop, tablet and mobile",
      "Plain-language information architecture",
      "Accessibility improvements aligned to public-sector expectations",
      "Performance, caching and reliability work",
      "Modern frontend and browser compatibility",
      "Content governance so notices and updates are easy to publish",
    ],
  },
  {
    slug: "security-compliance",
    icon: "🛡️",
    title: "Security & compliance",
    summary:
      "Reduce avoidable exposure across the frontend, APIs, authentication and data stores — with responsible, authorised testing only.",
    items: [
      "Security posture review and prioritised remediation",
      "Authentication, authorisation and session hardening",
      "Secure API and database access patterns",
      "Secrets, configuration and dependency hygiene",
      "Audit logging and incident-readiness documentation",
      "Privacy and data-handling safeguards",
    ],
  },
  {
    slug: "digital-services",
    icon: "🧾",
    title: "End-to-end digital services",
    summary:
      "Improve the complete citizen journey: registration, payments, status tracking, downloads and support — not just the landing page.",
    items: [
      "Online registration and application flows",
      "Fee payment and receipt integration readiness",
      "Application status and correction workflows",
      "Hall tickets, results and rank-card downloads",
      "Counselling, allotment and reporting journeys",
      "Notifications and citizen support touchpoints",
    ],
  },
  {
    slug: "data-platforms",
    icon: "🗄️",
    title: "Data, frontend & backend engineering",
    summary:
      "Build a maintainable technology foundation across the layers that determine whether a public platform can improve safely.",
    items: [
      "Database architecture, integrity and migration planning",
      "API design, integrations and interoperability",
      "Business logic and workflow modernisation",
      "Performance profiling and scalability reviews",
      "Monitoring, logging and operational dashboards",
      "Documentation and knowledge transfer",
    ],
  },
];

export const GOVERNMENT_PLATFORM_GROUPS: GovernmentPlatformGroup[] = [
  {
    id: "ap-state",
    title: "Andhra Pradesh state platforms",
    summary:
      "Initial assessment focus. These are public platforms we are studying for modernisation opportunities — not clients or confirmed engagements.",
    platforms: [
      "AP State Government portals",
      "AP POLYCET examination and counselling platform",
      "Andhra University and affiliated institutions",
      "JNTU and government engineering colleges",
      "Government polytechnic college portals",
      "Admission, counselling and fee-payment portals",
      "Tourism and public-service portals",
    ],
  },
  {
    id: "education",
    title: "Education & examination platforms",
    summary:
      "Examination and admission systems carry some of the highest-volume, highest-stress citizen journeys in the state.",
    platforms: [
      "Entrance-test notifications and applications",
      "Hall ticket generation and downloads",
      "Results, rank cards and scorecards",
      "Counselling registration and web options",
      "Certificate verification and seat allotment",
      "College reporting and admission confirmation",
      "Student support and grievance workflows",
    ],
  },
  {
    id: "national",
    title: "National & other public platforms",
    summary:
      "Longer-term assessment candidates where the same modernisation framework applies. Listed for evaluation, not as existing partnerships.",
    platforms: [
      "EPFO member and employer services",
      "IRCTC booking and journey services",
      "TTD darshan and devotee services",
      "State tourism and cultural portals",
      "Public utility and municipal service portals",
      "Other citizen-facing government platforms",
    ],
  },
];

export const GOVERNMENT_POLYCET_JOURNEY: GovernmentJourneyStep[] = [
  {
    step: "01",
    title: "Notification",
    summary: "Publish the examination notification, eligibility, dates and prospectus in a findable, accessible format.",
    improvements: ["Stable canonical URL", "Accessible PDFs and HTML summary", "SMS/email subscription", "Change history"],
  },
  {
    step: "02",
    title: "Registration & application",
    summary: "Create an account, complete the application and pay the fee without losing entered data.",
    improvements: ["Progressive save", "Clear validation", "Mobile-first forms", "Payment retry and receipt"],
  },
  {
    step: "03",
    title: "Correction & status",
    summary: "Allow limited corrections and show the applicant exactly what is complete and what is pending.",
    improvements: ["Status timeline", "Deadline reminders", "Correction window rules", "Downloadable acknowledgement"],
  },
  {
    step: "04",
    title: "Hall ticket",
    summary: "Generate and download hall tickets with centre, schedule and candidate instructions.",
    improvements: ["Self-service download", "Centre lookup", "Accessibility guidance", "Lost-ticket recovery"],
  },
  {
    step: "05",
    title: "Examination & results",
    summary: "Publish results and rank cards reliably under heavy traffic, with a clear route to support.",
    improvements: ["Static-first result pages", "CDN and caching", "Rank-card generation", "Load testing before result day"],
  },
  {
    step: "06",
    title: "Counselling",
    summary: "Register, verify certificates, enter web options and track allotment across phases.",
    improvements: ["Guided option entry", "Seat availability visibility", "Phase status tracking", "Audit trail"],
  },
  {
    step: "07",
    title: "Allotment & admission",
    summary: "Confirm the seat, report to the college and complete admission without duplicate paperwork.",
    improvements: ["Digital allotment letter", "College reporting checklist", "Fee and document tracking", "Final confirmation receipt"],
  },
];

export const GOVERNMENT_ASSESSMENT = [
  {
    title: "Citizen experience",
    items: ["Task completion", "Navigation and language", "Mobile usability", "Accessibility", "Error recovery"],
  },
  {
    title: "Platform health",
    items: ["Performance", "Availability", "Peak-load readiness", "Browser/device coverage", "Observability"],
  },
  {
    title: "Architecture",
    items: ["Frontend structure", "API design", "Database integrity", "Integrations", "Deployment and recovery"],
  },
  {
    title: "Security & privacy",
    items: ["Authentication", "Authorisation", "Secrets", "Dependency risk", "Personal-data handling"],
  },
] as const;

export const GOVERNMENT_CAPABILITIES: GovernmentCapability[] = [
  {
    title: "Frontend",
    icon: "🖥️",
    items: ["Next.js and React", "Responsive design systems", "Accessibility", "Performance budgets", "Content publishing"],
  },
  {
    title: "Backend",
    icon: "⚙️",
    items: ["Node.js and NestJS", "REST APIs", "Authentication", "Workflow engines", "Integrations"],
  },
  {
    title: "Data",
    icon: "🗃️",
    items: ["PostgreSQL", "Schema design", "Migration planning", "Validation", "Reporting and dashboards"],
  },
  {
    title: "Operations",
    icon: "🛰️",
    items: ["Linux and Nginx", "Docker", "CI/CD", "Monitoring", "Backup and recovery"],
  },
];

export const GOVERNMENT_FAQ = [
  {
    q: "Are you currently working with any government department?",
    a: "This page presents our capabilities and the platforms we are assessing. It does not imply an existing client relationship. Any engagement starts with written authorisation and a defined scope.",
  },
  {
    q: "Can you audit a live government website?",
    a: "Only with authorisation from the platform owner. We do not perform intrusive testing, scanning or exploitation against systems we have not been engaged to assess.",
  },
  {
    q: "Do you replace the existing vendor or team?",
    a: "Not necessarily. We can work alongside an existing team, take a defined workstream, or provide an independent assessment and modernisation roadmap.",
  },
  {
    q: "How do you avoid disrupting live services?",
    a: "Changes are sequenced behind feature flags, staging environments and rollback plans. High-traffic events such as results day get load testing and a freeze window.",
  },
  {
    q: "Can you work with legacy systems and data?",
    a: "Yes. We assess the existing database, integrations and constraints first, then modernise incrementally rather than assuming a clean-slate rewrite.",
  },
];

export const GOVERNMENT_SERVICE_OPTIONS = [
  "Government website modernisation",
  "Security and compliance review",
  "Examination or admission portal",
  "Citizen service workflow",
  "Data and backend modernisation",
  "Accessibility and performance review",
  "Other / not sure yet",
] as const;

export const GOVERNMENT_ROLES = [
  "Government department",
  "Public institution / university",
  "Examination or admission body",
  "PSU / public-sector organisation",
  "Implementation partner",
  "Other",
] as const;
