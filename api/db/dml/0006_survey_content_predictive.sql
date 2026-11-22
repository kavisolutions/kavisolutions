-- Production sync: Prediction-Based Research & Presentations card.
--
-- Sets the approved heading, description and service list:
--   Data-driven forecasting
--   Trend and pattern identification
--   Predictive analysis where sufficient data is available
--   Scenario-based analysis
--   Research-based presentations
--   Business and market insight presentations
--   Decision-support reports
--
-- The description keeps the required distinction between data-supported
-- findings, estimates, predictions, assumptions and limitations.
--
-- Replaces only the predictive-research card fields and leaves every other
-- vertical untouched. No-op when the card is already current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0006_survey_content_predictive.sql

WITH canonical AS (
  SELECT to_jsonb($tag$Predictive Research$tag$::text) AS tag,
         to_jsonb($title$Prediction-Based Research & Presentations$title$::text) AS title,
         to_jsonb($summary$Create analytical presentations based on collected research data and relevant historical information. Clearly distinguish data-supported findings, estimates, and predictions, including assumptions and limitations.$summary$::text) AS summary,
         $services$[
                "Data-driven forecasting",
                "Trend and pattern identification",
                "Predictive analysis where sufficient data is available",
                "Scenario-based analysis",
                "Research-based presentations",
                "Business and market insight presentations",
                "Decision-support reports"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'predictive-research'
              THEN jsonb_set(
                jsonb_set(
                  jsonb_set(
                    jsonb_set(vertical, '{tag}', canonical.tag),
                    '{title}',
                    canonical.title
                  ),
                  '{summary}',
                  canonical.summary
                ),
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
    WHERE vertical->>'slug' = 'predictive-research'
      AND (
        vertical->'tag' IS DISTINCT FROM canonical.tag
        OR vertical->'title' IS DISTINCT FROM canonical.title
        OR vertical->'summary' IS DISTINCT FROM canonical.summary
        OR vertical->'services' IS DISTINCT FROM canonical.services
      )
  );

SELECT id, updated_at,
       (
         SELECT vertical->>'title'
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'predictive-research'
       ) AS predictive_title,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'predictive-research'
       ) AS predictive_services
FROM survey_content
WHERE id = 'main';
