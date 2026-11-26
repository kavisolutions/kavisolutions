import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  admins,
  appSettings,
  certificates,
  projects,
  roles,
  surveyors,
  team,
  teams,
} from "@/db/drizzle/schema";

dotenv.config();

/* Demo data for local development and QA.
 *
 * `db:seed` only creates the baseline lookups (roles, teams, admins,
 * settings). This script fills every API-backed public page with realistic
 * rows so the UI can be exercised without touching production data.
 *
 * Every row uses a `demo-` id (certificates use the reserved 9xxx serial
 * range) and every insert is an upsert, so the script is safe to re-run and
 * easy to spot in the admin panel. Never point this at production. */

const demoTeamMembers = [
  {
    id: "demo-kv-raman",
    name: "K. V. Raman",
    role: "Principal Architect & Founder",
    initials: "KR",
    gradient: "from-indigo-500 to-blue-500",
    bio: "Ex-systems lead with 20+ years building mission-critical distributed systems and compiler tech.",
    teamName: "Core Team",
    sortOrder: 1,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-s-nandini",
    name: "S. Nandini",
    role: "Head of Product Architecture",
    initials: "SN",
    gradient: "from-fuchsia-500 to-pink-500",
    bio: "Ex-design lead crafting high-conversion fintech and cryptographic interfaces.",
    teamName: "Core Team",
    sortOrder: 2,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-arjun-mehta",
    name: "Arjun Mehta",
    role: "VP of Engineering",
    initials: "AM",
    gradient: "from-sky-500 to-cyan-500",
    bio: "Specialist in container orchestration, cloud resilience and Rust microservices.",
    teamName: "Tech Team",
    sortOrder: 3,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-priya-deshmukh",
    name: "Priya Deshmukh",
    role: "Director of Growth & Marketing",
    initials: "PD",
    gradient: "from-emerald-500 to-teal-500",
    bio: "Growth architect scaling B2B enterprise software and attribution funnels.",
    teamName: "Marketing Team",
    sortOrder: 4,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-harish-chandra",
    name: "Harish Chandra",
    role: "Principal Field Systems Engineer",
    initials: "HC",
    gradient: "from-amber-500 to-orange-500",
    bio: "Offline GIS networks, LoRa telemetry and pan-India hardware integration.",
    teamName: "Operations Team",
    sortOrder: 5,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-meera-sen",
    name: "Meera Sen",
    role: "Lead AI & Applied ML",
    initials: "MS",
    gradient: "from-violet-500 to-purple-500",
    bio: "Deterministic RAG, LLM safety guardrails and computer vision models.",
    teamName: "Tech Team",
    sortOrder: 6,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-rohit-nair",
    name: "Rohit Nair",
    role: "Senior Full-Stack Architect",
    initials: "RN",
    gradient: "from-rose-500 to-red-500",
    bio: "Next.js, distributed database partitioning and real-time WebSockets.",
    teamName: "Tech Team",
    sortOrder: 7,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
  {
    id: "demo-divya-patel",
    name: "Divya Patel",
    role: "Operations & Fellowship Director",
    initials: "DP",
    gradient: "from-lime-500 to-green-500",
    bio: "Vipassana practitioner, talent incubation and cohort field leadership.",
    teamName: "Operations Team",
    sortOrder: 8,
    linkedinUrl: "https://www.linkedin.com/",
    profileUrl: null,
  },
];

const portfolioProjects = [
  {
    id: "kavi-tent-on-rent",
    name: "Tent on Rent",
    description:
      "Multi-vendor tent and event-equipment rental marketplace with date-based inventory, verified owners, advance payments, order lifecycle and an Expo app on top of a NestJS API.",
    appLink: null,
    webLink: "https://tentonrent.kavisolutions.in",
    liveLinkType: "web",
    projectTypes: ["App", "Web"],
    skills: [
      "Expo",
      "React Native",
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "MinIO",
      "Razorpay",
    ],
    sortOrder: 1,
  },
  {
    id: "kavi-where-am-i",
    name: "Where Am I",
    description:
      "AI visual inventory that turns cupboard photos into searchable objects, then shows exactly where each item is stored. Live at whereami.kavisolutions.in.",
    appLink: null,
    webLink: "https://whereami.kavisolutions.in",
    liveLinkType: "web",
    projectTypes: ["Web", "App"],
    skills: [
      "Next.js",
      "Expo",
      "better-auth",
      "Drizzle ORM",
      "PostgreSQL",
      "pgvector",
      "MinIO",
      "Groq",
    ],
    sortOrder: 2,
  },
  {
    id: "kavi-social-agent",
    name: "Social Agent",
    description:
      "Scheduled social publishing sidecar that imports a year of images, writes captions with a vision model, routes every post through Telegram approval and publishes to LinkedIn, Facebook and Instagram.",
    appLink: null,
    webLink: null,
    liveLinkType: "web",
    projectTypes: ["Web"],
    skills: [
      "Fastify",
      "TypeScript",
      "SQLite",
      "Node cron",
      "LinkedIn API",
      "Meta Graph API",
      "Telegram Bot API",
    ],
    sortOrder: 3,
  },
  {
    id: "kavi-certificate-system",
    name: "Certificate System",
    description:
      "Print-ready certificate design system with five templates, QR verification, batch CSV issuing and an audit registry wired to the public /verify page.",
    appLink: null,
    webLink: "https://kavisolutions.in/verify",
    liveLinkType: "web",
    projectTypes: ["Web"],
    skills: [
      "HTML/CSS",
      "JavaScript",
      "qrcode",
      "jsQR",
      "PDF generation",
      "QR verification",
    ],
    sortOrder: 4,
  },
  {
    id: "kavi-solutions-platform",
    name: "Kavi Solutions Platform",
    description:
      "This site: a Next.js 16 marketing platform with a NestJS API, Better Auth sign-in, admin-managed team, projects, certificates and surveyors, live page switches and MinIO uploads.",
    appLink: null,
    webLink: "https://kavisolutions.in",
    liveLinkType: "web",
    projectTypes: ["Web", "Enterprise"],
    skills: [
      "Next.js",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "NestJS",
      "PostgreSQL",
      "Drizzle ORM",
      "Better Auth",
      "Docker",
    ],
    sortOrder: 5,
  },
];

const demoCertificates = [
  {
    id: "KV-FEL-2026-9001",
    type: "fellowship",
    recipientName: "Aarav Krishna Reddy",
    programme: "Kavi Fellowship 2026",
    role: "Fellow",
    startDate: "2026-01-05",
    endDate: "2026-11-30",
    issuedOn: "2026-12-01",
    summary:
      "Completed the 11-month Kavi Fellowship including field research, client delivery and the public capstone.",
    status: "issued",
  },
  {
    id: "KV-INT-2026-9002",
    type: "internship",
    recipientName: "Meghana Sathvika",
    programme: "Product Engineering Internship",
    role: "Engineering Intern",
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    issuedOn: "2026-08-05",
    summary:
      "Built and shipped customer-facing dashboard modules during a six-month product engineering internship.",
    status: "issued",
  },
  {
    id: "KV-VOL-2026-9003",
    type: "volunteer",
    recipientName: "Rohit Varma",
    programme: "Civic Technology Volunteer Programme",
    role: "Field Volunteer",
    startDate: "2026-03-10",
    endDate: "2026-06-10",
    issuedOn: "2026-06-15",
    summary:
      "Supported rural survey operations and data quality checks across three districts.",
    status: "issued",
  },
  {
    id: "KV-MEN-2026-9004",
    type: "mentorship",
    recipientName: "Dr. Srinivas Rao",
    programme: "Kavi Fellowship Mentorship",
    role: "Mentor",
    startDate: "2026-01-05",
    endDate: "2026-11-30",
    issuedOn: "2026-12-01",
    summary:
      "Mentored fellowship cohorts on research methodology, systems design and professional practice.",
    status: "issued",
  },
  {
    id: "KV-EXP-2026-9005",
    type: "experience",
    recipientName: "Ananya Priya",
    programme: "Kavi Solutions",
    role: "Senior Software Engineer",
    startDate: "2023-04-01",
    endDate: "2026-03-31",
    issuedOn: "2026-04-01",
    summary:
      "Three years delivering distributed web platforms and internal developer tooling.",
    status: "issued",
  },
  {
    id: "KV-FEL-2026-9006",
    type: "fellowship",
    recipientName: "Devi Prasad",
    programme: "Kavi Fellowship 2026",
    role: "Fellow",
    startDate: "2026-01-05",
    endDate: "2026-11-30",
    issuedOn: "2026-12-01",
    summary:
      "Demo record showing the public verification result for a revoked certificate.",
    status: "revoked",
    revokedOn: "2026-09-15",
    revokedReason: "Duplicate record created during migration.",
  },
];

const demoSurveyors = [
  {
    id: "demo-surveyor-1",
    name: "Lakshmi Narayana",
    email: "lakshmi.narayana@example.com",
    phone: "+91 98480 10001",
    location: "Warangal, Telangana",
    languages: ["Telugu", "Hindi", "English"],
    skills: ["Household surveys", "CAPI", "Telugu transcription"],
    experience: "6 years across state health and agriculture studies.",
    notes: "Available for multi-district field waves.",
    status: "active",
  },
  {
    id: "demo-surveyor-2",
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    phone: "+91 98480 10002",
    location: "Guntur, Andhra Pradesh",
    languages: ["Telugu", "English"],
    skills: ["Market research", "FGD moderation"],
    experience: "4 years in consumer and retail research.",
    notes: "Strong rapport with rural retail respondents.",
    status: "verified",
  },
  {
    id: "demo-surveyor-3",
    name: "Fatima Begum",
    email: "fatima.begum@example.com",
    phone: "+91 98480 10003",
    location: "Hyderabad, Telangana",
    languages: ["Urdu", "Hindi", "English"],
    skills: ["Political polling", "Urban surveys"],
    experience: "3 years in opinion polling and exit surveys.",
    notes: "Comfortable with sensitive respondent groups.",
    status: "active",
  },
  {
    id: "demo-surveyor-4",
    name: "Suresh Babu",
    email: "suresh.babu@example.com",
    phone: "+91 98480 10004",
    location: "Palnadu, Andhra Pradesh",
    languages: ["Telugu"],
    skills: ["Agriculture surveys", "GPS plotting"],
    experience: "8 years of village-level agri input studies.",
    notes: "Local network across 40+ villages.",
    status: "verified",
  },
  {
    id: "demo-surveyor-5",
    name: "Anitha Reddy",
    email: "anitha.reddy@example.com",
    phone: "+91 98480 10005",
    location: "Karimnagar, Telangana",
    languages: ["Telugu", "English"],
    skills: ["Education research", "School audits"],
    experience: "2 years of school and anganwadi audits.",
    notes: "New applicant awaiting document verification.",
    status: "applied",
  },
];

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://kavi:kavi@localhost:5436/kavi_solutions",
  });
  const db = drizzle(pool);

  /* Baseline lookups, same as db:seed, so the demo script works on a fresh DB. */
  await db
    .insert(roles)
    .values([
      { id: "volunteer", name: "Volunteer", sortOrder: 1 },
      { id: "intern", name: "Intern", sortOrder: 2 },
      { id: "fellow", name: "Fellow", sortOrder: 3 },
      { id: "mentor", name: "Mentor", sortOrder: 4 },
      { id: "partner", name: "Partner", sortOrder: 5 },
    ])
    .onConflictDoNothing();

  await db
    .insert(teams)
    .values([
      { id: "core-team", name: "Core Team", sortOrder: 1 },
      { id: "marketing-team", name: "Marketing Team", sortOrder: 2 },
      { id: "tech-team", name: "Tech Team", sortOrder: 3 },
      { id: "operations-team", name: "Operations Team", sortOrder: 4 },
    ])
    .onConflictDoNothing();

  /* Team IDs are not stable across databases (the legacy DB used UUIDs),
     so resolve the current IDs by name instead of hard-coding them. */
  const teamRows = await db.select({ id: teams.id, name: teams.name }).from(teams);
  const teamIdByName = new Map(
    teamRows.map((row) => [row.name.trim().toLowerCase(), row.id]),
  );

  await db
    .insert(admins)
    .values([{ email: "tejasimma36@gmail.com" }, { email: "kavitha@kavisolutions.in" }])
    .onConflictDoNothing();

  const now = new Date();

  const settings = [
    {
      key: "team_tagline",
      value: "Meet the Team",
    },
    {
      key: "team_description",
      value:
        "The people behind Kavi Solutions — a senior collective of systems architects, product engineers and fellowship leaders.",
    },
    { key: "contact_email", value: "support@kavisolutions.in" },
    { key: "page_survey_enabled", value: "true" },
    { key: "page_financial_enabled", value: "true" },
    { key: "page_government_enabled", value: "true" },
    { key: "page_farms_enabled", value: "true" },
  ];

  for (const setting of settings) {
    await db
      .insert(appSettings)
      .values({ ...setting, updatedAt: now })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: { value: setting.value, updatedAt: now },
      });
  }

  for (const { teamName, ...member } of demoTeamMembers) {
    const values = {
      ...member,
      teamId: teamIdByName.get(teamName.toLowerCase()) ?? null,
      updatedAt: now,
    };
    await db
      .insert(team)
      .values(values)
      .onConflictDoUpdate({
        target: team.id,
        set: values,
      });
  }

  for (const project of portfolioProjects) {
    const values = { ...project, updatedAt: now };
    await db
      .insert(projects)
      .values(values)
      .onConflictDoUpdate({
        target: projects.id,
        set: { ...project, updatedAt: now },
      });
  }

  for (const certificate of demoCertificates) {
    const values = {
      ...certificate,
      revokedOn: certificate.revokedOn ?? null,
      revokedReason: certificate.revokedReason ?? null,
      updatedAt: now,
    };
    await db
      .insert(certificates)
      .values(values)
      .onConflictDoUpdate({
        target: certificates.id,
        set: { ...values, updatedAt: now },
      });
  }

  for (const surveyor of demoSurveyors) {
    const verifiedAt =
      surveyor.status === "applied" || surveyor.status === "rejected" ? null : now;
    const values = { ...surveyor, verifiedAt, updatedAt: now };
    await db
      .insert(surveyors)
      .values(values)
      .onConflictDoUpdate({
        target: surveyors.id,
        set: { ...values, updatedAt: now },
      });
  }

  await pool.end();

  console.log(
    [
      "Demo seed complete:",
      `${demoTeamMembers.length} team members`,
      `${portfolioProjects.length} projects`,
      `${demoCertificates.length} certificates`,
      `${demoSurveyors.length} surveyors`,
      "and all public page switches enabled.",
    ].join(" "),
  );
}

void main();
