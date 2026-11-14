# Env Manager integration

Runtime configuration is pulled from
[Env Manager](https://env.arkasodhara.tech) instead of being typed into
`.env` files by hand. The repository never contains the values or the deploy
tokens.

## Project mapping

| App | Env Manager project | Local env | Production env |
| --- | --- | --- | --- |
| NestJS API | `kavi-solutions-be` | `be-local` | `be-production` |
| Next.js web | `kavi-solutions` | `fe-local` | `fe-production` |
| Social agent | `social-agent` | not wired yet | not wired yet |

`kavi-solutions` also has empty `be-local` / `be-production` envs and
`kavi-solutions-be` has empty `fe-local` / `fe-production` envs. They are legacy
duplicates; use the mapping above.

## Pull manually

```bash
cd /home/teja/Desktop/projects/kavi/kavi-solutions

./scripts/env-manager.sh check local       # keys only, no writes
./scripts/env-manager.sh pull local        # api/.env + app/.env.local
./scripts/env-manager.sh pull production   # api/.env + app/.env.production
```

The npm aliases are:

```bash
npm run env:pull:local
npm run env:check:local
npm run env:pull:production
```

`pull production` writes production values into `api/.env` and
`app/.env.production`. Run it on the server, not on a developer machine, unless
you deliberately want to inspect or test production configuration.

## Deploy tokens

Read-only project tokens are stored outside the repository:

```text
~/.config/kavi/env-manager-be.token    # kavi-solutions-be
~/.config/kavi/env-manager-fe.token    # kavi-solutions
```

Permissions are `0600`. On the Kavi VPS the same files exist under
`/home/ubuntu/.config/kavi/` for the deploy user.

The script also accepts:

```bash
ENV_MANAGER_TOKEN_BE=em_...
ENV_MANAGER_TOKEN_FE=em_...
```

Do not commit these tokens, paste them into a ticket, or put them in the repo.

### Rotate a token

1. Log in to Env Manager.
2. Open the project → Tokens.
3. Revoke the old `deploy` token.
4. Create a new token named `deploy`.
5. Write it to the local/server token file with `chmod 600`.
6. Run `./scripts/env-manager.sh check production` to verify.

## How local Docker uses it

```bash
./scripts/env-manager.sh pull local
docker compose up --build
```

or:

```bash
npm run docker:local
```

`api/.env` comes from `kavi-solutions-be/be-local`. Compose then overrides the
container-only URLs:

```text
DATABASE_URL   -> postgres://...@postgres:5432/kavi_solutions
S3_ENDPOINT    -> http://minio:9000
S3_PUBLIC_URL  -> http://localhost:9004/avatars
BETTER_AUTH_URL / FRONTEND_URL / CORS -> http://localhost:3100
```

That means the Env Manager values can keep using host-local ports (`5436`,
`9002`, `3000`) while the same file works inside the Docker network.

## How production deploy uses it

`deploy/deploy.sh` now runs:

```bash
scripts/env-manager.sh pull production
```

before installing, migrating and building. The server tokens are read from
`~/.config/kavi/`. If the pull fails, deployment stops rather than silently
using stale values.

Emergency fallback (uses the env files already on disk):

```bash
ENV_PULL=0 ./deploy/deploy.sh --no-pull
```

Do not make this the normal path.

## What was migrated

On 2026-11-14 the production values were copied from the running server:

- `/var/www/kavi-solutions/api/.env` → `kavi-solutions-be/be-production`
- `/var/www/kavi-solutions/app/.env.production` → `kavi-solutions/fe-production`

Keys were verified to match. Values are only in Env Manager and on the server;
they are not in this repository.

## TLS note

The Env Manager certificate is currently mismatched, so the script uses
`curl -k`. Once the certificate is fixed:

```bash
ENV_MANAGER_INSECURE=0 ./scripts/env-manager.sh check production
```

and then make `ENV_MANAGER_INSECURE=0` the default in the script.

## Updating variables

The Env Manager `PUT` endpoint **replaces the whole env**. Always read first,
merge, then write the full list. Use the dashboard for one-off edits, or the
API documented in the Env Manager skill. Never store generated production
secrets in a local `.env` and forget to update Env Manager.

## Not covered yet

- `social-agent` has its own project in Env Manager but the Docker/PM2 deploy
  does not pull it yet.
- GitHub Actions still reaches the server over SSH; the tokens live on the
  server, not in GitHub secrets. Moving them to GitHub secrets is a later
  improvement.
