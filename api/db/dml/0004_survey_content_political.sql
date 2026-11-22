-- Production sync: Political & Social research card.
--
-- Sets the approved description and service list:
--   Public opinion surveys
--   Constituency-level research
--   Voter sentiment research
--   Community and household surveys
--   Social impact assessments
--   Public policy feedback collection
--   Government scheme awareness and beneficiary feedback surveys
--
-- Replaces only the political-social card fields and leaves every other vertical
-- untouched. No-op when the card is already current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0004_survey_content_political.sql

WITH canonical AS (
  SELECT to_jsonb($summary$Undertake research and survey assignments related to public opinion, social development, and community requirements. All political and personal data collection must follow applicable privacy, election, and data protection requirements, with appropriate consent and safeguards.$summary$::text) AS summary,
         $services$[
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
              THEN jsonb_set(
                jsonb_set(vertical, '{summary}', canonical.summary),
                '{services}',
                canonical.services
              )
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
      AND (
        vertical->'summary' IS DISTINCT FROM canonical.summary
        OR vertical->'services' IS DISTINCT FROM canonical.services
      )
  );

SELECT id, updated_at,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'political-social'
       ) AS political_social_services
FROM survey_content
WHERE id = 'main';
