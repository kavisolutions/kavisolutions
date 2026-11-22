-- Production sync: Market Research service list.
--
-- Sets the market-research services array to the approved 8 points:
--   Market research and industry studies
--   Product feedback and product validation
--   Brand awareness and perception surveys
--   Customer satisfaction surveys
--   Competitor research
--   Consumer preference analysis
--   Product usage and adoption studies
--   Market opportunity assessments
--
-- Replaces only the market-research services array and leaves every other vertical
-- untouched. No-op when the row already has the canonical list.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0003_survey_content_market_services.sql

WITH canonical AS (
  SELECT $services$[
                "Market research and industry studies",
                "Product feedback and product validation",
                "Brand awareness and perception surveys",
                "Customer satisfaction surveys",
                "Competitor research",
                "Consumer preference analysis",
                "Product usage and adoption studies",
                "Market opportunity assessments"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'market-research'
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
    WHERE vertical->>'slug' = 'market-research'
      AND vertical->'services' IS DISTINCT FROM canonical.services
  );

SELECT id, updated_at,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'market-research'
       ) AS market_research_services
FROM survey_content
WHERE id = 'main';
