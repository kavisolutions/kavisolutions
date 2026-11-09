import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";

import { env } from "@/config/env";
import { DATABASE } from "@/db/drizzle/drizzle.module";
import type { Database } from "@/db/drizzle/drizzle.client";
import { admins } from "@/db/drizzle/schema";
import { isEmail, parseAdminEmails } from "@/_shared/text";

@Injectable()
export class AdminsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list() {
    const envEmails = parseAdminEmails(env.ADMIN_EMAILS);
    const rows = await this.db
      .select()
      .from(admins)
      .orderBy(asc(admins.createdAt));

    const dbEmails = new Set(rows.map((row) => row.email.toLowerCase()));

    const entries = [
      ...envEmails.map((email) => ({ email, source: "env" as const })),
      ...rows
        .filter((row) => !envEmails.includes(row.email.toLowerCase()))
        .map((row) => ({ email: row.email.toLowerCase(), source: "db" as const })),
    ];

    return { admins: entries, envEmails, dbEmails: Array.from(dbEmails) };
  }

  async add(emailInput: unknown) {
    const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
    if (!isEmail(email)) {
      throw new BadRequestException("Enter a valid email address");
    }

    await this.db
      .insert(admins)
      .values({ email })
      .onConflictDoNothing({ target: admins.email });

    return { ok: true, email };
  }

  async remove(emailInput: string) {
    const email = (emailInput || "").trim().toLowerCase();
    if (!isEmail(email)) {
      throw new BadRequestException("Enter a valid email address");
    }

    const envEmails = parseAdminEmails(env.ADMIN_EMAILS);
    if (envEmails.includes(email)) {
      throw new BadRequestException(
        "This admin comes from the ADMIN_EMAILS env var and cannot be removed here",
      );
    }

    await this.db.delete(admins).where(eq(admins.email, email));
    return { ok: true };
  }
}
