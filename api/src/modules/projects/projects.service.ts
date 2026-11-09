import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { asc, eq } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { projects, type ProjectRow } from "@/db/drizzle/schema";
import { ALLOWED_LIVE_LINK_TYPES, sanitizeText } from "@/_shared/text";
import { isLiveLinkType, validateLinks } from "@/_shared/projects";
import { uuid } from "@/_shared/team-helpers";
import { CreateProjectDto, UpdateProjectDto } from "@/modules/projects/dto/project.dto";

export type ProjectDto = {
  id: string;
  name: string;
  description: string;
  appLink: string;
  webLink: string;
  liveLinkType: "app" | "web" | "both";
  projectTypes: string[];
  skills: string[];
  sortOrder: number;
};

const toProject = (row: ProjectRow): ProjectDto => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  appLink: row.appLink ?? "",
  webLink: row.webLink ?? "",
  liveLinkType: isLiveLinkType(row.liveLinkType ?? "") ? (row.liveLinkType as "app" | "web" | "both") : "web",
  projectTypes: row.projectTypes ?? [],
  skills: row.skills ?? [],
  sortOrder: row.sortOrder ?? 0,
});

@Injectable()
export class ProjectsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list() {
    const rows = await this.db
      .select()
      .from(projects)
      .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

    return { projects: rows.map(toProject) };
  }

  async create(payload: CreateProjectDto) {
    const name = sanitizeText(payload.name, 120);
    if (!name) throw new BadRequestException("Project name is required");

    const description = sanitizeText(payload.description, 5000);
    const appLink = sanitizeText(payload.appLink, 500);
    const webLink = sanitizeText(payload.webLink, 500);
    const liveLinkType = sanitizeText(payload.liveLinkType, 10) || "web";
    const projectTypes = Array.isArray(payload.projectTypes) ? payload.projectTypes : [];
    const skills = Array.isArray(payload.skills) ? payload.skills : [];
    const sortOrder = Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0;

    if (!(ALLOWED_LIVE_LINK_TYPES as readonly string[]).includes(liveLinkType)) {
      throw new BadRequestException("Invalid live link type");
    }

    const linkError = validateLinks(liveLinkType, appLink, webLink);
    if (linkError) throw new BadRequestException(linkError);

    const [row] = await this.db
      .insert(projects)
      .values({
        id: uuid(),
        name,
        description: description || null,
        appLink: appLink || null,
        webLink: webLink || null,
        liveLinkType,
        projectTypes,
        skills,
        sortOrder,
      })
      .returning();

    return { project: toProject(row) };
  }

  async update(payload: UpdateProjectDto) {
    const id = sanitizeText(payload.id, 50);
    if (!id) throw new BadRequestException("Project ID is required");

    const [current] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!current) throw new NotFoundException("Project not found");

    const updates: Partial<typeof projects.$inferInsert> = {};

    if (payload.name !== undefined) {
      const name = sanitizeText(payload.name, 120);
      if (!name) throw new BadRequestException("Project name is required");
      updates.name = name;
    }

    if (payload.description !== undefined) {
      updates.description = sanitizeText(payload.description, 5000) || null;
    }

    if (payload.appLink !== undefined) {
      updates.appLink = sanitizeText(payload.appLink, 500) || null;
    }

    if (payload.webLink !== undefined) {
      updates.webLink = sanitizeText(payload.webLink, 500) || null;
    }

    if (payload.liveLinkType !== undefined) {
      const liveLinkType = sanitizeText(payload.liveLinkType, 10);
      if (liveLinkType && !(ALLOWED_LIVE_LINK_TYPES as readonly string[]).includes(liveLinkType)) {
        throw new BadRequestException("Invalid live link type");
      }
      updates.liveLinkType = liveLinkType || "web";
    }

    if (payload.projectTypes !== undefined) {
      updates.projectTypes = Array.isArray(payload.projectTypes) ? payload.projectTypes : [];
    }

    if (payload.skills !== undefined) {
      updates.skills = Array.isArray(payload.skills) ? payload.skills : [];
    }

    if (payload.sortOrder !== undefined) {
      updates.sortOrder = Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0;
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException("Nothing to update");
    }

    const resultingType =
      (updates.liveLinkType as string | undefined) ?? current.liveLinkType ?? "web";
    const resultingApp =
      ("appLink" in updates ? (updates.appLink as string | null) : current.appLink) ?? "";
    const resultingWeb =
      ("webLink" in updates ? (updates.webLink as string | null) : current.webLink) ?? "";
    const linkError = validateLinks(resultingType, resultingApp, resultingWeb);
    if (linkError) throw new BadRequestException(linkError);

    const [row] = await this.db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    return { project: toProject(row) };
  }

  async remove(id: string) {
    if (!id) throw new BadRequestException("Project ID is required");

    const [existing] = await this.db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) throw new NotFoundException("Project not found");

    await this.db.delete(projects).where(eq(projects.id, id));
    return { ok: true };
  }
}
