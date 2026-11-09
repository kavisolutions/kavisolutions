import { Inject, Injectable } from "@nestjs/common";
import { asc, eq, sql } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { team, teams, type TeamInsert } from "@/db/drizzle/schema";
import {
  findMemberById,
  findMemberByUserId,
  memberQuery,
  type TeamWithTeamName,
} from "@/_shared/team-helpers";

@Injectable()
export class TeamRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll(): Promise<TeamWithTeamName[]> {
    return memberQuery(this.db)
      .orderBy(asc(team.sortOrder), asc(team.createdAt));
  }

  async findById(id: string): Promise<TeamWithTeamName | null> {
    return findMemberById(this.db, id);
  }

  async findByUserId(userId: string): Promise<TeamWithTeamName | null> {
    return findMemberByUserId(this.db, userId);
  }

  async findByLinkedEmail(email: string): Promise<TeamWithTeamName | null> {
    const rows = await this.db
      .select({ id: team.id })
      .from(team)
      .innerJoin(sql`"user"`, sql`"user".id = ${team.userId}`)
      .where(sql`lower("user".email) = ${email.trim().toLowerCase()}`)
      .limit(1);

    return rows[0] ? this.findById(rows[0].id) : null;
  }

  async create(values: TeamInsert): Promise<TeamWithTeamName> {
    const [row] = await this.db.insert(team).values(values).returning({ id: team.id });
    const member = await this.findById(row.id);
    if (!member) throw new Error("Failed to load created member");
    return member;
  }

  async update(id: string, values: Partial<TeamInsert>): Promise<TeamWithTeamName | null> {
    await this.db
      .update(team)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(team.id, id));

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(team).where(eq(team.id, id));
  }

  async clearRoleByName(roleName: string): Promise<void> {
    await this.db
      .update(team)
      .set({ role: "", updatedAt: new Date() })
      .where(eq(team.role, roleName));
  }

  async renameRole(existingName: string, newName: string): Promise<void> {
    await this.db
      .update(team)
      .set({ role: newName, updatedAt: new Date() })
      .where(eq(team.role, existingName));
  }

  async teamName(teamId: string | null): Promise<string | null> {
    if (!teamId) return null;
    const rows = await this.db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);
    return rows[0]?.name ?? null;
  }
}
