export const FOLIO_SETTING_KEYS = {
  token: "folio_api_token",
  slug: "folio_team_slug",
} as const

export const DEFAULT_FOLIO_API_URL = "https://portfoli.store"

export type FolioTeamMember = {
  id: string
  username: string
  name: string
  photo: string | null
  role: "owner" | "member"
  jobRole: string | null
  type: string
  profileUrl: string | null
}

export type FolioTeam = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  logo: string | null
  portfolioUrl: string
  memberCount: number
  projectsCount: number
  members: FolioTeamMember[]
}

export const isValidFolioToken = (value: string) => /^folio_[a-f0-9]{64}$/i.test(value.trim())

export const normalizeTeamSlug = (value: string) => value.trim().toLowerCase()

export const buildFolioApiUrl = (baseUrl: string, slug?: string) => {
  const base = baseUrl.replace(/\/+$/, "")
  return slug ? `${base}/api/team?slug=${encodeURIComponent(slug)}` : `${base}/api/team`
}

const asString = (value: unknown) => (typeof value === "string" ? value : "")

export const normalizeFolioTeam = (value: unknown): FolioTeam | null => {
  if (!value || typeof value !== "object") return null

  const raw = value as Record<string, unknown>
  const slug = asString(raw.slug)
  const name = asString(raw.name)

  if (!slug || !name) return null

  const members = Array.isArray(raw.members)
    ? raw.members
        .filter((member): member is Record<string, unknown> => Boolean(member) && typeof member === "object")
        .map((member) => ({
          id: asString(member.id),
          username: asString(member.username),
          name: asString(member.name) || asString(member.username),
          photo: asString(member.photo) || null,
          role: member.role === "owner" ? ("owner" as const) : ("member" as const),
          jobRole: asString(member.jobRole) || null,
          type: asString(member.type) || "user",
          profileUrl: asString(member.profileUrl) || null,
        }))
    : []

  return {
    id: asString(raw.id),
    slug,
    name,
    tagline: asString(raw.tagline) || null,
    description: asString(raw.description) || null,
    logo: asString(raw.logo) || null,
    portfolioUrl: asString(raw.portfolioUrl) || `${DEFAULT_FOLIO_API_URL}/t/${encodeURIComponent(slug)}`,
    memberCount: typeof raw.memberCount === "number" ? raw.memberCount : members.length,
    projectsCount: typeof raw.projectsCount === "number" ? raw.projectsCount : 0,
    members,
  }
}
