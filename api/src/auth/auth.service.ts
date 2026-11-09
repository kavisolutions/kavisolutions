import { Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "node:http";

import { isAdminCandidate } from "@/_shared/admin-check";
import { env } from "@/config/env";
import { db } from "@/db/drizzle/drizzle.client";
import { admins } from "@/db/drizzle/schema";
import { auth } from "@/auth/auth.config";
import type { SessionUser } from "@/auth/auth.types";

@Injectable()
export class AuthService {
  readonly instance = auth;

  async getSession(headers: IncomingHttpHeaders): Promise<SessionUser | null> {
    const result = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
    return (result?.user as SessionUser | undefined) ?? null;
  }

  async isAdmin(user: SessionUser | null): Promise<boolean> {
    if (!user?.email) return false;

    const rows = await db.select({ email: admins.email }).from(admins);
    const dbEmails = rows.map((row) => row.email);

    return isAdminCandidate(user, env.adminEmails, dbEmails);
  }
}
