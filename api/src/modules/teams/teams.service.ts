import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { teams } from "@/db/drizzle/schema";
import { sanitizeText } from "@/_shared/text";
import { isUniqueViolation, readOrgOptions, uuid } from "@/_shared/team-helpers";

@Injectable()
export class TeamsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list() {
    const { teams: list } = await readOrgOptions(this.db);
    return { teams: list };
  }

  async create(nameInput: unknown) {
    const name = sanitizeText(nameInput, 80);
    if (!name) throw new BadRequestException("Team name is required");

    const [maxRow] = await this.db
      .select({ sortOrder: teams.sortOrder })
      .from(teams)
      .orderBy(desc(teams.sortOrder))
      .limit(1);

    const sortOrder = (maxRow?.sortOrder ?? 0) + 1;
    const id = uuid();

    try {
      const [row] = await this.db
        .insert(teams)
        .values({ id, name, sortOrder })
        .returning({ id: teams.id, name: teams.name, sortOrder: teams.sortOrder });

      return { ok: true, team: { ...row, sortOrder: row.sortOrder } };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException("That team already exists");
      }
      throw error;
    }
  }

  async rename(id: string, nameInput: unknown) {
    const name = sanitizeText(nameInput, 80);
    if (!name) throw new BadRequestException("Team name is required");

    const [existing] = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Team not found");

    try {
      await this.db.update(teams).set({ name }).where(eq(teams.id, id));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException("That team already exists");
      }
      throw error;
    }

    return { ok: true };
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Team not found");

    await this.db.delete(teams).where(eq(teams.id, id));
    return { ok: true };
  }
}
