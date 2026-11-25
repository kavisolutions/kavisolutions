-- Production sync: public contact block for the Survey & Research page.
--
-- External contact details are public. Internal leads stay in admin-only
-- Settings -> Survey Opportunities and are never published on the page.
-- Leaves every other content block untouched. No-op when the block is current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0011_survey_content_public_contact.sql

WITH canonical AS (
  SELECT $brand$
      {
        "name": "Kavi Survey & Research Solutions",
        "location": "Bengaluru",
        "vertical": "A Kavi Solutions business vertical",
        "contactName": "Ashok Sandhyala",
        "contactEmail": "kavi@kavisolutions.in"
      }
  $brand$::jsonb AS brand
)
UPDATE survey_content
SET data = jsonb_set(data, '{brand}', canonical.brand),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND jsonb_typeof(data) = 'object'
  AND data->'brand' IS DISTINCT FROM canonical.brand;

SELECT id, updated_at,
       data->'brand'->>'contactEmail' AS contact_email,
       data->'brand'->>'contactName' AS contact_name,
       data->'brand'->>'location' AS location
FROM survey_content
WHERE id = 'main';
