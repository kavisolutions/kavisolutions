# DML pre-data

SQL files in this directory populate data that must exist before the app is
deployed. They are not Drizzle migrations: run them manually or from the
deployment runbook after migrations.

## Production run

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f api/db/dml/0001_survey_content.sql
```

`0001_survey_content.sql` inserts the `survey_content` row (`id = 'main'`) with
the eight research verticals and all service points.

It is idempotent: `ON CONFLICT (id) DO NOTHING` means an existing row is left
untouched, so content published from the admin panel is never overwritten.
Re-running the file is safe.

`0002_survey_content_field_services.sql` syncs an existing database to the
approved `field-surveys` service list. It replaces only that vertical's
services array with the canonical 10-service list, leaves every other vertical
untouched, and does nothing when the list is already current.

`0003_survey_content_market_services.sql` does the same for the
`market-research` vertical, using the approved 8-service list.

`0004_survey_content_political.sql` does the same for the `political-social`
vertical, using the approved description and 7-service list.

`0005_survey_content_analysis_services.sql` does the same for the
`analysis-reporting` vertical, using the approved 9-service list.

`0006_survey_content_predictive.sql` syncs the `predictive-research` card to the
approved title, description and 7-service list. The description keeps the
required distinction between data-supported findings, estimates, predictions,
assumptions and limitations.

`0007_survey_content_academic.sql` syncs the `academic-research` card to the
approved title, description and 9-service list. The description keeps the
research-integrity statement: no fabricated data, results or findings.

`0008_survey_content_engagement.sql` syncs the five Project Execution Models
(on-call, direct execution, data collection, analysis and end-to-end).

## Verify

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT id, jsonb_array_length(data->'verticals') FROM survey_content WHERE id = 'main';"
```

Expected: `main|8`.

Check the Field Surveys & Data Collection service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'field-surveys';"
```

Expected: `10`.

Check the Market Research service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'market-research';"
```

Expected: `8`.

Check the Political & Social service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'political-social';"
```

Expected: `7`.

Check the Research Data Analysis & Reporting service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'analysis-reporting';"
```

Expected: `9`.

Check the Project Execution Models count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(data->'engagement') FROM survey_content WHERE id = 'main';"
```

Expected: `5`.

Check the Prediction-Based Research & Presentations service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'predictive-research';"
```

Expected: `7`.

Check the Academic & Institutional Research Support service count:

```bash
psql "$DATABASE_URL" -Atc \
  "SELECT jsonb_array_length(v->'services')
   FROM survey_content, jsonb_array_elements(data->'verticals') AS v
   WHERE id = 'main' AND v->>'slug' = 'academic-research';"
```

Expected: `9`.
