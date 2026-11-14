# Docker local stack

Run the whole Kavi Solutions stack locally without installing Node, Postgres or
MinIO on the host.

## What runs

| Service | Container | Host port | Purpose |
| --- | --- | --- | --- |
| `web` | `kavi-solutions-web` | `3100` | Next.js production build |
| `api` | `kavi-solutions-api` | `3200` | NestJS API |
| `postgres` | `kavi-solutions-postgres` | `5437` | PostgreSQL 16 |
| `minio` | `kavi-solutions-minio` | `9004` / `9005` | S3 storage API / console |
| `minio-init` | `kavi-solutions-minio-init` | — | Creates `avatars` + `certificates` buckets |
| `api-migrate` | `kavi-solutions-api-migrate` | — | Applies Drizzle migrations once |
| `social-agent` | `kavi-solutions-social-agent` | `3301` | Optional sidecar |

The ports are deliberately different from the normal host setup (`3000`,
`:5436`, `:9002`) so the Docker stack can run beside an existing local dev
environment.

## Verified locally

This stack was built and tested on 2026-11-14:

- `postgres`, `minio`, `api` and `web` all reported healthy
- Drizzle migrations and the seed script completed
- admin login worked through the web proxy (`/api/auth/sign-in/email`)
- `/api/me` returned the admin session
- `/survey`, `/financial`, `/government` and `/farms` returned 200 once enabled
- form endpoints rejected empty payloads with 400
- avatar upload returned 201 and the public MinIO URL returned 200
- the optional `social-agent` image built successfully

## 1. Prepare the env file

Runtime values come from Env Manager:

```bash
./scripts/env-manager.sh pull local
```

That writes `api/.env` (from `kavi-solutions-be/be-local`) and
`app/.env.local` (from `kavi-solutions/fe-local`). The tokens live in
`~/.config/kavi/`; see [`env-manager.md`](env-manager.md).

If you do not have Env Manager access, fall back to the example file:

```bash
cp api/.env.example api/.env
```

The compose file overrides the database, storage and auth URLs to point at the
Docker network, so the `localhost` values in `api/.env` are only used if you
run the API outside compose.

Do **not** commit `api/.env` or `app/.env.local`.

## 2. Build and start

```bash
docker compose up --build
```

First run builds the images, starts Postgres and MinIO, creates the buckets,
runs migrations and starts the API and web app.

Open:

- Web: <http://localhost:3100>
- API health: <http://localhost:3200/api/health>
- MinIO console: <http://localhost:9005> (`minioadmin` / `minioadmin` by default)

## 3. Verify

```bash
docker compose ps
curl http://localhost:3200/api/health
curl http://localhost:3100/api/pages
```

Expected:

```json
{"status":"ok","timestamp":"..."}
```

`/api/pages` should return all page switches (`survey`, `financial`,
`government`, `farms`).

Run the application checks inside the images if needed:

```bash
docker compose run --rm api npm test -- --runInBand
docker compose run --rm web npm test
```

## 4. Seed local data

The Docker Postgres volume starts empty. Create the baseline roles, teams and
settings, then add a local admin login:

```bash
docker compose run --rm api-migrate npm run db:seed
docker compose run --rm api-migrate npm run user:create -- \
  --email admin@kavi.local \
  --password '<choose-a-local-password>' \
  --name 'Docker Admin' \
  --role admin
```

Use that email/password at <http://localhost:3100/login>. These credentials exist
only in the local Docker database; do not reuse them anywhere else.

The public page switches live in `app_settings`. Enable the pages you want to
test:

```bash
docker compose exec postgres psql -U kavi -d kavi_solutions -c "
  insert into app_settings(key, value, updated_at)
  values
    ('page_survey_enabled', 'true', now()),
    ('page_financial_enabled', 'true', now()),
    ('page_government_enabled', 'true', now()),
    ('page_farms_enabled', 'true', now())
  on conflict (key) do update set value = 'true', updated_at = now();
"
```

Set them back to `false` with the same command when you want to verify the
hidden-page 404 behaviour.

## 5. Apply new migrations

The `api-migrate` service runs once on `up`. After changing
`api/src/db/drizzle/schema.ts`, generate the migration and re-run the job:

```bash
npm --prefix api run db:generate
docker compose run --rm api-migrate
docker compose restart api
```

## 6. Logs and shell

```bash
docker compose logs -f web
docker compose logs -f api
docker compose exec api sh
docker compose exec postgres psql -U kavi -d kavi_solutions
```

## 7. Stop and reset

Stop containers, keep data:

```bash
docker compose down
```

Stop and delete the local database, MinIO objects and all containers:

```bash
docker compose down -v
```

## 8. Optional social-agent sidecar

The sidecar needs its own env file:

```bash
cp social-agent/.env.example social-agent/.env
# fill in ADMIN_TOKEN, ENCRYPTION_KEY, Google Drive, LLM, Telegram and platform keys
docker compose --profile social up --build
```

The API uses `SOCIAL_AGENT_URL` / `SOCIAL_AGENT_ADMIN_TOKEN` from your shell or
from `api/.env`. To connect the compose services:

```bash
SOCIAL_AGENT_URL=http://social-agent:3300 \
SOCIAL_AGENT_ADMIN_TOKEN=<same as social-agent ADMIN_TOKEN> \
docker compose --profile social up --build
```

`social-agent/data` is bind-mounted, so the SQLite database and public media
survive container rebuilds.

## 9. Common issues

### `api/.env` not found

Copy `api/.env.example` and fill it in. Compose intentionally fails loudly
rather than starting the API with missing auth/database configuration.

### `api-migrate` fails

Check that Postgres is healthy:

```bash
docker compose logs postgres
docker compose run --rm api-migrate
```

The migration job uses the `builder` image target because Drizzle Kit is a dev
dependency. The runtime API image does not include it.

### Web returns 500/404 for `/api/*`

`BACKEND_URL` is baked into the Next.js rewrites at build time. Rebuild the web
image after changing it:

```bash
docker compose build web
docker compose up -d web
```

### Port already in use

Override host ports without editing the file:

```bash
WEB_PORT=3201 API_PORT=3202 docker compose up --build
```

### MinIO health check fails

The MinIO image's health check uses `mc ready local`. If the image variant does
not include `mc`, change the health check to:

```yaml
test: ["CMD-SHELL", "curl -f http://localhost:9000/minio/health/live || exit 1"]
```

## 10. Production note

This compose file is for local testing first. The production VPS currently runs
the apps under PM2 + Nginx. Before switching production:

1. Prove the compose stack locally.
2. Run a staging stack on separate ports on the VPS.
3. Point Nginx upstreams at the Docker web container.
4. Keep PM2 stopped for one rollback window.
5. Review backups, log rotation and image registry policy.

The VPS is `aarch64`, so build multi-arch images (or build on the server) rather
than assuming an x86 image will run there.
