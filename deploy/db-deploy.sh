#!/usr/bin/env bash
#
# Apply supabase/migrations/*.sql to the production database.
#
# Runs ON the app server. Reaches the DB server over SSH and applies each
# migration inside the kavi-db container. Applied versions are tracked in
# public.schema_migrations so re-runs are safe and idempotent.
#
# Usage:
#   ./deploy/db-deploy.sh                        # apply pending migrations
#   SKIP_DB_MIGRATIONS=1 ./deploy/deploy.sh      # skip from deploy.sh
#
# One-time setup (already done on current servers):
#   - app server has key /root/.ssh/kavi_db_deploy
#   - its pubkey is authorized for ubuntu@DB host
#
# Overridable env:
#   DB_SSH_USER       (default: ubuntu)
#   DB_SSH_HOST       (default: 129.225.94.113)
#   DB_SSH_KEY        (default: /root/.ssh/kavi_db_deploy)
#   DB_CONTAINER      (default: kavi-db)
#   DB_USER           (default: supabase_admin)
#   DB_NAME           (default: postgres)
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="${APP_DIR}/supabase/migrations"

DB_SSH_USER="${DB_SSH_USER:-ubuntu}"
DB_SSH_HOST="${DB_SSH_HOST:-129.225.94.113}"
DB_SSH_KEY="${DB_SSH_KEY:-/root/.ssh/kavi_db_deploy}"
DB_CONTAINER="${DB_CONTAINER:-kavi-db}"
DB_USER="${DB_USER:-supabase_admin}"
DB_NAME="${DB_NAME:-postgres}"

SSH_TARGET="${DB_SSH_USER}@${DB_SSH_HOST}"

# Run psql on the DB server with SQL on stdin (safe for multi-line files).
psql_stdin() {
  ssh -i "${DB_SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=yes \
    "${SSH_TARGET}" \
    "docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} -v ON_ERROR_STOP=1 -q" \
    "$@"
}

# Run a single psql -c "<query>" on the DB server.
# NOTE: args cannot be passed through ssh separately — embed them in the
# remote command string so the remote shell quotes correctly.
psql_c() {
  local query="$1"
  local extra="${2:-}"
  ssh -i "${DB_SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=yes \
    "${SSH_TARGET}" \
    "docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME} -v ON_ERROR_STOP=1 -q ${extra} -c \"${query}\""
}

echo "==> DB deploy via ${SSH_TARGET} (container: ${DB_CONTAINER})"

if [ ! -d "${MIGRATIONS_DIR}" ]; then
  echo "ERROR: migrations dir not found: ${MIGRATIONS_DIR}"
  exit 1
fi

# Tracking table (safe to re-run).
psql_stdin <<'SQL'
create table if not exists public.schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);
SQL

applied_any=0
for f in "${MIGRATIONS_DIR}"/*.sql; do
  [ -e "$f" ] || continue
  version="$(basename "$f" .sql)"

  already="$(psql_c "select 1 from public.schema_migrations where version = '${version}'" "-tA" | tr -d '[:space:]')"
  if [ "${already}" = "1" ]; then
    echo "    skip   ${version} (already applied)"
    continue
  fi

  echo "    apply  ${version}"
  psql_stdin < "$f"
  psql_c "insert into public.schema_migrations (version) values ('${version}') on conflict do nothing;"
  applied_any=1
done

if [ "${applied_any}" = "0" ]; then
  echo "==> No pending migrations."
else
  echo "==> Migrations applied."
fi

echo "==> Tracked versions:"
psql_c "select version from public.schema_migrations order by version;" "-tA"

echo "==> public tables on prod:"
psql_stdin <<'SQL'
\dt public.*
SQL
