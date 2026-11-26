import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { roles } from "@/db/drizzle/schema";
import { sanitizeText, slugify } from "@/_shared/text";
import { isUniqueViolation, readOrgOptions } from "@/_shared/team-helpers";
import { TeamRepository } from "@/modules/team/team.repository";

@Injectable()
export class RolesService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly teamRepo: TeamRepository,
  ) {}

  async list() {
    const { roles: list } = await readOrgOptions(this.db);
    return { roles: list };
  }

  /* The public API still speaks string ids (legacy slug ids), while the DB
     uses a serial id plus a stable `code` slug. Accept both so old bookmarks
     and the admin dropdown keep working. */
  private async findRole(id: string) {
    const numeric = Number(id);
    const by =
      Number.isInteger(numeric) && String(numeric) === id
        ? eq(roles.id, numeric)
        : eq(roles.code, id);

    const [row] = await this.db
      .select({ id: roles.id, name: roles.name })
      .from(roles)
      .where(by)
      .limit(1);
    return row ?? null;
  }

  async create(nameInput: unknown) {
    const name = sanitizeText(nameInput, 60);
    const code = slugify(name);

    if (!code) throw new BadRequestException("Role name is required");

    const [maxRow] = await this.db
      .select({ sortOrder: roles.sortOrder })
      .from(roles)
      .orderBy(desc(roles.sortOrder))
      .limit(1);

    const sortOrder = (maxRow?.sortOrder ?? 0) + 1;

    try {
      const [row] = await this.db
        .insert(roles)
        .values({ code, name, sortOrder })
        .returning({ id: roles.id });

      return { ok: true, id: String(row.id), name };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException("That role already exists");
      }
      throw error;
    }
  }

  async rename(id: string, nameInput: unknown) {
    const name = sanitizeText(nameInput, 60);
    if (!name) throw new BadRequestException("Role name is required");

    const existing = await this.findRole(id);
    if (!existing) throw new NotFoundException("Role not found");

    await this.db.update(roles).set({ name }).where(eq(roles.id, existing.id));

    if (existing.name !== name) {
      await this.teamRepo.renameRole(existing.name, name);
    }

    return { ok: true };
  }

  async remove(id: string) {
    const existing = await this.findRole(id);
    if (!existing) throw new NotFoundException("Role not found");

    await this.db.delete(roles).where(eq(roles.id, existing.id));
    await this.teamRepo.clearRoleByName(existing.name);

    return { ok: true };
  }
}
