import { Inject, Injectable, Logger } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { uuid } from "@/_shared/team-helpers";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { fellowshipAuditLog } from "@/db/drizzle/schema";

export type FellowshipAuditInput = {
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  applicationId?: string | null;
  detail?: string;
};

@Injectable()
export class FellowshipAuditService {
  private readonly logger = new Logger(FellowshipAuditService.name);

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(options: { applicationId?: string; limit?: number } = {}) {
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
    const applicationId = sanitizeText(options.applicationId, 80);
    const rows = await this.db
      .select()
      .from(fellowshipAuditLog)
      .where(
        applicationId
          ? eq(fellowshipAuditLog.applicationId, applicationId)
          : undefined,
      )
      .orderBy(desc(fellowshipAuditLog.createdAt))
      .limit(limit);

    return {
      entries: rows.map((row) => ({
        id: row.id,
        actorEmail: row.actorEmail,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        applicationId: row.applicationId,
        detail: row.detail,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async log(input: FellowshipAuditInput): Promise<void> {
    try {
      await this.db.insert(fellowshipAuditLog).values({
        id: uuid(),
        actorEmail: (input.actorEmail ?? "system").toLowerCase(),
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? "",
        applicationId: input.applicationId ?? null,
        detail: input.detail ?? "",
      });
    } catch (error) {
      // Auditing must never break the operation it is recording.
      this.logger.error(
        `Fellowship audit write failed (${input.action}): ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}
