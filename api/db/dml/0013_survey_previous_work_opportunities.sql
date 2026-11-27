-- Potential clients and previous business connections on the public survey page.
--
-- Adds IFMR, GHMC, SHE Teams, DishTV, Metro Card and a generic future-organisations
-- entry to the 'Selected previous survey work' block of the published survey
-- content. Every exploratory note says 'potential' or 'exploratory': these are
-- connections under discussion, never confirmed clients or partnerships.
-- Existing past references (World Bank, Tata Sky, ITC, etc.) are preserved.
-- Idempotent: updates only when the block differs from the canonical list.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0013_survey_previous_work_opportunities.sql

WITH canonical AS (
  SELECT $previous_work$
    [
      { "name": "IFMR", "note": "Research institution · potential survey collaboration" },
      { "name": "World Bank", "note": "Socio-economic survey support" },
      { "name": "GHMC", "note": "Greater Hyderabad Municipal Corporation · potential civic survey work" },
      { "name": "SHE Teams", "note": "Women safety and civic fieldwork · potential, exploratory" },
      { "name": "DishTV", "note": "Consumer media research · potential, exploratory" },
      { "name": "Metro Card", "note": "Commuter and public transport study · potential follow-up" },
      { "name": "Tata Sky", "note": "Consumer and product feedback" },
      { "name": "Smoking study", "note": "Public health and behaviour survey" },
      { "name": "ITC", "note": "Consumer and market research" },
      { "name": "Piramal Group", "note": "Healthcare and market research" },
      { "name": "Other government bodies, research institutions, private companies and agencies", "note": "Add as the network grows · potential only" }
    ]
  $previous_work$::jsonb AS previous_work
)
UPDATE survey_content
SET data = jsonb_set(data, '{previousWork}', canonical.previous_work),
    updated_at = NOW()
FROM canonical
WHERE id = 'main'
  AND jsonb_typeof(data) = 'object'
  AND data->'previousWork' IS DISTINCT FROM canonical.previous_work;

SELECT id, jsonb_array_length(data->'previousWork') AS previous_work_count
FROM survey_content
WHERE id = 'main';
