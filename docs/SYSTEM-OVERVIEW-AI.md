---
schema_version: 1
doc_id: kavi-solutions-system-overview-ai
generated: 2026-11-26
repo_root: /home/teja/Desktop/projects/kavi/kavi-solutions
companion_human_doc: docs/SYSTEM-OVERVIEW.md
scope: "All running services, routes, data ownership, auth, integrations, deployment topology. Excludes future/proposed features except where explicitly marked status: not_built."
service_count_today: 5
source_priority:
  - code
  - deploy configs (nginx / ecosystem / compose / workflow)
  - README.md
  - OPS-RUNBOOK.md
  - docs/*.md
paths: "All paths below are relative to repo_root unless absolute."
conventions:
  port: "TCP port of the running process"
  process: "PM2 app name in production"
  auth_levels: [public, optional, authenticated, admin, throttled]
---

# Kavi Solutions — Machine-Readable System Context

This document is optimized for LLM ingestion: explicit facts, stable identifiers, no narrative filler.
For prose explanation use `docs/SYSTEM-OVERVIEW.md`.

## 1. Service registry (authoritative, current)

```yaml
services:
  - id: web_main
    name: Main web
    kind: frontend
    status: live
    port: 3111
    process: kavi-solutions
    code: app/
    stack: [Next.js 16.3.2, React 19, Tailwind CSS 4, Framer Motion 13, Three.js 0.187]
    output: standalone
    database: none
    serves:
      - public marketing pages
      - /dashboard, /profile
      - all /admin screens
    upstreams:
      backend: "BACKEND_URL (default http://127.0.0.1:3200)"
      survey_frontend: "SURVEY_SERVICE_URL (default http://localhost:3004)"
    memory_restart_mb: 300

  - id: api_main
    name: Main API
    kind: backend
    status: live
    port: 3200
    process: kavi-solutions-be
    code: api/
    entry: api/src/main.ts
    stack: [NestJS 11, Drizzle, PostgreSQL 16, Better Auth 1.7.18, MinIO/S3]
    database: shared_postgres
    owns_background_jobs: true
    owns_whatsapp_socket: true
    memory_restart_mb: 400

  - id: api_survey
    name: Survey API
    kind: backend
    status: live
    port: 3201
    process: kavi-solutions-survey-be
    code: api/            # SAME source tree and dist as api_main
    entry: api/dist/main.js
    database: shared_postgres
    env_overrides:
      FELLOWSHIP_AUTOMATION_ENABLED: "false"
      WHATSAPP_AUTOCONNECT: "false"
      CORS_ALLOWED_ORIGINS: "https://kavisolutions.in,https://www.kavisolutions.in"
    notes:
      - "Second PM2 process; isolates Survey uptime from main API restarts."
      - "All controllers/exports identical to api_main; only env differs."
      - "Manual POST /api/fellowship-programme/automation/run still works here."

  - id: web_survey
    name: Survey frontend
    kind: frontend
    status: live
    port: 3004
    process: kavi-survey
    code: survey/
    git: "git submodule -> https://github.com/kavi-solutions/kavi-survey-research"
    pinned_sha_source: "git ls-tree HEAD survey during deploy"
    stack: [Next.js 16, React 19, Tailwind CSS 4]
    basePath: /survey
    database: none         # no DB client in this codebase
    server_api_base: "API_BASE_URL (prod http://127.0.0.1:3201)"
    browser_api_base: "NEXT_PUBLIC_API_BASE_URL (prod /survey-api)"
    memory_restart_mb: 300

  - id: social_agent
    name: Social agent
    kind: sidecar
    status: live_optional   # deploy starts only if social-agent/.env exists
    port: 3300
    host: 127.0.0.1
    process: kavi-social-agent
    code: social-agent/
    entry: social-agent/dist/index.js
    stack: [Fastify, better-sqlite3, sharp, @napi-rs/canvas]
    database: social_agent_sqlite   # NOT the shared Postgres
    db_path: "DATABASE_PATH, default ./data/app.db"
    db_features: [WAL, AES-256-GCM encrypted tokens]
    protected_by: "x-admin-token === ADMIN_TOKEN"
    memory_restart_mb: 400
```

## 2. Infrastructure dependencies

```yaml
infrastructure:
  - id: postgres_shared
    engine: PostgreSQL 16
    container: kavi-pg
    prod_bind: 127.0.0.1:5436
    local_compose_bind: "${POSTGRES_PORT:-5437}:5432"
    used_by: [api_main, api_survey]
    role: "single source of truth for all app data; remaining SPOF between main and survey"

  - id: minio
    engine: MinIO
    containers: [kavi-minio]
    prod_ports: ["127.0.0.1:9002", "127.0.0.1:9003"]
    local_compose_ports: ["${MINIO_PORT:-9004}:9000", "${MINIO_CONSOLE_PORT:-9005}:9001"]
    buckets:
      - name: "S3_BUCKET (avatars)"
        access: public-read
        content: "profile photos, ≤5 MB, jpeg/png/webp/gif"
      - name: "S3_CERTIFICATES_BUCKET"
        access: private
        content: "certificate PDFs, year-sharded keys certificates/<year>/<id>.pdf, streamed via API"
    init_job: minio-init

  - id: smtp
    kind: external
    env: [SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_EMAIL]
    usage: "contact, password reset, survey, financial/government/farms, fellowship mail"

  - id: google_oauth
    kind: external
    optional_when: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET both set"
    callback: "https://kavisolutions.in/api/auth/callback/google"

  - id: whatsapp_baileys
    kind: external
    owner: api_main only
    disabled_on: api_survey
    env_flag: WHATSAPP_AUTOCONNECT

  - id: social_external_apis
    owner: social_agent only
    items: [Google Drive, Telegram Bot API, LinkedIn v2, Meta Graph v21.0 (Facebook Page + Instagram), Gemini/OpenAI/Groq/Cloudflare LLM, vision models, image generation providers, Pexels/Wikimedia/Pollinations]
```

## 3. HTTP routing (production, nginx :443)

```yaml
locations:
  - path: "/"
    upstream: "127.0.0.1:3111"
    notes: "Next.js app; /api/* handled by Next rewrite, NOT nginx"
  - path: "/_next/static/"
    upstream: "127.0.0.1:3111"
    headers: "public, max-age=31536000, immutable"
  - path: "/public/"
    upstream: "alias /var/www/kavi-solutions/app/public/"
  - path: "/survey"
    upstream: "127.0.0.1:3004"
  - path: "/survey/"
    upstream: "127.0.0.1:3004"
  - path: "/survey-api/"
    upstream: "127.0.0.1:3201/"
    note: "prefix stripped"
  - path: "/auth/"
    upstream: "127.0.0.1:3300/auth/"
    note: "social-agent OAuth callbacks"
  - path: "/telegram/"
    upstream: "127.0.0.1:3300/telegram/"
  - path: "/social-media/"
    upstream: "127.0.0.1:3300/media/"
  - path: ":80"
    action: "301 https://$host$request_uri"
```

Next.js rewrites (`app/next.config.ts`):
```yaml
beforeFiles:
  - source: "/survey"
    destination: "${SURVEY_SERVICE_URL}/survey"
  - source: "/survey/:path*"
    destination: "${SURVEY_SERVICE_URL}/survey/:path*"
  - source: "/api/:path*"
    destination: "${BACKEND_URL}/api/:path*"
production_guard: "build throws if BACKEND_URL unset"
```

## 4. Request flows

```yaml
flows:
  public_main_page:
    - "Browser -> nginx :443 /"
    - "nginx -> web_main :3111"
    - "web_main -> /api/* -> api_main :3200 (server-side rewrite; first-party cookie)"
  public_survey_page:
    - "Browser -> nginx :443 /survey"
    - "nginx -> web_survey :3004"
    - "web_survey server -> API_BASE_URL :3201 for GET /api/survey/content, GET /api/survey/enquiries, session"
    - "Browser -> /survey-api/ -> api_survey :3201 for POST enquiry, register surveyor, admin edits"
  admin_survey_from_main_app:
    - "Browser -> /admin/survey on web_main"
    - "web_main -> /api/* -> api_main :3200"
    - "api_main and api_survey both write survey_content / survey_enquiries in shared Postgres"
  social_agent:
    - "Browser -> /api/admin/social/* on web_main"
    - "web_main -> api_main :3200 (AuthGuard + @AdminOnly)"
    - "api_main -> SOCIAL_AGENT_URL :3300 with x-admin-token: SOCIAL_AGENT_ADMIN_TOKEN"
    - "social_agent -> own SQLite + Drive/vision/LLM/LinkedIn/Meta/Telegram"
    - "public images -> nginx /social-media/ -> :3300/media/"
  auth:
    - "Browser -> /api/auth/* (Better Auth handler in api_main)"
    - "Session cookie first-party via same-origin rewrite"
    - "Admin check backend-side; UI only reflects /api/me"
```

## 5. Frontend route map

```yaml
web_main_routes:
  home: ["/"]
  service_pages: ["/web", "/mobile", "/product", "/marketing", "/ai-blockchain"]
  directory: ["/projects", "/team"]
  gated_pages: ["/financial", "/government", "/farms", "/survey"]
  fellowship_public: ["/fellowship", "/fellowship/guide", "/fellowship/status", "/fellowship/support"]
  fellowship_tokens: ["/fellowship/offer/[token]", "/fellowship/interview/[token]"]
  mentor_tokens: ["/mentor/portal/[token]", "/mentor/interview/[token]", "/mentor/review/[token]"]
  alumni_tokens: ["/alumni/update/[token]"]
  other_public: ["/gurukulam", "/verify", "/verify/[id]"]
  auth_and_user: ["/login", "/dashboard", "/profile"]
  admin: ["/admin", "/admin/leads", "/admin/fellowship", "/admin/programme", "/admin/survey"]

web_survey_routes:
  - "/survey (force-dynamic; content + session + admin flag)"
  - "/survey/admin (force-dynamic; session required, admin flag required)"
```

## 6. Admin surface

```yaml
admin_core:
  path: "/admin?section=<key>"
  sections:
    team: "team members, photos, login creation, public directory data"
    roles: "org role titles (catalog only; not used by AuthGuard)"
    teams: "org departments"
    projects: "featured projects"
    certificates: "issue/verify/revoke/reinstate/delete/restore, PDF attach"
    social: "social-agent image calendar via /api/admin/social/*"
    admins: "admin email allowlist"
    settings: "company details, survey opportunities, Live pages switches"
  redirects_to_admin_survey: [survey, surveyors, enquiries]

admin_leads:
  path: "/admin/leads"
  source: "unified leads table written by every public enquiry form"
  service_filters: [survey, fellow, financial, government, farms, gurukulam, contact]
  status_filters: [new, contacted, qualified, won, lost]
  endpoints: ["GET/PATCH/DELETE /api/leads", "GET /api/leads/export.csv"]

admin_fellowship:
  path: "/admin/fellowship"
  tabs: [dashboard, applications, reviews, interviews, mentors, fellowship/delivery, onboarding, alumni, cases]
  features:
    - "cohort + policy editor (/api/fellowship-policy)"
    - "tokenized review/interview/mentor/alumni links"
    - "delivery reviews, onboarding checklists, document store"
    - "POSH/safeguarding case register"
    - "WhatsApp connect/status/send via /api/whatsapp/*"
    - "audit trail + email templates"

admin_programme:
  path: "/admin/programme"
  tabs: [overview, colleges, sessions, questions, content, inquiries, fees, stipends, clients, placements, donations, gurukulam]
  generic_resource_endpoint: "/api/fellowship-programme/admin/:resource"
  resource_whitelist: [colleges, sessions, questions, content, inquiries, fees, stipends, clients, placements, donations, gurukulam]

admin_survey:
  path: "/admin/survey"
  tabs: [brand, hero, services, network, approach, engagement, surveyors, enquiries]
  endpoints: ["/api/survey/content", "/api/surveyors", "/api/survey/enquiries", "/api/settings", "/api/locations"]
```

## 7. Backend module map

Global prefix: `/api`. Bootstrap: `api/src/main.ts`. Composition: `api/src/app.module.ts`.
Global guards: `AuthGuard` (from AuthModule), `ThrottlerGuard` (60 req/min default).
Auth legend: `pub` = `@Public()`, `opt` = `@OptionalAuth()`, `admin` = `@AdminOnly()`, `auth` = signed-in, `thr` = extra throttle.

```yaml
modules:
  "/auth": "pub @All('*path') -> Better Auth toNodeHandler; signup disabled; email/password + Google + admin + bearer plugins"
  "/health": "pub GET"
  "/team": "pub GET; admin POST/DELETE; auth PATCH :id (owner-or-admin)"
  "/me": "opt GET -> user + own team member + org options"
  "/roles": "admin CRUD"
  "/teams": "admin CRUD"
  "/admins": "admin GET/POST/DELETE ?email= (allowlist)"
  "/settings": "admin GET/PUT"
  "/projects": "pub GET; admin POST/PATCH/DELETE"
  "/certificates": "pub GET :id, GET :id/pdf; admin list/create/revoke/reinstate/delete/restore/PDF upload+delete"
  "/upload": "auth POST multipart, <=5 MB, image bytes sniffed"
  "/contact": "pub thr POST"
  "/locations": "pub GET static state/district/city data"
  "/leads": "admin GET, export.csv, PATCH :id, DELETE :id"
  "/survey": "pub thr POST enquiries; pub GET content; admin PUT content, GET opportunities, enquiries CRUD/export"
  "/surveyors": "pub thr POST register; admin GET/export/audit/PATCH/DELETE/resend"
  "/financial": "pub thr POST enquiries"
  "/government": "pub thr POST enquiries"
  "/farms": "pub thr POST enquiries"
  "/pages": "pub GET; admin PATCH (live page switches)"
  "/fellowship-applications": "pub thr POST, POST status, GET/POST offer/:token; admin list/export/bulk/PATCH/DELETE/reminders"
  "/fellowship-policy": "pub GET; admin PUT"
  "/fellowship-mentors": "pub thr GET portal/:token; admin CRUD + rotate portal"
  "/fellowship-interviews": "pub thr candidate+panel token routes incl ICS; admin CRUD/panel/reminders"
  "/fellowship-onboarding": "admin checklist + documents (upload/download/delete)"
  "/fellowship-alumni": "pub GET public; pub thr GET/PATCH token/:token; admin CRUD/summary/follow-ups"
  "/fellowship-reviews": "pub thr GET/POST token/:token; admin CRUD/revoke"
  "/fellowship-delivery": "admin CRUD"
  "/fellowship-cases": "admin CRUD"
  "/fellowship-operations": "admin GET dashboard/cohorts"
  "/fellowship-programme": "admin dashboard/admin/:resource/stipends:generate/automation:run; pub public/faqs, public inquiries/pledges/gurukulam"
  "/fellowship-audit": "admin GET"
  "/fellowship-email-templates": "admin GET/PUT/DELETE"
  "/whatsapp": "admin settings/status/connect/logout/send"
  "/admin/social": "admin proxy to social-agent sidecar; status/accounts/media/import/upload/draft/publish/posts"
```

`app.module.ts` also has ConfigModule, ThrottlerModule, ScheduleModule, DrizzleModule.
Docs: Swagger at `/api/docs`.

## 8. Data model

Schema file: `api/src/db/drizzle/schema.ts` (41 `pgTable`s). Migrations: `api/src/db/drizzle/migrations/0000_…0022_*.sql` (23 Drizzle migrations). Manual DML: `api/db/dml/0001_…0013_*.sql` (survey content + copy + contact email).

```yaml
tables_by_domain:
  auth_better_auth: [user, session, account, verification]
  access_catalog_not_authoritative: [roles, permissions, role_permissions]
  organisation: [teams, team, admins, app_settings, projects]
  certificates: [certificates]
  survey: [surveyors, surveyor_audit_log, survey_enquiries, survey_content]
  leads: [leads]
  fellowship_pipeline:
    - fellowship_applications
    - fellowship_mentors
    - fellowship_interviews
    - fellowship_interview_panel
    - fellowship_application_reviews
    - fellowship_onboarding
    - fellowship_documents
    - fellowship_delivery_reviews
    - fellowship_alumni
    - fellowship_cases
    - fellowship_email_templates
    - fellowship_audit_log
  programme_operations:
    - fellowship_colleges
    - fellowship_outreach_sessions
    - fellowship_outreach_questions
    - fellowship_content_items
    - fellowship_inquiries
    - fellowship_fee_plans
    - fellowship_stipends
    - fellowship_client_engagements
    - fellowship_placements
    - fellowship_donations
    - gurukulam_interests
  survey_content_row: "single JSONB row id='main'"
```

Social-agent SQLite tables: `accounts`, `posts`, `post_results`, `oauth_state`, `import_jobs`, `media_plan` (unique date index).

## 9. Authorization

```yaml
admin_if_any:
  - "user.role split on commas, case-insensitive contains 'admin'"
  - "lowercased email in ADMIN_EMAILS env allowlist"
  - "email present in admins DB table"
checked_every_request: true
role_catalog_tables_used_for_authz: false
signup_enabled: false
account_creation_paths:
  - "POST /api/team creates login when admin adds member (TeamService.ensureLoginUser)"
  - "api/scripts/create-user.ts CLI"
legacy_password_support: "bcrypt fallback for $2a/$2b/$2y$; otherwise scrypt"
google_linking: "accountLinking.trustedProviders = [google]"
```

## 10. Page flags / feature gates

```yaml
mechanism: "app_settings / pages table; server-side isPageEnabled(); React cache"
unpublished_behaviour: "404 + noindex,nofollow; fails closed if API unreachable"
switches:
  - page: "/financial"
    admin_path: "/admin?section=settings -> Live pages"
  - page: "/government"
    admin_path: "/admin?section=settings -> Live pages"
  - page: "/farms"
    admin_path: "/admin?section=settings -> Live pages"
  - page: "/survey"
    admin_path: "page visibility tracked; frontend is separate service"
```

## 11. Scheduled work

```yaml
jobs:
  fellowship_daily_reminders:
    schedule: "0 6 * * * Asia/Kolkata"
    owner: api_main only
    flag: FELLOWSHIP_AUTOMATION_ENABLED=true
    manual_equivalent: "POST /api/fellowship-programme/automation/run"
  social_topic_pool:
    schedule: "0 9 * * * (default POST_SCHEDULE)"
    flag: ENABLE_SCHEDULER
    owner: social_agent
  social_media_plan:
    schedule: "30 8 * * * (default MEDIA_POST_SCHEDULE)"
    flag: ENABLE_MEDIA_SCHEDULER
    owner: social_agent
    defaults: {MEDIA_CATCHUP_DAYS: 7, MEDIA_MAX_PER_RUN: 1, MEDIA_AUTO_PUBLISH: false}
  meta_token_refresh: "0 3 * * *"
  token_expiry_check: "0 8 * * * -> Telegram warning 7 days before expiry"
  note: "If both ENABLE_SCHEDULER and ENABLE_MEDIA_SCHEDULER are false, startScheduler() returns early and token crons are NOT registered."
```

## 12. Current vs future (do not conflate)

```yaml
current_services: [web_main, api_main, api_survey, web_survey, social_agent]
features_inside_services_not_separate:
  - "/admin, /admin/leads, /admin/fellowship, /admin/programme, /admin/survey -> web_main"
  - "/financial, /government, /farms, /gurukulam, /verify -> web_main pages"
  - "fellowship, programme, certificates, leads, survey content -> api modules"
  - "WhatsApp, SMTP, Google OAuth -> integrations of api_main"
future_or_proposed:
  - id: content_engine
    status: not_built
    doc: docs/content-engine.md
    note: "design ready; extends social-agent; needs likeness consent + kill switch"
  - id: talent_marketplace
    status: not_built
    doc: docs/talent-marketplace.md
    note: "admin-only area of main app if built; not public job board"
  - id: survey_management_platform
    status: roadmap_only
    doc: docs/survey-roadmap.md
    note: "assignments, offline collection, reporting; would be separate app"
  - id: gurukulam_formal_programme
    status: partially_built
    note: "page + interest form + admin register exist; cohort/fee/stipend/placement decisions pending"
  - id: separate_domain_financial
    status: not_built
  - id: separate_domain_government
    status: not_built
  - id: separate_domain_farms
    status: not_built
  - id: separate_domain_fellowship
    status: not_built
```

## 13. Deployment facts

```yaml
domain: [kavisolutions.in, www.kavisolutions.in]
vps: "129.225.126.53, user ubuntu, aarch64, Ubuntu 26.04"
code_path_vps: /var/www/kavi-solutions
tls: "cert valid to 2027-01-26; certbot --nginx"
ci:
  workflow: .github/workflows/deploy.yml
  triggers: [push:main, workflow_dispatch]
  concurrency: {group: deploy-main, cancel_in_progress: false}
  secrets: [DEPLOY_SSH_KEY, DEPLOY_HOST_KEY, SURVEY_REPO_TOKEN]
  vars: {DEPLOY_HOST: 129.225.126.53, DEPLOY_USER: ubuntu}
  steps:
    - "configure pinned SSH known_hosts from DEPLOY_HOST_KEY"
    - "rewrite survey submodule URL with SURVEY_REPO_TOKEN"
    - "git fetch --prune origin main (no submodule recursion)"
    - "git clean -fd preserving .env* and social-agent/data"
    - "git reset --hard origin/main"
    - "checkout pinned survey SHA"
    - "deploy/deploy.sh --no-pull"
deploy_sh:
  rollback: "snapshot api/dist, app/.next, survey/.next; restore + PM2 restart on failure"
  env_pull: "Env Manager production (kavi-solutions-be/be-production, kavi-solutions/fe-production)"
  emergency_fallback: "ENV_PULL=0 uses existing files"
  builds:
    api: "npm ci || npm install; npm run build; npm run db:migrate"
    web: "BACKEND_URL=http://127.0.0.1:3200 npm run build"
    survey: "API_BASE_URL=http://127.0.0.1:3201 NEXT_PUBLIC_API_BASE_URL=/survey-api NEXT_PUBLIC_APP_URL=AUTH_PUBLIC_URL=https://kavisolutions.in npm run build"
    social: "only when social-agent/.env exists"
  health_checks:
    - "http://127.0.0.1:3200/api/health"
    - "http://127.0.0.1:3201/api/health"
    - "http://127.0.0.1:3111/"
    - "http://127.0.0.1:3004/survey"
    - "http://127.0.0.1:3300/health"
  nginx_reload: "CI does NOT reload nginx; install deploy/nginx.conf once manually"
env_manager:
  url: https://env.arkasodhara.tech
  projects:
    kavi-solutions-be: {be-local: api/.env, be-production: api/.env}
    kavi-solutions: {fe-local: app/.env.local, fe-production: app/.env.production}
  token_files: ["~/.config/kavi/env-manager-be.token", "~/.config/kavi/env-manager-fe.token"]
  emergency_flag: "ENV_MANAGER_INSECURE=1 (avoid)"
  social_agent_project: "exists but not wired into env pull"
```

## 14. Env var index

```yaml
api_env:
  core: [NODE_ENV, PORT, CORS_ALLOWED_ORIGINS, DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, FRONTEND_URL]
  oauth: [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET]
  admin: [ADMIN_EMAILS]
  mail: [SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_EMAIL]
  s3: [S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_CERTIFICATES_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_FORCE_PATH_STYLE, S3_PUBLIC_URL]
  social_bridge: [SOCIAL_AGENT_URL, SOCIAL_AGENT_ADMIN_TOKEN]
  flags: [FELLOWSHIP_AUTOMATION_ENABLED, WHATSAPP_AUTOCONNECT]
  direct_process_env: [FINANCIAL_EMAIL, SURVEYOR_RETENTION_DAYS]
web_env: [BACKEND_URL, SURVEY_SERVICE_URL]
survey_env: [API_BASE_URL, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_APP_URL, AUTH_PUBLIC_URL, ADMIN_EMAILS, PORT]
social_agent_env:
  server: [PORT, HOST, PUBLIC_BASE_URL, PUBLIC_MEDIA_BASE_URL, ENCRYPTION_KEY, DATABASE_PATH, PUBLIC_MEDIA_DIR, ADMIN_TOKEN, TZ]
  schedulers: [ENABLE_SCHEDULER, POST_SCHEDULE, TOPIC_POOL, PUBLISH_TARGETS, ENABLE_MEDIA_SCHEDULER, MEDIA_POST_SCHEDULE, MEDIA_CATCHUP_DAYS, MEDIA_MAX_PER_RUN, MEDIA_AUTO_PUBLISH, MEDIA_IMAGE_ASPECT]
  platforms: [LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_VERSION, META_APP_ID, META_APP_SECRET, META_GRAPH_VERSION, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET]
  ai: [LLM_PROVIDER, OPENAI_*, GEMINI_*, GROQ_*, CLOUDFLARE_*, VISION_PROVIDER, IMAGE_PROVIDER, WIKIMEDIA_*, PEXELS_API_KEY, POLLINATIONS_*]
  drive: [GOOGLE_SERVICE_ACCOUNT_FILE, GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_PRIVATE_KEY_BASE64, GOOGLE_API_KEY]
  brand: [BRAND_NAME, BRAND_AUDIENCE, BRAND_TONE]
```

## 15. Docker compose (local)

```yaml
project: kavi-solutions
services:
  postgres: "postgres:16-alpine, ${POSTGRES_PORT:-5437}:5432, volume kavi-postgres-data"
  minio: "${MINIO_PORT:-9004}:9000, ${MINIO_CONSOLE_PORT:-9005}:9001, volume kavi-minio-data"
  minio-init: "one-shot; creates avatars + certificates buckets; avatars anonymous download"
  api-migrate: "one-shot npm run db:migrate"
  api: "127.0.0.1:${API_PORT:-3200}:3200"
  survey-api: "127.0.0.1:${SURVEY_API_PORT:-3201}:3200; same image+env as api; automations disabled"
  survey: "${SURVEY_PORT:-3004}:3004; API_BASE_URL http://survey-api:3200"
  web: "${WEB_PORT:-3100}:3000; BACKEND_URL http://api:3200; SURVEY_SERVICE_URL http://survey:3004"
  social-agent: "profile social; ${SOCIAL_PORT:-3301}:3300; bind ./social-agent/data:/app/data"
dependencies:
  api: [minio-init:completed, api-migrate:completed, postgres:healthy]
  survey-api: [minio-init:completed, api-migrate:completed, postgres:healthy]
  survey: [survey-api:healthy]
  web: [api:healthy]
```

## 16. Invariants / gotchas

```yaml
invariants:
  - "Browser never calls backend origin directly; all browser API calls are same-origin /api/*."
  - "BACKEND_URL must be set at build AND run time; production build fails if unset."
  - "api_main and api_survey share one Postgres; never give survey a separate DB."
  - "Only api_main runs 06:00 fellowship automation and WhatsApp socket."
  - "social_agent uses its own SQLite; back up social-agent/data/app.db and data/public separately."
  - "Admin authorization is decided server-side; UI gating is cosmetic."
  - "Public form writes always create a leads row as well as domain-specific rows/emails."
  - "Page switches take effect next request; no rebuild."
known_inconsistencies:
  - "OPS-RUNBOOK mentions nginx location /avatars/ -> MinIO; not present in current deploy/nginx.conf."
  - "api/scripts/seed.ts, seed-demo.ts and roles.service.ts still insert string IDs into roles.id, now serial integer after migration 0018; likely stale."
  - "Comment in api/src/modules/survey/survey.controller.ts says survey frontend uses main API; deployed survey frontend actually uses :3201 (deploy.sh + ecosystem config are authoritative)."
  - "README rotation example uses gh repo kavisolutions/kavisolutions; verify actual GitHub repo name before rotating."
```

## 17. File index

```yaml
entry_points:
  app: [app/next.config.ts, app/app/layout.tsx, app/app/page.tsx, app/components/ServicePage.tsx]
  api: [api/src/main.ts, api/src/app.module.ts, api/src/auth/auth.config.ts, api/src/db/drizzle/schema.ts]
  survey: [survey/next.config.ts, survey/src/app/page.tsx, survey/src/app/admin/page.tsx, survey/src/lib/api.ts]
  social_agent: [social-agent/src/index.ts, social-agent/src/routes/index.ts, social-agent/src/db.ts]
operations:
  - README.md
  - OPS-RUNBOOK.md
  - deploy/nginx.conf
  - deploy/deploy.sh
  - .github/workflows/deploy.yml
  - docker-compose.yml
  - api/ecosystem.config.js
  - app/ecosystem.config.js
  - survey/ecosystem.config.js
  - social-agent/ecosystem.config.js
domain_docs:
  fellowship: [docs/fellowship-page.md, docs/fellowship-curriculum.md, docs/programme-operations.md]
  survey: [docs/survey-page.md, docs/survey-handover.md, docs/survey-roadmap.md, docs/survey-templates.md, docs/survey-locations.md]
  pages: [docs/financial-page.md, docs/government-page.md, docs/farms-page.md, docs/government-research.md]
  sidecar: [docs/social-agent.md]
  security_and_env: [docs/env-manager.md, docs/google-sign-in.md, docs/legal-registration.md]
  future: [docs/content-engine.md, docs/talent-marketplace.md]
  design: [docs/design/README.md, docs/design/kavi-design-tokens.json]
```
