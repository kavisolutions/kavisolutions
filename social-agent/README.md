# social-agent

Daily post drafting + publishing to LinkedIn, Facebook Page, and Instagram, with Telegram approval before anything goes live.

Flow: cron -> pick topic -> LLM writes caption -> optional AI image -> Telegram draft with Approve/Reject -> publish to chosen platforms -> results logged + reported back.

## 1. Setup

```bash
cp .env.example .env
openssl rand -hex 32        # paste into ENCRYPTION_KEY
openssl rand -hex 24        # paste into ADMIN_TOKEN
npm install
npm run dev
```

## 2. LinkedIn app

1. https://www.linkedin.com/developers/apps -> Create app (needs a LinkedIn Page; use a personal "company" page if needed).
2. Products tab -> add **Share on LinkedIn** + **Sign In with LinkedIn using OpenID Connect**.
3. Auth tab -> Allowed redirect URL:
   `https://YOUR_DOMAIN/auth/linkedin/callback`
4. Copy Client ID + Client Secret into `.env`.
5. Visit `https://YOUR_DOMAIN/auth/linkedin` and approve.

Notes:
- `POST /rest/posts` needs header `LinkedIn-Version` (config: `LINKEDIN_VERSION=202501`, bump as needed).
- Token lasts 60 days. Revisit `/auth/linkedin` to refresh. App warns via Telegram 7 days before expiry.
- Profile **editing** is not available via API; do that manually on linkedin.com.

## 3. Meta app (Facebook Page + Instagram)

1. https://developers.facebook.com/apps -> Create app -> type **Business**.
2. Add products: **Facebook Login for Business** and **Instagram Graph API**.
3. Facebook Login settings -> Valid OAuth Redirect URI:
   `https://YOUR_DOMAIN/auth/meta/callback`
4. Instagram account must be **Business or Creator** and linked to the Facebook Page.
5. Copy App ID + App Secret into `.env`.
6. For production (posting on behalf of non-test users), submit the app for **App Review** with `pages_manage_posts`, `instagram_content_publish`, `pages_show_list`, `instagram_basic`. While in Development mode only app admins/testers can be used; fine for personal use.
7. Visit `https://YOUR_DOMAIN/auth/meta` and approve. This connects both Facebook and Instagram if the IG account is linked to the page.

Notes:
- Instagram publishing requires an HTTPS image URL. `public_media` + `PUBLIC_BASE_URL` provide that. Domain must be reachable by Meta.
- Long-lived tokens refresh automatically via the daily 03:00 job while still valid.

## 4. Telegram approval

1. Message @BotFather -> `/newbot` -> copy token into `TELEGRAM_BOT_TOKEN`.
2. Message @userinfobot -> get your numeric chat id into `TELEGRAM_CHAT_ID`.
3. Set webhook (once):
   ```bash
   SECRET=$(openssl rand -hex 16)
   curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook?url=https://YOUR_DOMAIN/telegram/webhook/$SECRET&secret_token=$SECRET"
   ```
   Add `TELEGRAM_WEBHOOK_SECRET=$SECRET` to `.env` and restart.
4. Approve/Reject buttons in-chat now work. Approving publishes immediately.

## 5. Scheduler

Set in `.env`:

```
ENABLE_SCHEDULER=true
POST_SCHEDULE=0 9 * * *        # 9am daily
TZ=Asia/Kolkata
TOPIC_POOL=idea one,idea two,idea three
PUBLISH_TARGETS=linkedin,facebook,instagram
```

Each run creates a draft and sends to Telegram. Nothing publishes without your Approve.

## 6. API (admin token required, header `x-admin-token`)

| Method | Path | Body | Effect |
|---|---|---|---|
| GET  | /admin/accounts | - | connected accounts + expiry |
| POST | /admin/draft | `{"topic":"...","targets":"linkedin,instagram","image":true}` | create draft + send to Telegram |
| POST | /admin/publish/:id | - | publish now |
| GET  | /admin/posts | - | recent posts + results |
| GET  | /health | - | liveness |

```bash
curl -X POST https://YOUR_DOMAIN/admin/draft \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"topic":"Why boring tech wins","targets":"linkedin,facebook,instagram"}'
```

## 7. Deploy on VPS

```bash
git clone <repo> social-agent && cd social-agent
cp .env.example .env   # fill in
docker compose up -d --build
```

Put Caddy or nginx in front for HTTPS (Meta requires it, LinkedIn too):

```
social.example.com {
  reverse_proxy localhost:3000
}
```

## 8. Caveats

- LinkedIn: no profile-update API. Only posting.
- Instagram: Business/Creator + linked FB Page mandatory. Images must be public HTTPS.
- Facebook: posts go to a Page, not personal profile (personal posting is not allowed by Graph API).
- **Account risk**: avoid all-autopilot, high-volume posting. Approve each post via Telegram.
- Never commit `.env`. Tokens are encrypted at rest with `ENCRYPTION_KEY`.
