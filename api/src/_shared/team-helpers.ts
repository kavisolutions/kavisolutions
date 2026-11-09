import { getTableColumns, eq } from "drizzle-orm";

import type { Database } from "@/db/drizzle/drizzle.client";
import { appSettings, roles, team, teams } from "@/db/drizzle/schema";
import { TEAM_SETTING_KEYS, normalizeGradient } from "@/_shared/text";

export type TeamWithTeamName = typeof team.$inferSelect & { teamName: string | null };

export type TeamMemberDto = {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  imageUrl: string | null;
  profileUrl: string | null;
  linkedinUrl: string | null;
  sortOrder: number;
  teamId: string | null;
  teamName: string | null;
};

export type OrgOption = { id: string; name: string; sortOrder: number };

export const toTeamMember = (row: TeamWithTeamName): TeamMemberDto => ({
  id: row.id,
  name: row.name,
  role: row.role,
  initials: row.initials,
  gradient: normalizeGradient(row.gradient),
  bio: row.bio,
  imageUrl: row.imageUrl,
  profileUrl: row.profileUrl,
  linkedinUrl: row.linkedinUrl,
  sortOrder: row.sortOrder,
  teamId: row.teamId,
  teamName: row.teamName,
});

export const teamSelection = {
  ...getTableColumns(team),
  teamName: teams.name,
};

export const memberQuery = (db: Database) =>
  db.select(teamSelection).from(team).leftJoin(teams, eq(team.teamId, teams.id));

export const findMemberById = async (
  db: Database,
  id: string,
): Promise<TeamWithTeamName | null> => {
  const rows = await memberQuery(db).where(eq(team.id, id)).limit(1);
  return rows[0] ?? null;
};

export const findMemberByUserId = async (
  db: Database,
  userId: string,
): Promise<TeamWithTeamName | null> => {
  const rows = await memberQuery(db).where(eq(team.userId, userId)).limit(1);
  return rows[0] ?? null;
};

export const readOrgOptions = async (
  db: Database,
): Promise<{ roles: OrgOption[]; teams: OrgOption[] }> => {
  const [roleRows, teamRows] = await Promise.all([
    db.select().from(roles),
    db.select().from(teams),
  ]);

  const byOrder = (a: OrgOption, b: OrgOption) => a.sortOrder - b.sortOrder;

  return {
    roles: roleRows
      .map((row) => ({ id: row.id, name: row.name, sortOrder: row.sortOrder }))
      .sort(byOrder),
    teams: teamRows
      .map((row) => ({ id: row.id, name: row.name, sortOrder: row.sortOrder }))
      .sort(byOrder),
  };
};

export const readTeamSettings = async (
  db: Database,
): Promise<{ tagline: string; description: string; contactEmail: string }> => {
  const all = await db.select().from(appSettings);

  const map = new Map(all.map((row) => [row.key, row.value ?? ""]));

  return {
    tagline: map.get(TEAM_SETTING_KEYS.tagline) || "",
    description: map.get(TEAM_SETTING_KEYS.description) || "",
    contactEmail: map.get(TEAM_SETTING_KEYS.contactEmail) || "",
  };
};

export const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "23505";

export const uuid = (): string => crypto.randomUUID();
