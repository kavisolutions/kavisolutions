import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { inArray } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { appSettings } from "@/db/drizzle/schema";
import { sanitizeText, TEAM_SETTING_KEYS } from "@/_shared/text";

export type SettingsPayload = {
  tagline?: unknown;
  description?: unknown;
  contactEmail?: unknown;
};

@Injectable()
export class SettingsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async get() {
    const keys = [
      TEAM_SETTING_KEYS.tagline,
      TEAM_SETTING_KEYS.description,
      TEAM_SETTING_KEYS.contactEmail,
    ];

    const rows = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, keys));

    const map = new Map(rows.map((row) => [row.key, row.value ?? ""]));

    return {
      settings: {
        tagline: map.get(TEAM_SETTING_KEYS.tagline) || "",
        description: map.get(TEAM_SETTING_KEYS.description) || "",
        contactEmail: map.get(TEAM_SETTING_KEYS.contactEmail) || "",
      },
    };
  }

  async update(payload: SettingsPayload) {
    const rows: { key: string; value: string; updatedAt: Date }[] = [];
    const now = new Date();

    if (payload.tagline !== undefined) {
      rows.push({
        key: TEAM_SETTING_KEYS.tagline,
        value: sanitizeText(payload.tagline, 300),
        updatedAt: now,
      });
    }

    if (payload.description !== undefined) {
      rows.push({
        key: TEAM_SETTING_KEYS.description,
        value: sanitizeText(payload.description, 1000),
        updatedAt: now,
      });
    }

    if (payload.contactEmail !== undefined) {
      rows.push({
        key: TEAM_SETTING_KEYS.contactEmail,
        value: sanitizeText(payload.contactEmail, 254),
        updatedAt: now,
      });
    }

    if (rows.length === 0) {
      throw new BadRequestException("Nothing to update");
    }

    for (const row of rows) {
      await this.db
        .insert(appSettings)
        .values(row)
        .onConflictDoUpdate({
          target: appSettings.key,
          set: { value: row.value, updatedAt: now },
        });
    }

    return { ok: true };
  }

  async contactEmail(): Promise<string> {
    const [row] = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, [TEAM_SETTING_KEYS.contactEmail]));

    const value = typeof row?.value === "string" ? row.value.trim() : "";
    if (value) return value;

    return process.env.CONTACT_EMAIL || process.env.SMTP_USER || "";
  }
}
