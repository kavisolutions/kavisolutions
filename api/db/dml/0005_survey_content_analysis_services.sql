-- Production sync: Research Data Analysis & Reporting service list.
--
-- Sets the analysis-reporting services array to the approved 9 points:
--   Data cleaning and validation
--   Data categorization and structuring
--   Statistical analysis
--   Survey result analysis
--   Trend identification
--   Comparative analysis
--   Research report preparation
--   Charts, dashboards, and visualizations
--   Executive summaries and recommendations
--
-- Replaces only the analysis-reporting services array and leaves every other vertical
-- untouched. No-op when the row already has the canonical list.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0005_survey_content_analysis_services.sql

WITH canonical AS (
  SELECT $services$[
                "Data cleaning and validation",
                "Data categorization and structuring",
                "Statistical analysis",
                "Survey result analysis",
                "Trend identification",
                "Comparative analysis",
                "Research report preparation",
                "Charts, dashboards, and visualizations",
                "Executive summaries and recommendations"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'analysis-reporting'
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
    WHERE vertical->>'slug' = 'analysis-reporting'
      AND vertical->'services' IS DISTINCT FROM canonical.services
  );

SELECT id, updated_at,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'analysis-reporting'
       ) AS analysis_reporting_services
FROM survey_content
WHERE id = 'main';
