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
| GET | `/certificates/:id` | public, uncached | verify one certificate (404 when unknown) |
| GET | `/certificates` | admin | list, including revocation audit fields |
| POST | `/certificates` | admin | record / update an issued certificate |
| POST | `/certificates/revoke` | admin | revoke (`status`, `revokedOn`, `revokedReason`) |
| POST | `/certificates/reinstate` | admin | bring a revoked certificate back to `issued` |
| DELETE | `/certificates?id=` | admin | soft delete (hidden, no longer verifiable, recoverable) |
| POST | `/certificates/restore` | admin | clear a soft delete |
| POST | `/certificates/:id/pdf` | admin | attach a generated PDF (multipart `file`, ≤10 MB) |
| GET | `/certificates/:id/pdf` | public, uncached | stream the stored PDF |
| DELETE | `/certificates/:id/pdf` | admin | remove the stored PDF |
| POST | `/upload` | signed-in | multipart `file`, ≤5 MB, jpeg/png/webp/gif |
| POST | `/contact` | public, throttled | sends mail to the configured contact address |
| POST | `/survey/enquiries` | public, throttled | survey page forms (`kind`: `client` \| `surveyor`) |
| POST | `/financial/enquiries` | public, throttled | financial page forms (`kind`: `individual` \| `business`) |
| POST | `/surveyors/register` | public, throttled | surveyor network registration (stored) || GET | `/surveyors` | admin | list (`?status=`, `?search=`) |
| PATCH | `/surveyors/:id` | admin | profile, notes and status workflow |
| DELETE | `/surveyors/:id` | admin | remove a profile |
| POST | `/surveyors/:id/resend` | admin | re-send the notification email |

Certificates are generated offline from the `certificates/` library; the API only
keeps the record that makes `/verify/<id>` work. Revoked records still resolve but
show as invalid and hide the recipient name. Re-recording an existing certificate
never un-revokes it — that is what `POST /certificates/reinstate` is for.

Deletes are soft (`deleted_at`): the row is kept for the audit trail, the public
lookup returns 404, and `GET /certificates?includeDeleted=true` plus
`POST /certificates/restore` makes a mistake reversible. Re-recording a deleted
ID also clears the tombstone.

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

Certificate PDFs use a second bucket, `S3_CERTIFICATES_BUCKET` (default
`certificates`). It is created automatically and is **deliberately private**:
certificate IDs are sequential, so a public bucket would let anyone enumerate
every recipient. Files are served by `GET /api/certificates/:id/pdf`, which
streams the object and never reveals the key. Object keys are
`certificates/<year>/<CERTIFICATE_ID>.pdf`.

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

## Frontend

The Next.js app in `../app` calls `/api/*` on its own origin; Next.js proxies
those requests here via the `BACKEND_URL` rewrite (`app/next.config.ts`). Auth is
Better Auth through `createAuthClient` in `app/lib/auth-context.tsx`.
