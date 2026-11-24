import { Injectable } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import type { IncomingHttpHeaders } from "node:http";

import { hasAdminRole, isAdminCandidate, matchesAdminEmail } from "@/_shared/admin-check";
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
    // Role and env allowlist need no DB hit; most requests stop here.
    if (hasAdminRole(user.role)) return true;
    if (matchesAdminEmail(user.email, env.adminEmails)) return true;

    const email = user.email.trim().toLowerCase();
    const [row] = await db
      .select({ email: admins.email })
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    return isAdminCandidate(user, env.adminEmails, row ? [row.email] : []);
  }
}
