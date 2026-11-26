import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { eq, inArray } from "drizzle-orm";

import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { appSettings } from "@/db/drizzle/schema";
import { isEmail, sanitizeText, TEAM_SETTING_KEYS } from "@/_shared/text";

export type SettingsPayload = {
  tagline?: unknown;
  description?: unknown;
  contactEmail?: unknown;
  financialEmail?: unknown;
  supportEmail?: unknown;
  surveyOpportunities?: unknown;
};

/* One opportunity per line: `Name | short note`. Keeping this as text in the
   existing settings table avoids a new table for a list that is edited a few
   times a year. */
export const DEFAULT_SUPPORT_EMAIL = "support@kavisolutions.in";

export type SurveyOpportunity = { name: string; note: string };

export const parseSurveyOpportunities = (value: string | null | undefined): SurveyOpportunity[] =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split("|");
      return { name: name.trim().slice(0, 120), note: rest.join("|").trim().slice(0, 160) };
    })
    .filter((item) => item.name)
    .slice(0, 30);

@Injectable()
export class SettingsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async get() {
    const keys = [
      TEAM_SETTING_KEYS.tagline,
      TEAM_SETTING_KEYS.description,
      TEAM_SETTING_KEYS.contactEmail,
      TEAM_SETTING_KEYS.financialEmail,
      TEAM_SETTING_KEYS.supportEmail,
      TEAM_SETTING_KEYS.surveyOpportunities,
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
        financialEmail: map.get(TEAM_SETTING_KEYS.financialEmail) || "",
        supportEmail: map.get(TEAM_SETTING_KEYS.supportEmail) || "",
        surveyOpportunities: map.get(TEAM_SETTING_KEYS.surveyOpportunities) || "",
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

    if (payload.financialEmail !== undefined) {
      rows.push({
        key: TEAM_SETTING_KEYS.financialEmail,
        value: sanitizeText(payload.financialEmail, 254),
        updatedAt: now,
      });
    }

    if (payload.supportEmail !== undefined) {
      const value = sanitizeText(payload.supportEmail, 254);
      if (value && !isEmail(value)) {
        throw new BadRequestException("Enter a valid support email address");
      }
      rows.push({
        key: TEAM_SETTING_KEYS.supportEmail,
        value,
        updatedAt: now,
      });
    }

    if (payload.surveyOpportunities !== undefined) {
      const parsed = parseSurveyOpportunities(sanitizeText(payload.surveyOpportunities, 4000));
      rows.push({
        key: TEAM_SETTING_KEYS.surveyOpportunities,
        value: parsed.map((item) => `${item.name} | ${item.note}`.trim()).join("\n"),
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

  /* The admin-managed support address is the source of truth for both public
     display and enquiry recipients. Older contact_email/financial_email rows
     remain as fallbacks for databases not yet migrated. */
  private async configuredSupportEmail(): Promise<string> {
    const [row] = await this.db
      .select({ value: appSettings.value })
      .from(appSettings)
      .where(eq(appSettings.key, TEAM_SETTING_KEYS.supportEmail))
      .limit(1);

    const value = typeof row?.value === "string" ? row.value.trim() : "";
    return isEmail(value) ? value : "";
  }

  /* Read-only for public pages: exposes only the support address an
     administrator chose, never internal settings. */
  async publicInfo(): Promise<{ supportEmail: string }> {
    return { supportEmail: (await this.configuredSupportEmail()) || DEFAULT_SUPPORT_EMAIL };
  }

  async contactEmail(): Promise<string> {
    const support = await this.configuredSupportEmail();
    if (support) return support;

    const [row] = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, [TEAM_SETTING_KEYS.contactEmail]));

    const value = typeof row?.value === "string" ? row.value.trim() : "";
    if (value) return value;

    return process.env.CONTACT_EMAIL || process.env.SMTP_USER || DEFAULT_SUPPORT_EMAIL;
  }

  /* Financial enquiries go to a dedicated mailbox. Falls back to the general
     contact address only when the dedicated one is not configured. */
  async financialEmail(): Promise<string> {
    const support = await this.configuredSupportEmail();
    if (support) return support;

    const [row] = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, [TEAM_SETTING_KEYS.financialEmail]));

    const value = typeof row?.value === "string" ? row.value.trim() : "";
    if (value) return value;

    return process.env.FINANCIAL_EMAIL || DEFAULT_SUPPORT_EMAIL;
  }

  async surveyOpportunities(): Promise<SurveyOpportunity[]> {
    const [row] = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, [TEAM_SETTING_KEYS.surveyOpportunities]));

    return parseSurveyOpportunities(typeof row?.value === "string" ? row.value : "");
  }
}
