import { Inject, Injectable } from "@nestjs/common";
import { inArray } from "drizzle-orm";

import { sanitizeText } from "@/_shared/text";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { appSettings } from "@/db/drizzle/schema";
import type { UpdateFellowshipPolicyDto } from "@/modules/fellowship-policy/dto/update-fellowship-policy.dto";

export type FellowshipPolicy = {
  fee: string;
  scholarship: string;
  stipend: string;
  accommodation: string;
  insurance: string;
  eligibility: string;
  leave: string;
  cohortNote: string;
  nextIntake: string;
  seats: string;
  updatedAt: string | null;
};

const PREFIX = "fellowship.";

export const FELLOWSHIP_POLICY_DEFAULTS: Omit<FellowshipPolicy, "updatedAt"> = {
  fee: "No payment is collected through this website. Contribution and scholarship options are confirmed in writing before an offer.",
  scholarship: "Scholarship options are discussed before an offer and recorded in the cohort terms.",
  stipend: "There is no salary during the learning phase. A project stipend is paid only when confirmed in writing for a specific project.",
  accommodation: "Accommodation and food arrangements are cohort-specific. Ask for the written cohort terms before accepting an offer.",
  insurance: "Insurance or medical support is cohort-specific. Ask for the written cohort terms before accepting an offer.",
  eligibility:
    "Diploma graduates, final-year students, graduates, women returning to work and career switchers can apply. The programme is full-time for 11 months.",
  leave:
    "Sunday is protected rest. Leave outside the published calendar is agreed with the programme team before the cohort begins.",
  cohortNote:
    "Cohort residencies are announced per batch. A specific city is not guaranteed; allocation depends on track, project and cohort fit.",
  nextIntake: "January 2027",
  seats: "Limited seats · confirmed per cohort",
};

const KEYS = Object.keys(FELLOWSHIP_POLICY_DEFAULTS) as Array<
  keyof typeof FELLOWSHIP_POLICY_DEFAULTS
>;

@Injectable()
export class FellowshipPolicyService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async get(): Promise<FellowshipPolicy> {
    const rows = await this.db
      .select()
      .from(appSettings)
      .where(inArray(appSettings.key, KEYS.map((key) => `${PREFIX}${key}`)));

    const values = { ...FELLOWSHIP_POLICY_DEFAULTS } as FellowshipPolicy;
    let updatedAt: string | null = null;

    for (const row of rows) {
      const key = row.key.slice(PREFIX.length) as keyof typeof FELLOWSHIP_POLICY_DEFAULTS;
      if (key in FELLOWSHIP_POLICY_DEFAULTS) {
        values[key] = row.value ?? FELLOWSHIP_POLICY_DEFAULTS[key];
      }
      if (row.updatedAt && (!updatedAt || row.updatedAt.toISOString() > updatedAt)) {
        updatedAt = row.updatedAt.toISOString();
      }
    }

    return { ...values, updatedAt };
  }

  async update(payload: UpdateFellowshipPolicyDto): Promise<FellowshipPolicy> {
    const entries = Object.entries(payload).filter(
      ([, value]) => typeof value === "string",
    ) as Array<[keyof UpdateFellowshipPolicyDto, string]>;

    await Promise.all(
      entries.map(([key, value]) => {
        const clean = sanitizeText(value, 400);
        return this.db
          .insert(appSettings)
          .values({ key: `${PREFIX}${key}`, value: clean })
          .onConflictDoUpdate({
            target: appSettings.key,
            set: { value: clean, updatedAt: new Date() },
          });
      }),
    );

    return this.get();
  }
}
