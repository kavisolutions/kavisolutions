-- Add the admin-managed support email setting.
--
-- Public pages read this through GET /api/settings/public and every public
-- enquiry form uses it as the recipient. Safe to re-run: an existing,
-- non-empty administrator value is never overwritten.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0014_support_email_setting.sql

INSERT INTO app_settings ("key", "value", "updated_at")
VALUES ('support_email', 'support@kavisolutions.in', NOW())
ON CONFLICT ("key") DO UPDATE
SET "updated_at" = NOW()
WHERE app_settings."value" IS NULL OR btrim(app_settings."value") = '';

SELECT "key", "value" FROM app_settings WHERE "key" = 'support_email';
