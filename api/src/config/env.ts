import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const csv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3200),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3200"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z
    .string()
    .default("true")
    .transform((value) => value === "true" || value === "1"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  CONTACT_EMAIL: z.string().optional(),
  S3_ENDPOINT: z.string().url().default("http://localhost:9002"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("avatars"),
  /* Certificate PDFs live in their own bucket and are NOT public-read:
     IDs are sequential, so a public bucket would let anyone enumerate
     every recipient. Files are streamed through the API instead. */
  S3_CERTIFICATES_BUCKET: z.string().default("certificates"),
  S3_ACCESS_KEY: z.string().default("minioadmin"),
  S3_SECRET_KEY: z.string().default("minioadmin"),
  S3_FORCE_PATH_STYLE: z
    .string()
    .default("true")
    .transform((value) => value === "true" || value === "1"),
  S3_PUBLIC_URL: z.string().url().default("http://localhost:9002/avatars"),
  /* Optional social-agent sidecar (social-agent/). Admin panel proxies to it;
     when unset, /api/admin/social/* reports "not configured" instead of
     failing the rest of the admin console. Empty strings in .env count as
     unset so a copied template does not break startup. */
  SOCIAL_AGENT_URL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url().optional(),
  ),
  SOCIAL_AGENT_ADMIN_TOKEN: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = {
  ...parsed.data,
  corsAllowedOrigins: csv(parsed.data.CORS_ALLOWED_ORIGINS),
  adminEmails: csv(parsed.data.ADMIN_EMAILS).map((email) => email.toLowerCase()),
  googleEnabled: Boolean(parsed.data.GOOGLE_CLIENT_ID && parsed.data.GOOGLE_CLIENT_SECRET),
};

export type Env = typeof env;
