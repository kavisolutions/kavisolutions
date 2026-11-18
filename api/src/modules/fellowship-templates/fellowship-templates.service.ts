import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { fellowshipEmailTemplates } from "@/db/drizzle/schema";

@Injectable()
export class FellowshipTemplatesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list() {
    const rows = await this.db
      .select()
      .from(fellowshipEmailTemplates)
      .orderBy(desc(fellowshipEmailTemplates.updatedAt));
    return {
      templates: rows.map((row) => ({
        key: row.key,
        subject: row.subject,
        body: row.body,
        updatedAt: row.updatedAt.toISOString(),
      })),
    };
  }

  async find(key: string) {
    const [row] = await this.db
      .select()
      .from(fellowshipEmailTemplates)
      .where(eq(fellowshipEmailTemplates.key, sanitizeText(key, 80)))
      .limit(1);
    return row ?? null;
  }

  async upsert(key: string, subject: string, body: string) {
    const cleanKey = sanitizeText(key, 80).toLowerCase();
    if (!cleanKey) throw new NotFoundException("Template key is required");
    const [row] = await this.db
      .insert(fellowshipEmailTemplates)
      .values({
        key: cleanKey,
        subject: sanitizeText(subject, 300),
        body: sanitizeText(body, 8000),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: fellowshipEmailTemplates.key,
        set: {
          subject: sanitizeText(subject, 300),
          body: sanitizeText(body, 8000),
          updatedAt: new Date(),
        },
      })
      .returning();
    return {
      template: {
        key: row.key,
        subject: row.subject,
        body: row.body,
        updatedAt: row.updatedAt.toISOString(),
      },
    };
  }

  async remove(key: string) {
    const [row] = await this.db
      .delete(fellowshipEmailTemplates)
      .where(eq(fellowshipEmailTemplates.key, sanitizeText(key, 80).toLowerCase()))
      .returning({ key: fellowshipEmailTemplates.key });
    if (!row) throw new NotFoundException("Template not found");
    return { ok: true };
  }
}
