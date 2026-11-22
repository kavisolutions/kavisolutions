-- Production sync: Academic & Institutional Research Support card.
--
-- Sets the approved heading, description and service list:
--   Primary and secondary data collection
--   Questionnaire and survey design
--   Research methodology support
--   Field research coordination
--   Data processing and statistical analysis
--   Research report preparation
--   Research paper data support
--   Charts, tables, and presentation preparation
--   Research findings documentation
--
-- The description keeps the required research-integrity statement: no
-- fabricated data, results or findings.
--
-- Replaces only the academic-research card fields and leaves every other
-- vertical untouched. No-op when the card is already current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0007_survey_content_academic.sql

WITH canonical AS (
  SELECT to_jsonb($tag$Academic Support$tag$::text) AS tag,
         to_jsonb($title$Academic & Institutional Research Support$title$::text) AS title,
         to_jsonb($summary$Provide research support to students, scholars, educational institutions, and research organizations. Academic support should preserve research integrity, with no fabricated data, results, or findings.$summary$::text) AS summary,
         $services$[
                "Primary and secondary data collection",
                "Questionnaire and survey design",
                "Research methodology support",
                "Field research coordination",
                "Data processing and statistical analysis",
                "Research report preparation",
                "Research paper data support",
                "Charts, tables, and presentation preparation",
                "Research findings documentation"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'academic-research'
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
    WHERE vertical->>'slug' = 'academic-research'
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
         WHERE vertical->>'slug' = 'academic-research'
       ) AS academic_title,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'academic-research'
       ) AS academic_services
FROM survey_content
WHERE id = 'main';
