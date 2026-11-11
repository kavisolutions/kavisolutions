# Social agent (image calendar)

The social-agent sidecar turns a folder of images into a scheduled posting
calendar. Each image has a date; on that date the service looks at the photo,
writes platform-specific captions, and sends the draft for Telegram approval
(or publishes immediately if auto-publish is enabled).

It lives in [`social-agent/`](../social-agent) and is managed from
**Admin → Social agent**.

## Flow

```
Google Drive folder ──import──> social-agent SQLite (media_plan: image + date)
                                         │
                              cron (08:30 Asia/Kolkata)
                                         │
                              vision model describes the image
                                         │
                         LLM writes LinkedIn / Facebook / Instagram copy
                                         │
                       Telegram draft with Approve / Reject / Regenerate
                                         │
                              publish to connected platforms
```

The import is a one-time download. Drive is not contacted by the daily job, so
a quota error or a moved folder cannot break publishing.

## 1. Environment

`social-agent/.env` — start from `social-agent/.env.example`:

```bash
PORT=3300
HOST=127.0.0.1
PUBLIC_BASE_URL=https://kavisolutions.in
PUBLIC_MEDIA_BASE_URL=https://kavisolutions.in/social-media
ENCRYPTION_KEY=...          # openssl rand -hex 32
ADMIN_TOKEN=...             # openssl rand -hex 24
DATABASE_PATH=./data/app.db
PUBLIC_MEDIA_DIR=./data/public
TZ=Asia/Kolkata

ENABLE_MEDIA_SCHEDULER=true
MEDIA_POST_SCHEDULE=30 8 * * *
MEDIA_AUTO_PUBLISH=false
```

`api/.env` gets the matching bridge values:

```bash
SOCIAL_AGENT_URL=http://127.0.0.1:3300
SOCIAL_AGENT_ADMIN_TOKEN=<same as social-agent ADMIN_TOKEN>
```

The browser never receives the token; the NestJS API proxies every admin call.

## 2. Google Drive access

Recommended: a service account.

1. In Google Cloud Console create/select a project.
2. Enable **Google Drive API**.
3. Create a **service account**, then create a JSON key.
4. Share the Drive folder with the service account email (`...iam.gserviceaccount.com`)
   as **Viewer**.
5. Point the sidecar at the key — one of:

```bash
GOOGLE_SERVICE_ACCOUNT_FILE=/etc/kavi/google-drive.json
# or
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# or
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_BASE64=...   # base64 of the PEM key (newlines survive .env)
```

For a folder shared as **Anyone with the link**, a plain API key also works:

```bash
GOOGLE_API_KEY=...
```

Supported folder URL shapes:

```
https://drive.google.com/drive/folders/<id>
https://drive.google.com/drive/u/0/folders/<id>
<bare-folder-id>
```

Subfolders are walked up to four levels; only `image/*` files are imported.

## 3. Dates

One image per day. Dates come from, in order:

1. The filename: `2026-01-15.jpg`, `2026_01_15.jpg`, `15-01-2026.jpg`.
2. The **Start date** in the import form (or `--start`), then one image per day
   for files with no date. Days that already have an image are skipped.

Re-importing the same folder updates the existing rows (matched by Drive file
ID) and keeps the date an editor moved, so a re-sync is safe.

## 4. Caption generation

`VISION_PROVIDER` auto-detects `GEMINI_API_KEY`, `OPENAI_API_KEY` or
`CLOUDFLARE_API_TOKEN`. The vision model writes a short description, cached in
`media_plan.description`; the text model then writes one caption per platform
using the existing brand voice (`BRAND_NAME`, `BRAND_AUDIENCE`, `BRAND_TONE`).

If vision is unavailable, the optional **topic hint** (per image) or the
filename is used as the topic instead. Captions still work; they just have less
to go on.

## 5. Scheduler

`ENABLE_MEDIA_SCHEDULER=true` registers a daily cron at `MEDIA_POST_SCHEDULE`.

- Picks the earliest `planned` row with `scheduled_date <= today`.
- Older rows beyond `MEDIA_CATCHUP_DAYS` are marked `missed` (default 7 days).
- Creates the draft and sends the Telegram approval message with the image.
- `MEDIA_AUTO_PUBLISH=true` publishes right after drafting, without waiting.
- `MEDIA_MAX_PER_RUN` controls how many missed days are caught up in one run.

`ENABLE_SCHEDULER` (the old topic-pool job) is independent and can stay off.

## 6. Admin panel

**Admin → Social agent** provides:

- **Import from Google Drive** — folder link, start date, topic hint. Progress
  is polled; errors are listed per file.
- **Add images manually** — multi-file upload, laid out from the start date.
- **Calendar** — images for a month with thumbnail, status, editable date and
  topic hint.
- **Draft now** — describes the image, writes captions, creates the post and
  sends it to Telegram. Useful for testing a date early.
- **Skip / Restore / Delete**.
- **Run due** — invokes the scheduler immediately.
- **Recent drafts** — publish a draft directly.

## 7. Deployment

`deploy/deploy.sh` builds and reloads both apps and, when `social-agent/` is
present, also builds it and starts PM2 app `kavi-social-agent` on `:3300`.

Nginx exposes the images publicly at `/social-media/` (see
`deploy/nginx.conf`), because Instagram publishing requires an HTTPS image URL.
The rest of the sidecar stays on `127.0.0.1`.

Telegram approval needs a public webhook for the buttons to work:

```bash
SECRET=$(openssl rand -hex 16)
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://kavisolutions.in/social-agent/telegram/webhook/$SECRET&secret_token=$SECRET"
```

Add a matching nginx location if you use the Telegram webhook through the main
domain:

```nginx
location /social-agent/ {
    proxy_pass http://127.0.0.1:3300/;
}
```

(Otherwise approve from the admin panel or set up a separate subdomain.)

## 8. API

All sidecar admin endpoints require `x-admin-token`. The Kavi API wraps them
under `/api/admin/social/*` with the normal admin session guard.

| Sidecar | Kavi proxy | Purpose |
|---|---|---|
| `GET /admin/status` | `GET /api/admin/social/status` | health, counts, scheduler config |
| `GET /admin/media` | `GET /api/admin/social/media` | list by month/status |
| `POST /admin/media/import/drive` | `POST /api/admin/social/media/import/drive` | start import job |
| `GET /admin/media/import/:id` | `GET /api/admin/social/media/import/:id` | job progress |
| `POST /admin/media/upload` | `POST /api/admin/social/media/upload` | single image upload |
| `PATCH /admin/media/:id` | `PATCH /api/admin/social/media/:id` | date, hint, skip |
| `DELETE /admin/media/:id` | `DELETE /api/admin/social/media/:id` | remove image |
| `POST /admin/media/:id/draft` | `POST /api/admin/social/media/:id/draft` | draft now |
| `POST /admin/media/run-due` | `POST /api/admin/social/media/run-due` | run scheduler now |
| `GET /admin/posts` | `GET /api/admin/social/posts` | recent drafts |
| `POST /admin/publish/:id` | `POST /api/admin/social/publish/:id` | publish a draft |

## 9. Troubleshooting

| Symptom | Check |
|---|---|
| Drive import 403 | Folder shared with the service account? Drive API enabled? |
| Import job fails immediately | `GOOGLE_SERVICE_ACCOUNT_FILE` readable by the PM2 user |
| No captions from the photo | `VISION_PROVIDER` is `none` or the provider key is missing |
| Instagram publish fails | Image aspect outside 4:5–1.91:1; set `MEDIA_IMAGE_ASPECT=portrait` |
| Admin panel says unreachable | `SOCIAL_AGENT_URL`, PM2 `kavi-social-agent`, `curl :3300/health` |
| nginx 413 on upload | `client_max_body_size 25m` in the server block |
| Telegram buttons do nothing | Webhook URL/secret set and publicly reachable |

## 10. Security

- Drive credentials and platform tokens stay on the server; tokens are
  encrypted at rest with `ENCRYPTION_KEY`.
- The sidecar binds to `127.0.0.1`; only `/media/` is public.
- The admin panel never sees `SOCIAL_AGENT_ADMIN_TOKEN`.
- Back up both `social-agent/data/app.db` and `social-agent/data/public/` —
  deleting the media folder breaks drafts that reference those files.
