-- Tokens backfilled in 0010 used md5(random()::text), which is not a CSPRNG.
-- Rotate only those legacy 32-hex-char values; tokens minted by the app are
-- randomBytes(24).toString("hex") (48 chars) and remain valid.
-- gen_random_uuid() is built into PostgreSQL 13+ and draws from a CSPRNG.
UPDATE "fellowship_applications"
SET "candidate_token" = regexp_replace(gen_random_uuid()::text, '-', '', 'g') || regexp_replace(gen_random_uuid()::text, '-', '', 'g')
WHERE "candidate_token" ~ '^[0-9a-f]{32}$';--> statement-breakpoint
UPDATE "fellowship_interviews"
SET "candidate_token" = regexp_replace(gen_random_uuid()::text, '-', '', 'g') || regexp_replace(gen_random_uuid()::text, '-', '', 'g')
WHERE "candidate_token" ~ '^[0-9a-f]{32}$';--> statement-breakpoint
UPDATE "fellowship_mentors"
SET "portal_token" = regexp_replace(gen_random_uuid()::text, '-', '', 'g') || regexp_replace(gen_random_uuid()::text, '-', '', 'g')
WHERE "portal_token" ~ '^[0-9a-f]{32}$';--> statement-breakpoint
UPDATE "fellowship_alumni"
SET "update_token" = regexp_replace(gen_random_uuid()::text, '-', '', 'g') || regexp_replace(gen_random_uuid()::text, '-', '', 'g')
WHERE "update_token" ~ '^[0-9a-f]{32}$';
