# AGENTS

## Project

NestJS 11 backend for kavisolutions.in: PostgreSQL + Drizzle, Better Auth (email/password,
Google OAuth, admin + bearer plugins), MinIO/S3 uploads, Nodemailer contact form.

## Commands

- `npm run start:dev` — dev server on :3200
- `npm run build` / `npm run start:prod`
- `npm run lint` / `npm run type-check` / `npm test` — must all pass before finishing
- `npm run db:generate` → `npm run db:migrate` after any `src/db/drizzle/schema.ts` change
- `npm run db:seed`, `npm run user:create -- --email … --password … --role admin`

## Rules

- Schema lives only in `src/db/drizzle/schema.ts`. Never edit generated migration SQL by
  hand; regenerate instead.
- Every route is authenticated by the global `AuthGuard` unless decorated with `@Public()`,
  `@OptionalAuth()` or `@AdminOnly()` (see `src/auth/auth.decorators.ts`).
- Response shapes must stay compatible with the old Next.js API (see README table).
- Local services: `docker compose up -d` (Postgres :5436, MinIO :9002/:9003).
- Do not commit `.env`.
