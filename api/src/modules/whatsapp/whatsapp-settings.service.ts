import { Inject, Injectable } from "@nestjs/common";
import { homedir } from "node:os";
import path from "node:path";
import { inArray } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import { appSettings } from "@/db/drizzle/schema";
import type { Database } from "@/db/drizzle/drizzle.client";

const KEYS = {
  enabled: "fellowship.whatsapp.enabled",
  countryCode: "fellowship.whatsapp.countryCode",
  authDir: "fellowship.whatsapp.authDir",
} as const;

export type WhatsAppSettings = {
  enabled: boolean;
  countryCode: string;
  authDir: string;
  updatedAt: string | null;
};

const DEFAULT_AUTH_DIR = path.join(homedir(), ".kavi", "baileys");

@Injectable()
export class WhatsAppSettingsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async ensureDefaults(): Promise<WhatsAppSettings> {
    const defaults = [
      { key: KEYS.enabled, value: "false" },
      { key: KEYS.countryCode, value: "91" },
      { key: KEYS.authDir, value: DEFAULT_AUTH_DIR },
    ];
    for (const row of defaults) {
      await this.db.insert(appSettings).values(row).onConflictDoNothing();
    }
    return this.get();
  }

  async get(): Promise<WhatsAppSettings> {
    const rows = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, Object.values(KEYS)));
    const map = new Map(rows.map((row) => [row.key, row]));
    const latest = rows.reduce<Date | null>(
      (current, row) =>
        !current || row.updatedAt.getTime() > current.getTime()
          ? row.updatedAt
          : current,
      null,
    );

    return {
      enabled: map.get(KEYS.enabled)?.value === "true",
      countryCode: map.get(KEYS.countryCode)?.value || "91",
      authDir: map.get(KEYS.authDir)?.value || DEFAULT_AUTH_DIR,
      updatedAt: latest ? latest.toISOString() : null,
    };
  }

  async update(payload: {
    enabled?: boolean;
    countryCode?: string;
  }): Promise<WhatsAppSettings> {
    const now = new Date();
    const rows: { key: string; value: string; updatedAt: Date }[] = [];

    if (payload.enabled !== undefined) {
      rows.push({
        key: KEYS.enabled,
        value: payload.enabled ? "true" : "false",
        updatedAt: now,
      });
    }
    if (payload.countryCode !== undefined) {
      const code = sanitizeText(payload.countryCode, 4).replace(/\D/g, "");
      rows.push({
        key: KEYS.countryCode,
        value: code || "91",
        updatedAt: now,
      });
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

    return this.get();
  }
}
