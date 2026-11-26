-- Access-control seed data. Hand-written (drizzle-kit generates schema diffs only)
-- and registered in meta/_journal.json so `npm run db:migrate` applies it.
-- Safe to re-run: every insert is ON CONFLICT DO NOTHING.
-- roles.id and permissions.id are serial numbers; old slugs live in the
-- `code` column of each table. role_permissions uses both numeric ids.
-- Admins can change the role -> permission mapping later by editing role_permissions.

-- Roles. Codes preserve the previous ids, including the legacy org roles.
INSERT INTO "roles" ("id", "code", "name", "sort_order") VALUES
  (1, 'volunteer', 'Volunteer', 1),
  (2, 'intern', 'Intern', 2),
  (3, 'fellow', 'Fellow', 3),
  (4, 'mentor', 'Mentor', 4),
  (5, 'partner', 'Partner', 5),
  (6, 'super_admin', 'Super Admin', 6),
  (7, 'admin', 'Admin', 7),
  (8, 'user', 'User', 8)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint

SELECT setval('roles_id_seq', COALESCE((SELECT MAX("id") FROM "roles"), 1));--> statement-breakpoint

-- Permission catalog. Codes preserve the previous text ids.
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

-- Default access matrix. Admin UI/API can revise these rows at any time.
-- Role ids: super_admin 6, admin 7, mentor 4, user 8.
-- Permission ids: kavi 1, survey 2, fellow 3, farm 4, social 5, teams 6, people 7.
-- Legacy org roles keep no grants for now.
INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
  (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7),
  (7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7),
  (4, 1), (4, 3), (4, 7),
  (8, 1)
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
