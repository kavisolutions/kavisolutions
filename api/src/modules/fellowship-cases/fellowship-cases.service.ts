import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, type SQL } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import {
  fellowshipApplications,
  fellowshipCases,
  type FellowshipCaseRow,
} from "@/db/drizzle/schema";
import type {
  CreateFellowshipCaseDto,
  UpdateFellowshipCaseDto,
} from "@/modules/fellowship-cases/dto/fellowship-case.dto";

export type FellowshipCaseDto = {
  id: string;
  applicationId: string | null;
  candidateName: string;
  candidateReference: string;
  category: string;
  severity: string;
  summary: string;
  details: string;
  status: string;
  assignedTo: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

const toDto = (
  row: FellowshipCaseRow,
  application?: { name: string; reference: string },
): FellowshipCaseDto => ({
  id: row.id,
  applicationId: row.applicationId ?? null,
  candidateName: application?.name ?? "",
  candidateReference: application?.reference ?? "",
  category: row.category,
  severity: row.severity,
  summary: row.summary,
  details: row.details,
  status: row.status,
  assignedTo: row.assignedTo,
  resolution: row.resolution,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
});

@Injectable()
export class FellowshipCasesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  private async names(): Promise<
    Map<string, { name: string; reference: string }>
  > {
    const rows = await this.db
      .select({
        id: fellowshipApplications.id,
        name: fellowshipApplications.name,
        reference: fellowshipApplications.reference,
      })
      .from(fellowshipApplications);
    return new Map(rows.map((row) => [row.id, { name: row.name, reference: row.reference }]));
  }

  async list(options: { status?: string; category?: string } = {}) {
    const filters: SQL[] = [];
    if (options.status) filters.push(eq(fellowshipCases.status, options.status));
    if (options.category) filters.push(eq(fellowshipCases.category, options.category));

    const rows = await this.db
      .select()
      .from(fellowshipCases)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(fellowshipCases.createdAt));
    const names = await this.names();

    return {
      cases: rows.map((row) =>
        toDto(row, row.applicationId ? names.get(row.applicationId) : undefined),
      ),
      openCount: rows.filter((row) => row.status === "open" || row.status === "investigating")
        .length,
    };
  }

  async create(payload: CreateFellowshipCaseDto) {
    const [row] = await this.db
      .insert(fellowshipCases)
      .values({
        id: uuid(),
        applicationId: payload.applicationId || null,
        category: payload.category,
        severity: payload.severity,
        summary: sanitizeText(payload.summary, 500),
        details: sanitizeText(payload.details, 8000),
        assignedTo: sanitizeText(payload.assignedTo, 200),
      })
      .returning();
    const names = await this.names();
    return {
      case: toDto(
        row,
        row.applicationId ? names.get(row.applicationId) : undefined,
      ),
    };
  }

  async update(id: string, payload: UpdateFellowshipCaseDto) {
    const [existing] = await this.db
      .select()
      .from(fellowshipCases)
      .where(eq(fellowshipCases.id, id))
      .limit(1);
    if (!existing) throw new NotFoundException("Case not found");

    const set: Partial<FellowshipCaseRow> = { updatedAt: new Date() };
    if (payload.category !== undefined) set.category = payload.category;
    if (payload.severity !== undefined) set.severity = payload.severity;
    if (payload.summary !== undefined) set.summary = sanitizeText(payload.summary, 500);
    if (payload.details !== undefined) set.details = sanitizeText(payload.details, 8000);
    if (payload.assignedTo !== undefined) {
      set.assignedTo = sanitizeText(payload.assignedTo, 200);
    }
    if (payload.resolution !== undefined) {
      set.resolution = sanitizeText(payload.resolution, 8000);
    }
    if (payload.status !== undefined) {
      set.status = payload.status;
      set.resolvedAt =
        payload.status === "resolved" || payload.status === "closed"
          ? new Date()
          : null;
    }

    const [row] = await this.db
      .update(fellowshipCases)
      .set(set)
      .where(eq(fellowshipCases.id, id))
      .returning();
    if (!row) throw new NotFoundException("Case not found");
    const names = await this.names();
    return {
      case: toDto(row, row.applicationId ? names.get(row.applicationId) : undefined),
    };
  }

  async remove(id: string) {
    const [row] = await this.db
      .delete(fellowshipCases)
      .where(eq(fellowshipCases.id, id))
      .returning({ id: fellowshipCases.id });
    if (!row) throw new NotFoundException("Case not found");
    return { ok: true };
  }
}
