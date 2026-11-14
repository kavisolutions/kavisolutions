# Google sign-in

Google OAuth is handled by Better Auth in the NestJS API. The Next.js login page
only starts the flow; the API owns the callback, creates or links the user and
sets the first-party session cookie through the same-origin `/api` proxy.

## Flow

```text
/login
  → Continue with Google
  → POST /api/auth/sign-in/social  (proxied to NestJS)
  → accounts.google.com
  → GET /api/auth/callback/google
  → session cookie
  → /login?next=…
  → /admin (admin) or /dashboard (regular user)
```

## Required env vars

Set these in Env Manager, not in the repository:

| Key | Project / env |
| --- | --- |
| `GOOGLE_CLIENT_ID` | `kavi-solutions-be/be-local` and `be-production` |
| `GOOGLE_CLIENT_SECRET` | `kavi-solutions-be/be-local` and `be-production` |

`BETTER_AUTH_URL` must be the public origin that Google redirects back to:

```text
local Docker:  http://localhost:3100
host dev:      http://localhost:3200   (API origin when using the proxy)
production:    https://kavisolutions.in
```

Pull the values before starting:

```bash
./scripts/env-manager.sh pull local
# or, on the server:
./scripts/env-manager.sh pull production
```

If both Google keys are empty, Better Auth does not register the provider and
the login page returns `Provider not found`.

## Google Cloud Console

Create an OAuth 2.0 Client ID of type **Web application**.

Authorized JavaScript origins:

```text
https://kavisolutions.in
http://localhost:3100
http://localhost:3000
http://localhost:3200
```

Authorized redirect URIs:

```text
https://kavisolutions.in/api/auth/callback/google
http://localhost:3100/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3200/api/auth/callback/google
```

Only the exact origin + path combination works. A trailing slash or a different
port is a different redirect URI.

## Account behaviour

- A Google account with a verified email matching an existing admin-created user
  is linked to that user (Better Auth trusted provider + verified email).
- A new Google account creates a regular user with no admin role.
- Admin access is still decided by `user.role = "admin"`, `ADMIN_EMAILS` or the
  `admins` table — Google sign-in does not grant admin access by itself.
- New Google users without a `team` row can open `/dashboard` but will see
  "No team profile" until an admin links them.

## Local test

```bash
docker compose up -d --build
```

Open <http://localhost:3100/login>, click **Continue with Google**, and confirm
you reach the Google account screen. After choosing an account, the callback
returns to the site and the login page redirects to `/admin` or `/dashboard`.

If Google shows **Error 400: redirect_uri_mismatch**, the Google Cloud OAuth
client does not have the local callback. Add the exact URI you are using:

```text
http://localhost:3100/api/auth/callback/google
```

The production URI (`https://kavisolutions.in/api/auth/callback/google`) is not
enough for local development. After adding it, retry the button.

If the button says `Provider not found`:

```bash
docker compose exec api sh -c 'printf "%s %s\n" "${GOOGLE_CLIENT_ID:+set}" "${GOOGLE_CLIENT_SECRET:+set}"'
```

Both should print `set`. If not, re-pull local env and recreate the API:

```bash
./scripts/env-manager.sh pull local
docker compose up -d --force-recreate api
```

## Production check

```bash
curl -s -X POST https://kavisolutions.in/api/auth/sign-in/social \
  -H 'Content-Type: application/json' \
  -d '{"provider":"google","callbackURL":"https://kavisolutions.in/login"}'
```

A working setup returns `{"url":"https://accounts.google.com/...","redirect":true}`.
`{"message":"Provider not found"}` means the production env is missing the
Google keys.

## Security notes

- Keep the client secret in Env Manager only; never commit it.
- Use `prompt: "select_account"` so a shared browser does not silently reuse the
  last Google account.
- Do not grant admin access based on an email domain or Google profile alone.
- Rotate the OAuth client secret in Google Cloud and Env Manager together if it
  is exposed.
