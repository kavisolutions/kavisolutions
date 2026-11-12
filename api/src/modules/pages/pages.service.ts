import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { inArray } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { appSettings } from "@/db/drizzle/schema";

/* Public page switches live in app_settings rather than environment
   variables. Flipping one used to mean a frontend rebuild and restart, which
   is not something an editor should have to ask a developer for. */
export const PAGE_SETTING_KEYS = {
  survey: "page_survey_enabled",
  financial: "page_financial_enabled",
  government: "page_government_enabled",
  farms: "page_farms_enabled",
} as const;

export type PageKey = keyof typeof PAGE_SETTING_KEYS;
export type PageVisibility = Record<PageKey, boolean>;
export type PagesPayload = Partial<Record<PageKey, unknown>>;

const PAGE_KEYS = Object.keys(PAGE_SETTING_KEYS) as PageKey[];

@Injectable()
export class PagesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async get(): Promise<{ pages: PageVisibility }> {
    const rows = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, PAGE_KEYS.map((key) => PAGE_SETTING_KEYS[key])));

    const map = new Map(rows.map((row) => [row.key, row.value ?? ""]));

    /* Anything other than an explicit "true" counts as hidden, so a missing
       row, a typo or a half-finished write never publishes a page. */
    return {
      pages: {
        survey: map.get(PAGE_SETTING_KEYS.survey) === "true",
        financial: map.get(PAGE_SETTING_KEYS.financial) === "true",
        government: map.get(PAGE_SETTING_KEYS.government) === "true",
        farms: map.get(PAGE_SETTING_KEYS.farms) === "true",
      },
    };
  }

  async update(payload: PagesPayload): Promise<{ pages: PageVisibility }> {
    const now = new Date();
    const rows: { key: string; value: string; updatedAt: Date }[] = [];

    for (const page of PAGE_KEYS) {
      const value = payload[page];
      if (value === undefined) continue;

      if (typeof value !== "boolean") {
        throw new BadRequestException(`${page} must be true or false`);
      }

      rows.push({
        key: PAGE_SETTING_KEYS[page],
        value: value ? "true" : "false",
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

    return this.get();
  }
}
