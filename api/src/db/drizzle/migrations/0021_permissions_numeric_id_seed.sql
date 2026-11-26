-- Companion DML for 0020. Idempotent; safe on both upgraded and fresh DBs.
INSERT INTO "permissions" ("id", "code", "name", "description", "sort_order") VALUES
  (1, 'kavi', 'Kavi', 'Public website and marketing pages', 1),
  (2, 'survey', 'Survey', 'Survey & Research vertical', 2),
  (3, 'fellow', 'Fellow', 'Fellowship programme', 3),
  (4, 'farm', 'Farm', 'Kavi Farms vertical', 4),
  (5, 'social', 'Social', 'Social publishing and calendar', 5),
  (6, 'teams', 'Teams', 'Organisation teams and assignments', 6),
  (7, 'people', 'People', 'Team members and profiles', 7)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint

SELECT setval('permissions_id_seq', COALESCE((SELECT MAX("id") FROM "permissions"), 1));--> statement-breakpoint

INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
  (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7),
  (7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7),
  (4, 1), (4, 3), (4, 7),
  (8, 1)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
