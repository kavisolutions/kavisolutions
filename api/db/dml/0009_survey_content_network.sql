-- Production sync: Surveyor & Field Team Network section.
--
-- Adds or updates the network block used by the public survey page. Leaves
-- every other content block untouched. No-op when the block is current.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0009_survey_content_network.sql

WITH canonical AS (
  SELECT $network$
      {
        "eyebrow": "Surveyor & field team network",
        "title": "A field network we are building deliberately",
        "description": "One of the major strengths of this vertical is building a network of surveyors, field researchers, coordinators, and specialized professionals.",
        "requirements": [
          "Onboard individual surveyors and field researchers",
          "Build location-based surveyor networks",
          "Onboard teams with different skill sets",
          "Maintain surveyor profiles and expertise",
          "Identify language and regional capabilities",
          "Build a network of project coordinators and team leads",
          "Support temporary and project-based recruitment",
          "Maintain a database of available resources for future projects"
        ],
        "objective": "The long-term objective is to build a scalable field workforce that can execute projects across different cities, districts, and states."
      }
  $network$::jsonb AS network
)
UPDATE survey_content
SET data = jsonb_set(data, '{network}', canonical.network),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND jsonb_typeof(data) = 'object'
  AND data->'network' IS DISTINCT FROM canonical.network;

SELECT id, updated_at,
       jsonb_array_length(data->'network'->'requirements') AS network_requirements
FROM survey_content
WHERE id = 'main';
