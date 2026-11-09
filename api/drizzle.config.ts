import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
  schema: "./src/db/drizzle/schema.ts",
  out: "./src/db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://kavi:kavi@localhost:5436/kavi_solutions",
  },
  strict: true,
  verbose: true,
});
