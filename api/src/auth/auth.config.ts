import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin, bearer } from "better-auth/plugins";
import { verifyPassword as verifyScryptPassword } from "better-auth/crypto";
import bcrypt from "bcryptjs";

import { sendPasswordResetEmail } from "@/_shared/mailer";
import { env } from "@/config/env";
import { db } from "@/db/drizzle/drizzle.client";
import { account, session, user, verification } from "@/db/drizzle/schema";

export const auth = betterAuth({
  appName: "Kavi Solutions",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.corsAllowedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // Accounts are provisioned by admins from the admin panel.
    disableSignUp: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user: resetUser, url }) => {
      await sendPasswordResetEmail(resetUser.email, url);
    },
    password: {
      // Legacy Supabase (GoTrue) hashes are bcrypt; new passwords use scrypt.
      verify: async ({ hash, password }) => {
        if (/^\$2[aby]\$/.test(hash)) {
          return bcrypt.compare(password, hash);
        }
        return verifyScryptPassword({ hash, password });
      },
    },
  },
  socialProviders: env.googleEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID as string,
          clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},
  plugins: [admin(), bearer()],
  advanced: {
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
});

export type Auth = typeof auth;
