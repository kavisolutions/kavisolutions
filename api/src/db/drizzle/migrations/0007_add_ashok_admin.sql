-- Grant the existing administrator allowlist entry to Ashok.
--
-- Admin access is checked against the admins table on every request, so this
-- row is enough once the matching user signs in. The insert is idempotent.
INSERT INTO "admins" ("email")
VALUES ('ashokgf16@gmail.com')
ON CONFLICT ("email") DO NOTHING;
