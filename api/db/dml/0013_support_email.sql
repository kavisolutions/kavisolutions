-- Unify the public/recipient contact address on support@kavisolutions.in.
--
-- Existing databases keep older values in app_settings (contact_email and
-- financial_email) and in the Survey page's brand block. This sync updates
-- only those recipient addresses, leaves admin accounts and login identities
-- alone, and is safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0013_support_email.sql

UPDATE app_settings
SET value = 'support@kavisolutions.in', updated_at = NOW()
WHERE key IN ('contact_email', 'financial_email')
  AND value IS DISTINCT FROM 'support@kavisolutions.in';

UPDATE survey_content
SET data = jsonb_set(data, '{brand,contactEmail}', '"support@kavisolutions.in"'),
    updated_at = NOW()
WHERE id = 'main'
  AND jsonb_typeof(data) = 'object'
  AND COALESCE(data->'brand'->>'contactEmail', '') <> 'support@kavisolutions.in';

SELECT key, value FROM app_settings
WHERE key IN ('contact_email', 'financial_email')
ORDER BY key;

SELECT id, data->'brand'->>'contactEmail' AS contact_email
FROM survey_content
WHERE id = 'main';
