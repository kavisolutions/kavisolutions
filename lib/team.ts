export const TEAM_SETTING_KEYS = {
  tagline: "team_tagline",
  description: "team_description",
  contactEmail: "contact_email",
} as const

export const TEAM_GRADIENTS = [
  "from-violet-500 to-purple-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-lime-500 to-green-500",
] as const

export const DEFAULT_TEAM_GRADIENT = TEAM_GRADIENTS[0]

export type OrgRole = {
  id: string
  name: string
  sortOrder: number
}

export type OrgTeam = {
  id: string
  name: string
  sortOrder: number
}

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

export type TeamMemberRow = {
  id: string
  name: string
  role: string
  initials: string
  gradient: string
  bio: string
  image_url: string | null
  user_id: string | null
  sort_order: number
  profile_url: string | null
  linkedin_url?: string | null
  team_id?: string | null
  team?: { name: string } | null
  created_at?: string
  updated_at?: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  initials: string
  gradient: string
  bio: string
  imageUrl: string | null
  profileUrl: string | null
  linkedinUrl: string | null
  sortOrder: number
  teamId: string | null
  teamName: string | null
}

export type TeamSettings = {
  tagline: string
  description: string
}

export const parseAdminEmails = (value: string | undefined | null): string[] =>
  (value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

export const isAdminEmail = (email: string | null | undefined, allowlist: string[]): boolean => {
  if (!email) return false
  return allowlist.includes(email.trim().toLowerCase())
}

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2)

export const sanitizeText = (value: unknown, maxLength: number): string =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : ""

export const normalizeGradient = (value: unknown): string => {
  const gradient = sanitizeText(value, 80)
  return (TEAM_GRADIENTS as readonly string[]).includes(gradient)
    ? gradient
    : DEFAULT_TEAM_GRADIENT
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const toTeamMember = (row: TeamMemberRow): TeamMember => ({
  id: row.id,
  name: row.name,
  role: row.role,
  initials: row.initials,
  gradient: normalizeGradient(row.gradient),
  bio: row.bio,
  imageUrl: row.image_url,
  profileUrl: row.profile_url,
  linkedinUrl: row.linkedin_url ?? null,
  sortOrder: row.sort_order,
  teamId: row.team_id ?? null,
  teamName: row.team?.name ?? null,
})

export type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  live_link: string | null;
  live_link_type: string | null;
  project_types: string[];
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type Project = {
  id: string;
  name: string;
  description: string;
  liveLink: string;
  liveLinkType: "app" | "web" | "both";
  projectTypes: string[];
  skills: string[];
  sortOrder: number;
}

export const ALLOWED_LIVE_LINK_TYPES = ["app", "web", "both"] as const
export const ALLOWED_PROJECT_TYPES = ["App", "Web"] as const
export const COMMON_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Supabase",
  "Firebase",
  "AWS",
  "Docker",
  "GraphQL",
  "REST API",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Expo",
  "Python",
  "Go",
  "Redis",
  "Prisma",
  "Drizzle",
  "Stripe",
  "Auth.js",
  "Vercel",
] as const
