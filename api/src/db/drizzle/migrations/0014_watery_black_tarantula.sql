CREATE TABLE "survey_enquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"organisation" text DEFAULT '' NOT NULL,
	"service" text DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surveyor_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"surveyor_id" text NOT NULL,
	"action" text NOT NULL,
	"actor_email" text DEFAULT '' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "survey_enquiries_status_idx" ON "survey_enquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "survey_enquiries_created_idx" ON "survey_enquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "surveyor_audit_surveyor_idx" ON "surveyor_audit_log" USING btree ("surveyor_id");--> statement-breakpoint
CREATE INDEX "surveyor_audit_created_idx" ON "surveyor_audit_log" USING btree ("created_at");
--> statement-breakpoint
-- Launch the Survey & Research page as part of this release. Admins can hide
-- it again from Settings -> Live pages.
INSERT INTO "app_settings" ("key", "value", "updated_at")
VALUES ('page_survey_enabled', 'true', now())
ON CONFLICT ("key") DO UPDATE SET "value" = 'true', "updated_at" = now();
