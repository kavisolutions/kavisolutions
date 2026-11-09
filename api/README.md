# Kavi Solutions — Backend (NestJS)

Replaces the Supabase backend of `kavi-solutions` (Next.js). Same API surface so the
frontend can be switched over with minimal changes:

- **PostgreSQL** — Drizzle ORM, plain SQL migrations in `src/db/drizzle/migrations`
- **Better Auth** — email/password + Google OAuth, admin plugin, bearer tokens
- **MinIO / S3** — avatar uploads (public-read bucket)
- **Nodemailer** — contact form + password reset

## Quick start

```bash
cp .env.example .env          # fill in SMTP/GitHub secrets as needed
docker compose up -d          # postgres :5436, minio :9002 (console :9003)
npm install
npm run db:migrate
npm run db:seed
npm run user:create -- --email you@example.com --password 'strong-pass' --name "Admin" --role admin
npm run start:dev             # http://localhost:3200  (docs: /api/docs)
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Nest watch mode |
| `npm run build` / `start:prod` | Production build / run |
| `npm run lint` / `type-check` / `test` | Quality gates |
| `npm run db:generate` | Generate migration from `schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed roles, teams, admins, settings |
| `npm run user:create -- --email … --password … --role admin` | Create or update a login (first admin) |

## Endpoints

All prefixed with `/api`. Auth routes are Better Auth: `/api/auth/*`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/health` | public | liveness |
| GET | `/team` | optional | members + roles + teams + settings + own member |
| POST | `/team` | admin | create member (optional `email`/`password` creates the login) |
| PATCH | `/team/:id` | owner or admin | update profile |
| DELETE | `/team/:id` | admin | remove member |
| GET | `/me` | optional | current user + member + org options |
| GET/POST | `/roles` | admin | list / create |
| PATCH/DELETE | `/roles/:id` | admin | rename (updates members) / delete |
| GET/POST | `/teams` | admin | list / create |
| PATCH/DELETE | `/teams/:id` | admin | rename / delete |
| GET/POST/DELETE | `/admins` | admin | allowlist (`?email=` on delete) |
| GET/PUT | `/settings` | admin | tagline / description / contact email |
| GET | `/projects` | public | list |
| POST/PATCH/DELETE | `/projects` | admin | create / update (`id` in body) / delete (`?id=`) |
| POST | `/upload` | signed-in | multipart `file`, ≤5 MB, jpeg/png/webp/gif |
| POST | `/contact` | public, throttled | sends mail to the configured contact address |

Auth: send the Better Auth token as `Authorization: Bearer <token>` **or** rely on the
session cookie (same origin). Sign-in: `POST /api/auth/sign-in/email`.

## Auth model

- `user.role = "admin"` (admin plugin) → admin.
- Emails in `ADMIN_EMAILS` → admin (checked on every request).
- Emails in the `admins` table → admin (managed from the admin panel).
- Sign-up is disabled; logins are created by admins (or `npm run user:create`).

## MinIO

`docker-compose.yml` starts MinIO and creates the `avatars` bucket with public read.
In production point `S3_ENDPOINT` at your MinIO instance and set `S3_PUBLIC_URL` to the
public URL served by Nginx (e.g. `https://cdn.kavisolutions.in/avatars`).

## Deployment (VPS, PM2 + Nginx)

```bash
npm ci
npm run build
npm run db:migrate
pm2 start ecosystem.config.js
pm2 save
```

`ecosystem.config.js` runs the app on port `3200`. Add an Nginx `location /api/` (or a
subdomain) that proxies to it, and keep the existing Next.js site on `3111`.

## Frontend migration notes

The Next.js app currently calls its own `/api/*` routes backed by Supabase. To switch:

1. Set `NEXT_PUBLIC_API_URL` to this service (e.g. `https://api.kavisolutions.in`).
2. Replace `supabaseBrowser.auth.getSession()` token plumbing with Better Auth client
   (`createAuthClient` from `better-auth/react`) and call
   `authClient.signIn.email(...)` on the login page.
3. Point the fetch helpers at `${NEXT_PUBLIC_API_URL}/api/...` and keep the same
   JSON shapes — responses intentionally match the old Next routes
   (`members`, `roles`, `teams`, `settings`, `projects`, `isAdmin`, `member`, …).
4. Uploads: replace `/api/upload` FormData with the same endpoint on this service
   (`Authorization: Bearer` + `file` field). Response is `{ url }`.
5. Remove `@supabase/supabase-js` and `lib/supabase.ts`, `lib/server-auth.ts`,
   `lib/auth-context.tsx`; delete `supabase/` migrations after data is copied.
