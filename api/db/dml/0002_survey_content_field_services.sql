-- One-off production sync: Field Surveys & Data Collection services.
--
-- Adds the four missing service points to an existing survey_content row:
--   Political and election-related surveys
--   Product and customer feedback surveys
--   Brand awareness and market research surveys
--   Consumer behaviour surveys
--
-- Replaces only the field-surveys services array and leaves every other
-- vertical untouched. No-op when the row already has the canonical list.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0002_survey_content_field_services.sql

WITH canonical AS (
  SELECT $services$[
                "Household and public opinion surveys",
                "Political and election-related surveys",
                "Qualitative field research: in-depth interviews and focus groups",
                "Observational, ethnographic and case-study fieldwork",
                "Baseline, needs-assessment and rapid appraisal studies",
                "Field verification, audit and mystery-shopping visits",
                "Government and public service surveys",
                "Product and customer feedback surveys",
                "Brand awareness and market research surveys",
                "Consumer behaviour surveys",
                "Employee and organisational surveys",
                "Location-based and field-level data collection",
                "Institutional and community surveys",
                "Listing, census and household enumeration",
                "Longitudinal, panel and tracking studies",
                "Retail, channel and customer-experience audits",
                "Enumerator training and field-team capacity building",
                "GIS-tagged and location-verified data collection",
                "Custom research and data collection assignments"
              ]$services$::jsonb AS services
)
UPDATE survey_content
SET data = jsonb_set(
      data,
      '{verticals}',
      (
        SELECT jsonb_agg(
          CASE
            WHEN vertical->>'slug' = 'field-surveys'
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
    WHERE vertical->>'slug' = 'field-surveys'
      AND vertical->'services' IS DISTINCT FROM canonical.services
  );

SELECT id, updated_at,
       (
         SELECT jsonb_array_length(vertical->'services')
         FROM jsonb_array_elements(data->'verticals') AS vertical
         WHERE vertical->>'slug' = 'field-surveys'
       ) AS field_surveys_services
FROM survey_content
WHERE id = 'main';
