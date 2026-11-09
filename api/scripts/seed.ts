import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { admins, appSettings, roles, teams } from "@/db/drizzle/schema";

dotenv.config();

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ?? "postgres://kavi:kavi@localhost:5436/kavi_solutions",
  });
  const db = drizzle(pool);

  await db
    .insert(roles)
    .values([
      { id: "volunteer", name: "Volunteer", sortOrder: 1 },
      { id: "intern", name: "Intern", sortOrder: 2 },
      { id: "fellow", name: "Fellow", sortOrder: 3 },
      { id: "mentor", name: "Mentor", sortOrder: 4 },
      { id: "partner", name: "Partner", sortOrder: 5 },
    ])
    .onConflictDoNothing();

  await db
    .insert(teams)
    .values([
      { id: "core-team", name: "Core Team", sortOrder: 1 },
      { id: "marketing-team", name: "Marketing Team", sortOrder: 2 },
      { id: "tech-team", name: "Tech Team", sortOrder: 3 },
      { id: "operations-team", name: "Operations Team", sortOrder: 4 },
    ])
    .onConflictDoNothing();

  await db
    .insert(admins)
    .values([
      { email: "tejasimma36@gmail.com" },
      { email: "kavitha@kavisolutions.in" },
    ])
    .onConflictDoNothing();

  await db
    .insert(appSettings)
    .values([
      { key: "team_tagline", value: "" },
      { key: "team_description", value: "" },
      { key: "contact_email", value: "kavisolutions1@gmail.com" },
    ])
    .onConflictDoNothing();

  await pool.end();
  console.log("Seed complete");
}

void main();
