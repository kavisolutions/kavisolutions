-- Production sync: potential clients / business opportunities.
--
-- Adds the admin-updatable opportunities block to the published survey page.
-- Entries are indicative and stage-labelled; they are never confirmed clients.
-- Leaves every other content block untouched. No-op when the block is current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0010_survey_content_opportunities.sql

WITH canonical AS (
  SELECT $opportunities$
      [
        {
          "title": "District-level household and beneficiary surveys",
          "note": "Indicative opportunity. Scope, districts and compliance requirements to be confirmed before any public claim.",
          "stage": "Exploring"
        },
        {
          "title": "Government scheme monitoring and evaluation",
          "note": "Potential field and analysis engagement. No agreement in place; publish only after scope is agreed.",
          "stage": "Under discussion"
        },
        {
          "title": "Academic and institutional fieldwork partnerships",
          "note": "Possible collaborations with institutions. Confirm ethics approval and data-use terms first.",
          "stage": "Enquiring"
        }
      ]
  $opportunities$::jsonb AS opportunities
)
UPDATE survey_content
SET data = jsonb_set(data, '{opportunities}', canonical.opportunities),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND jsonb_typeof(data) = 'object'
  AND data->'opportunities' IS DISTINCT FROM canonical.opportunities;

SELECT id, updated_at,
       jsonb_array_length(data->'opportunities') AS opportunity_count
FROM survey_content
WHERE id = 'main';
