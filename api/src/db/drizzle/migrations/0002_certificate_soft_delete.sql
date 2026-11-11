ALTER TABLE "certificates" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "certificates_deleted_at_idx" ON "certificates" USING btree ("deleted_at");