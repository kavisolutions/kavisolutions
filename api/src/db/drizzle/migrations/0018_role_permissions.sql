CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
-- Backfill code from the old text id before converting id to a number.
ALTER TABLE "roles" ADD COLUMN "code" text;--> statement-breakpoint
UPDATE "roles" SET "code" = "id" WHERE "code" IS NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
-- Replace slug ids with numeric strings first, so the cast works even when
-- the table already has rows (e.g. the 5 legacy org roles).
UPDATE "roles" SET "id" = n.num::text FROM (
  SELECT ctid, row_number() OVER (ORDER BY "sort_order", "id") AS num FROM "roles"
) n WHERE "roles".ctid = n.ctid;--> statement-breakpoint
-- serial is a pseudo-type: use integer + an owned sequence instead of
-- `ALTER COLUMN id SET DATA TYPE serial`, which Postgres rejects.
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE integer USING ("id"::integer);--> statement-breakpoint
CREATE SEQUENCE "roles_id_seq" OWNED BY "roles"."id";--> statement-breakpoint
SELECT setval('roles_id_seq', COALESCE((SELECT MAX("id") FROM "roles"), 1), COALESCE((SELECT MAX("id") FROM "roles") IS NOT NULL, false));--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT nextval('roles_id_seq');--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_name_unique" ON "permissions" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_code_unique" ON "roles" USING btree ("code");
