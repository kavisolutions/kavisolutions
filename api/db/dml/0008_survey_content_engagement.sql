-- Production sync: Project Execution Models.
--
-- Sets the approved five engagement models:
--   On-Call Support
--   Direct Project Execution
--   Data Collection Only
--   Analysis & Reporting
--   End-to-End Research
--
-- Replaces only the engagement array and leaves every other content block
-- untouched. No-op when the array is already current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0008_survey_content_engagement.sql

WITH canonical AS (
  SELECT $engagement$[
    {
      "title": "On-Call Support",
      "bestFor": "Clients with an in-house research team who need execution bandwidth.",
      "summary": "Provide surveyors, field researchers, and research support whenever clients require them."
    },
    {
      "title": "Direct Project Execution",
      "bestFor": "Organisations that want a single accountable partner end to end.",
      "summary": "Take complete ownership of survey projects, from planning to field execution and final reporting."
    },
    {
      "title": "Data Collection Only",
      "bestFor": "Teams with analysts but no field presence.",
      "summary": "Execute fieldwork and deliver validated raw data to clients."
    },
    {
      "title": "Analysis & Reporting",
      "bestFor": "Clients who already have data but need it turned into insight.",
      "summary": "Accept existing datasets and prepare analytical reports, visualizations, and presentations."
    },
    {
      "title": "End-to-End Research",
      "bestFor": "Institutions running a study from scratch with no internal capacity.",
      "summary": "Manage the complete research lifecycle, from questionnaire design and data collection to analysis, reporting, and presentation."
    }
  ]$engagement$::jsonb AS engagement
)
UPDATE survey_content
SET data = jsonb_set(data, '{engagement}', canonical.engagement),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND data->'engagement' IS DISTINCT FROM canonical.engagement;

SELECT id, updated_at,
       jsonb_array_length(data->'engagement') AS engagement_models
FROM survey_content
WHERE id = 'main';
