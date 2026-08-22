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
