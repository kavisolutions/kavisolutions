-- In-place upgrade for databases that already applied 0018/0019 with the old
-- text permission ids. Guarded so it is a no-op on a fresh DB built from the
-- edited 0018/0019 (where permissions already have numeric ids + code).

-- 1. Add code and backfill from the old text id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'permissions' AND column_name = 'code'
  ) THEN
    ALTER TABLE "permissions" ADD COLUMN "code" text;
  END IF;
END $$;--> statement-breakpoint
UPDATE "permissions" SET "code" = "id" WHERE "code" IS NULL;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint

-- 2. Drop the old FK so ids can be rewritten on both sides.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_permission_id_permissions_id_fk') THEN
    ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_permissions_id_fk";
  END IF;
END $$;--> statement-breakpoint

-- 3. Convert text ids to numbers, remapping grants via the backfilled code.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'permissions' AND column_name = 'id' AND data_type = 'text'
  ) THEN
    UPDATE "permissions" SET "id" = n.num::text FROM (
      SELECT ctid, row_number() OVER (ORDER BY "sort_order", "id") AS num FROM "permissions"
    ) n WHERE "permissions".ctid = n.ctid;

    UPDATE "role_permissions" rp SET "permission_id" = p."id"
    FROM "permissions" p
    WHERE rp."permission_id" = p."code";

    ALTER TABLE "permissions" ALTER COLUMN "id" SET DATA TYPE integer USING ("id"::integer);
    ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE integer USING ("permission_id"::integer);
  END IF;
END $$;--> statement-breakpoint

-- 4. Sequence + default for the now-integer permissions.id.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'permissions_id_seq' AND relkind = 'S') THEN
    CREATE SEQUENCE "permissions_id_seq" OWNED BY "permissions"."id";
  END IF;
END $$;--> statement-breakpoint
SELECT setval('permissions_id_seq', COALESCE((SELECT MAX("id") FROM "permissions"), 1), COALESCE((SELECT MAX("id") FROM "permissions") IS NOT NULL, false));--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT nextval('permissions_id_seq');--> statement-breakpoint

-- 5. Restore FK and add the code uniqueness constraint.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'role_permissions_permission_id_permissions_id_fk') THEN
    ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk"
      FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'permissions_code_unique') THEN
    CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" USING btree ("code");
  END IF;
END $$;
