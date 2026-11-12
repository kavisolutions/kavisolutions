/* Content for the Kavi Fellowship page.
 *
 * The programme is an 11-month, cohort-based fellowship for youth in Andhra
 * Pradesh and Telangana, with English as the primary language and Telugu
 * support. Keep the promise honest: no placement guarantee is implied.
 *
 * The internal execution plan, team structure and language-folder convention
 * live in docs/fellowship-page.md, not on the public page.
 */

export type FellowshipPillar = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  practices: string[];
};

export type FellowshipPhase = {
  months: string;
  title: string;
  summary: string;
  outcomes: string[];
};

export type FellowshipTrack = {
  icon: string;
  title: string;
  summary: string;
  roles: string[];
};

export type FellowshipFaq = {
  q: string;
  a: string;
};

export const FELLOWSHIP_HERO = {
  eyebrow: "Kavi Fellowship",
  title: "Eleven months to build",
  highlight: "a life you can stand behind.",
  description:
    "A cohort-based fellowship for diploma students, final-year students, graduates and people returning to work. Learn by doing real projects, sit with silence, lead in the field and leave with a portfolio — not just a certificate.",
  metrics: [
    { value: "11", label: "Months, full journey" },
    { value: "3", label: "Core practices" },
    { value: "EN + TE", label: "English primary, Telugu support" },
    { value: "Cohort", label: "Learn with a team" },
  ],
} as const;

export const FELLOWSHIP_AUDIENCE = [
  "Diploma graduates who want a real portfolio, not another certificate.",
  "Third-year and final-year students preparing for work before they graduate.",
  "Graduates who have the degree but not the direction, guidance or network.",
  "Women returning to work after a break, including work-from-home options.",
  "People who discontinued formal education but have the drive to build.",
  "Professionals who want to re-skill and change track without starting from zero.",
] as const;

export const FELLOWSHIP_PILLARS: FellowshipPillar[] = [
  {
    id: "vipassana",
    icon: "🧘",
    title: "Vipassana",
    summary:
      "Ten days of silent meditation, built into the programme rather than bolted on. The point is not wellness theatre — it is attention, honesty and the ability to stay with a hard thing.",
    practices: [
      "A structured Vipassana course at the start of the fellowship",
      "Short daily sits through the programme",
      "Reflection journals and monthly check-ins",
      "Noble silence and device-free periods during residencies",
    ],
  },
  {
    id: "yltp",
    icon: "🌱",
    title: "YLTP",
    summary:
      "Youth Leadership Training Programme: the leadership and community-organising spine of the fellowship. Fellows learn to mobilise a team, run a room, facilitate a conversation and take responsibility for an outcome.",
    practices: [
      "Leadership labs and facilitation practice",
      "Community mobilisation and outreach projects",
      "Team lead rotations on live projects",
      "Feedback, conflict and decision-making practice",
    ],
  },
  {
    id: "dsn",
    icon: "🤝",
    title: "DSN",
    summary:
      "The community and field-practice component: structured service with schools, colleges, farmers, self-help groups and local organisations. Fellows learn the context they are building for by showing up in it.",
    practices: [
      "Field immersion with partner communities",
      "A community project with a documented outcome",
      "Exposure to rural livelihoods, education and public services",
      "Reflection on power, privilege and responsible service",
    ],
  },
];

export const FELLOWSHIP_PHASES: FellowshipPhase[] = [
  {
    months: "Months 1–2",
    title: "Foundation",
    summary:
      "Arrive, settle and build the habits the rest of the programme depends on. Vipassana, communication, digital literacy and a first small build.",
    outcomes: [
      "Completed Vipassana course",
      "Personal learning plan and baseline skills audit",
      "Working knowledge of the tools used on projects",
      "First team project shipped",
    ],
  },
  {
    months: "Months 3–5",
    title: "Craft",
    summary:
      "Choose a track and go deep. Fellows work on real briefs with weekly mentor reviews, while continuing leadership labs and community practice.",
    outcomes: [
      "Track-specific skills and a project portfolio",
      "Weekly critique and code/design review habit",
      "YLTP leadership lab completion",
      "One community project in progress",
    ],
  },
  {
    months: "Months 6–8",
    title: "Practice",
    summary:
      "Move from exercises to live work. Fellows join Kavi verticals or partner projects, take ownership of a deliverable and learn to work with a real client.",
    outcomes: [
      "Live project contribution with a named deliverable",
      "Client communication and scope discipline",
      "DSN field immersion completed",
      "Mid-programme review and revised plan",
    ],
  },
  {
    months: "Months 9–10",
    title: "Specialise",
    summary:
      "Sharpen the thing you want to be hired for. Portfolio, interview practice, advanced track work and a capstone brief.",
    outcomes: [
      "Portfolio case study",
      "Mock interviews and feedback",
      "Capstone project scoped and started",
      "Placement or next-step plan",
    ],
  },
  {
    months: "Month 11",
    title: "Capstone & launch",
    summary:
      "Finish the capstone, present it publicly and leave with a clear next step — a job, a freelance practice, a venture or a further specialisation.",
    outcomes: [
      "Capstone demo and written case study",
      "Public demo day",
      "CV, portfolio and references",
      "Post-fellowship plan agreed",
    ],
  },
];

export const FELLOWSHIP_WEEK = [
  { day: "Mon", focus: "Learning sprint", detail: "Workshops, guided study and track-specific practice." },
  { day: "Tue", focus: "Build", detail: "Project work with a stand-up and a clear deliverable." },
  { day: "Wed", focus: "Mentor review", detail: "Critique, unblocking and a written action list." },
  { day: "Thu", focus: "Build / field", detail: "Project work or DSN community practice." },
  { day: "Fri", focus: "Leadership lab", detail: "YLTP facilitation, feedback and team review." },
  { day: "Sat", focus: "Reflection", detail: "Journal, reading, community and rest." },
  { day: "Sun", focus: "Rest", detail: "No scheduled sessions. Protect the recovery day." },
] as const;

export const FELLOWSHIP_TRACKS: FellowshipTrack[] = [
  {
    icon: "💻",
    title: "Technology",
    summary: "Build software with modern web, mobile and AI tooling, guided by working engineers.",
    roles: ["Frontend developer", "Backend developer", "Full-stack developer", "QA / automation"],
  },
  {
    icon: "🔎",
    title: "Research & field operations",
    summary: "Design surveys, run field teams, clean data and turn it into reports people can use.",
    roles: ["Field researcher", "Survey coordinator", "Data analyst", "Research associate"],
  },
  {
    icon: "📣",
    title: "Marketing & communications",
    summary: "Tell the story, run campaigns and learn to measure what actually reaches people.",
    roles: ["Content associate", "Social media associate", "Campaign coordinator", "Community manager"],
  },
  {
    icon: "🧭",
    title: "Operations & finance",
    summary: "Keep projects and money moving: coordination, documentation, bookkeeping and reporting.",
    roles: ["Project coordinator", "Operations associate", "Accounts assistant", "Admin associate"],
  },
];

export const FELLOWSHIP_MENTORS = [
  {
    name: "Ramesh Raju",
    role: "Recruitment & mentoring",
    focus: "Finding the right fellows and staying with them through the programme.",
  },
  {
    name: "Bhavani",
    role: "Recruitment & mentoring",
    focus: "Candidate assessment, pastoral support and family conversations.",
  },
  {
    name: "Kavi Solutions team",
    role: "Project mentors",
    focus: "Weekly reviews from engineers, designers, researchers and operators.",
  },
] as const;

export const FELLOWSHIP_LANGUAGES = {
  primary: "English",
  support: "Telugu",
  note:
    "The public page is English-first with Telugu support. Programme content, videos and image text are organised in language folders so a fuller Telugu experience can be added without redesigning the page.",
} as const;

export const FELLOWSHIP_COHORTS = [
  { name: "January 2027", status: "Applications open", date: "Jan – Nov 2027" },
  { name: "May 2027", status: "Expression of interest", date: "May 2027 – Mar 2028" },
  { name: "September 2027", status: "Expression of interest", date: "Sep 2027 – Jul 2028" },
] as const;

export const FELLOWSHIP_FAQ: FellowshipFaq[] = [
  {
    q: "Who is the fellowship for?",
    a: "Diploma graduates, third-year and final-year students, graduates, women returning to work and people who want to change track. The common requirement is commitment, not a polished CV.",
  },
  {
    q: "Is it free?",
    a: "The fellowship is designed to be accessible; the current contribution and scholarship options are explained during the application conversation. We do not ask for payment through this website.",
  },
  {
    q: "Is it paid?",
    a: "There is no salary during the learning phase. Some live projects may carry a stipend, and top fellows can receive project-based compensation. Nothing is guaranteed in advance.",
  },
  {
    q: "What is the time commitment?",
    a: "This is a full-time, 11-month programme. It is not designed to fit around a full-time job. There are protected rest days, but the weekday rhythm is demanding.",
  },
  {
    q: "Do I need to know English?",
    a: "English is the primary language of the programme and the public page. Telugu support is available for explanation and community work; we will be honest with you about the level needed for your track.",
  },
  {
    q: "Is Vipassana compulsory?",
    a: "Yes. The ten-day course and the daily practice are part of the programme, not an optional extra. If that is not something you are willing to try, this fellowship is probably not the right fit.",
  },
  {
    q: "What are YLTP and DSN?",
    a: "YLTP is the leadership and community-organising component. DSN is the field-practice and service component. Both are woven through the 11 months, not one-off workshops.",
  },
  {
    q: "Do you guarantee a job?",
    a: "No. We provide mentorship, real project experience, portfolio support and introductions. The outcome depends on your work, the market and the track you choose.",
  },
  {
    q: "Will I get a certificate?",
    a: "Fellows who complete the programme receive a verifiable Kavi Fellowship completion certificate with a unique ID and QR verification link.",
  },
  {
    q: "How do I apply?",
    a: "Register your interest through the contact form or the next cohort announcement. We review expressions of interest, then invite shortlisted candidates to a conversation.",
  },
];

export const FELLOWSHIP_CONTACT = {
  email: "kavisolutions1@gmail.com",
  location: "Andhra Pradesh & Telangana · Cohort residencies announced per batch",
} as const;
