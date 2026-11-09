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

  async create(nameInput: unknown) {
    const name = sanitizeText(nameInput, 60);
    const id = slugify(name);

    if (!id) throw new BadRequestException("Role name is required");

    const [maxRow] = await this.db
      .select({ sortOrder: roles.sortOrder })
      .from(roles)
      .orderBy(desc(roles.sortOrder))
      .limit(1);

    const sortOrder = (maxRow?.sortOrder ?? 0) + 1;

    try {
      await this.db.insert(roles).values({ id, name, sortOrder });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new BadRequestException("That role already exists");
      }
      throw error;
    }

    return { ok: true, id, name };
  }

  async rename(id: string, nameInput: unknown) {
    const name = sanitizeText(nameInput, 60);
    if (!name) throw new BadRequestException("Role name is required");

    const [existing] = await this.db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Role not found");

    await this.db.update(roles).set({ name }).where(eq(roles.id, id));

    if (existing.name !== name) {
      await this.teamRepo.renameRole(existing.name, name);
    }

    return { ok: true };
  }

  async remove(id: string) {
    const [existing] = await this.db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Role not found");

    await this.db.delete(roles).where(eq(roles.id, id));
    await this.teamRepo.clearRoleByName(existing.name);

    return { ok: true };
  }
}
