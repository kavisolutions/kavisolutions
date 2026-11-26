-- Potential clients and previous business connections for the survey vertical.
--
-- Admin-editable list shown in Admin -> Settings -> Survey Opportunities and
-- returned by GET /api/survey/opportunities. Every entry is exploratory only:
-- nothing here claims a signed client, partnership or confirmed engagement.
-- Idempotent: inserts when the setting is missing or empty; never overwrites
-- a list that an administrator has already edited.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0012_survey_opportunities.sql

INSERT INTO "app_settings" ("key", "value", "updated_at")
VALUES (
  'survey_opportunities',
  E'IFMR | Research institution · potential, exploratory\nGHMC | Greater Hyderabad Municipal Corporation · civic surveys, potential only\nSHE Teams | Women safety and civic fieldwork · potential, exploratory\nDishTV | Consumer media research · potential, exploratory\nMetro Card | Transit and commuter studies · potential, exploratory\nOther government bodies, research institutions, private companies and agencies | Add as the network grows · potential only',
  NOW()
)
ON CONFLICT ("key") DO UPDATE
SET "value" = EXCLUDED."value", "updated_at" = NOW()
WHERE "app_settings"."value" IS NULL OR btrim("app_settings"."value") = '';

SELECT "key", "value" FROM "app_settings" WHERE "key" = 'survey_opportunities';
