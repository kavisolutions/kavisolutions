# Kavi Solutions — production deployment (2026-11-09)

## Servers
- App + DB + storage: `my-new-server-2` = 129.225.126.53 (Ubuntu 26.04, aarch64, 24 GB)
- Supabase (decommissioned kavi stack): my-new-server = 152.70.64.191 (drawer/portfolio/supabase stacks remain)
- Old site (decommissioned): 161.97.169.66

## Layout on my-new-server-2
- /var/www/kavi-solutions        Next.js 16, PM2 `kavi-solutions`, :3111
- /var/www/kavi-solutions-be     NestJS 11, PM2 `kavi-solutions-be`, :3200
- /opt/kavi/docker-compose.yml    kavi-pg (PG16, 127.0.0.1:5436), kavi-minio (127.0.0.1:9002/9003)
- /etc/nginx/sites-available/kavisolutions   kavisolutions.in + www, /avatars/ -> MinIO
- TLS: cert copied from old VPS, valid to 2027-01-26, auto-renew via certbot/day

## Data
- users 8, accounts 9 (4 credential + 5 google), team 7, teams 3, roles 5, admins 2, projects 1
- avatars 3 objects in MinIO bucket `avatars` (public read)
- Legacy Supabase bcrypt password hashes preserved; Better Auth verify falls back to bcrypt for `$2a/$2b/$2y$` prefixes

## Backups
- my-new-server:/opt/backups/kavi-supabase-storage-2026-11-09.tar.gz (477 MB, storage + db volumes)
- 161.97.169.66:/opt/kavi-solutions-old-site-2026-11-09.tar.gz (865 KB, old Next app code)
- Local: /tmp/opencode/kavi-migration/supabase-full-backup.sql (30 tables), supabase-export.json, avatars/

## Redeploy
Backend:
  rsync -az --exclude node_modules --exclude dist --exclude .env ./ my-new-server-2:/var/www/kavi-solutions-be/
  ssh my-new-server-2 'cd /var/www/kavi-solutions-be && npm ci && npm run db:migrate && npm run build && pm2 restart kavi-solutions-be --update-env'
Frontend:
  rsync -az --exclude node_modules --exclude .next --exclude .env* ./ my-new-server-2:/var/www/kavi-solutions/
  ssh my-new-server-2 'cd /var/www/kavi-solutions && npm ci && BACKEND_URL=http://127.0.0.1:3200 npm run build && pm2 restart kavi-solutions --update-env'

## Known follow-ups
- Google OAuth creds are empty in /var/www/kavi-solutions-be/.env → Google button returns error. Add GOOGLE_CLIENT_ID/SECRET + redirect https://kavisolutions.in/api/auth/callback/google
- Admin logins with email/password: existing users keep legacy passwords (bcrypt); others must use password reset
- SMTP_PASS set; contact form verified 201
- GitHub Actions deploy still targets 161.97.169.66 — must be repointed or disabled

## Update (2026-11-09, later)

- Repository is now a single monorepo: Next.js at the root, NestJS in `api/`
- Server checkout: `/var/www/kavi-solutions` (git clone of kavisolutions/kavisolutions)
- CI deploys both apps via `deploy/deploy.sh` to 129.225.126.53
- Runtime env files on the server: `/var/www/kavi-solutions/.env.production`,
  `/var/www/kavi-solutions/api/.env` (preserved across deploys)
