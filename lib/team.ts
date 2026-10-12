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
  sortOrder: number
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
  sortOrder: row.sort_order,
})
