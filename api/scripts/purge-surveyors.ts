import * as dotenv from "dotenv";
import { and, inArray, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  surveyorAuditLog,
  surveyors,
  type SurveyorRow,
} from "@/db/drizzle/schema";

dotenv.config();

/**
 * Delete dormant surveyor profiles.
 *
 * Run manually after reviewing the count:
 *   npm run surveyors:purge -- --dry-run
 *   npm run surveyors:purge
 *
 * Only `inactive` and `rejected` profiles are candidates. The retention window
 * defaults to 365 days and can be overridden with SURVEYOR_RETENTION_DAYS.
 */
const RETENTION_DAYS = Number.parseInt(process.env.SURVEYOR_RETENTION_DAYS ?? "365", 10);

const UUID = (): string => crypto.randomUUID();

async function main(): Promise<void> {
  if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 30) {
    console.error("SURVEYOR_RETENTION_DAYS must be a number of at least 30.");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run");
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://kavi:kavi@localhost:5436/kavi_solutions",
  });
  const db = drizzle(pool);

  try {
    const candidates = await db
      .select()
      .from(surveyors)
      .where(
        and(
          inArray(surveyors.status, ["inactive", "rejected"]),
          lt(surveyors.updatedAt, cutoff),
        ),
      );

    if (candidates.length === 0) {
      console.log(`No surveyor profiles older than ${RETENTION_DAYS} days to purge.`);
      return;
    }

    console.log(
      `${dryRun ? "Would purge" : "Purging"} ${candidates.length} profile(s) inactive since before ${cutoff.toISOString()}:`,
    );
    for (const row of candidates) {
      console.log(`- ${row.name} <${row.email}> (${row.status}, updated ${row.updatedAt.toISOString()})`);
    }

    if (dryRun) return;

    await db.delete(surveyors).where(inArray(surveyors.id, candidates.map((row) => row.id)));

    await db.insert(surveyorAuditLog).values(
      candidates.map((row: SurveyorRow) => ({
        id: UUID(),
        surveyorId: row.id,
        action: "purged",
        actorEmail: "system:retention",
        detail: `Removed after ${RETENTION_DAYS} days as ${row.status}`,
      })),
    );

    console.log(`Purged ${candidates.length} profile(s).`);
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
