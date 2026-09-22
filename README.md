# Kavi Solutions

A premium one-page agency website for **Kavi Solutions**, built with **Next.js 16**, **Tailwind CSS 4** and **Framer Motion**. Dark, animated and production-ready.

## Sections

1. **Web** — web development services
2. **Mobile** — native & cross-platform apps
3. **Product** — digital product design & MVP sprints
4. **Digital Marketing** — SEO, paid ads & growth
5. **Fellowship** — the Kavi Fellows 12-week program
6. **Who we are (Team)** — the people behind the studio

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Auto-deploy on merge to `main`

Every push (including merged PRs) to `main` triggers
`.github/workflows/deploy.yml`, which SSHes into the VPS and runs
`deploy/deploy.sh` there. The workflow can also be run manually from the
Actions tab (`workflow_dispatch`).

On the VPS the deploy does:

1. `git fetch` + `git reset --hard origin/main` (GitHub `main` is the source of truth)
2. `npm ci` (falls back to `npm install`)
3. `npm run build`
4. `pm2 startOrReload ecosystem.config.js` + `pm2 save`
5. a health check against `http://127.0.0.1:3111/`

Ignored files (`.env.local`, `node_modules`, `.next`) are preserved.

**One-time setup (already done):** a dedicated deploy keypair is authorized on
the VPS and its private key is stored as the `DEPLOY_SSH_KEY` GitHub Actions
secret. To rotate it:

```bash
ssh-keygen -t ed25519 -N "" -C "gha-kavi-solutions-deploy" -f ~/.ssh/gha_kavi
ssh root@161.97.169.66 "echo '$(cat ~/.ssh/gha_kavi.pub)' >> ~/.ssh/authorized_keys"
gh secret set DEPLOY_SSH_KEY -R kavisolutions/kavisolutions < ~/.ssh/gha_kavi
```

## Deploy to VPS (Nginx + PM2)

Files in `deploy/`:

- `deploy/nginx.conf` — Nginx reverse proxy config (HTTP→HTTPS redirect, SSL, gzip, static caching)
- `deploy/deploy.sh` — one-shot deploy script
- `ecosystem.config.js` — PM2 process definition (serves on port 3000)

### Steps

1. **On your VPS**, clone/copy this repo (e.g. to `/home/deploy/kavi-solutions`).
2. Install Node 18+ and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
   sudo npm i -g pm2
   ```
3. Deploy:
   ```bash
   ./deploy/deploy.sh
   pm2 status
   ```
4. Configure Nginx:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/kavi-solutions
   sudo ln -s /etc/nginx/sites-available/kavi-solutions /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. Enable HTTPS (once DNS points at the VPS):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d kavisolutions.in -d www.kavisolutions.in
   ```

Update the `server_name` and cert paths in `deploy/nginx.conf` to match your actual domain.
