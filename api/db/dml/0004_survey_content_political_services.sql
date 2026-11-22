-- Production sync: Political & Social research service list.
--
-- Sets the political-social services array to the approved 7 points:
--   Public opinion surveys
--   Constituency-level research
--   Voter sentiment research
--   Community and household surveys
--   Social impact assessments
--   Public policy feedback collection
--   Government scheme awareness and beneficiary feedback surveys
--
-- Replaces only the political-social services array and leaves every other vertical
-- untouched. No-op when the row already has the canonical list.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0004_survey_content_political_services.sql

WITH canonical AS (
  SELECT $services$[
                "Public opinion surveys",
                "Constituency-level research",
                "Voter sentiment research",
                "Community and household surveys",
                "Social impact assessments",
                "Public policy feedback collection",
                "Government scheme awareness and beneficiary feedback surveys"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'political-social'
              THEN jsonb_set(vertical, '{services}', canonical.services)
            ELSE vertical
          END
          ORDER BY ordinality
        )
        FROM jsonb_array_elements(data->'verticals')
          WITH ORDINALITY AS item(vertical, ordinality)
      )
    ),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND jsonb_typeof(data->'verticals') = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(data->'verticals') AS vertical
    WHERE vertical->>'slug' = 'political-social'
      AND vertical->'services' IS DISTINCT FROM canonical.services
  );

SELECT id, updated_at,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'political-social'
       ) AS political_social_services
FROM survey_content
WHERE id = 'main';
