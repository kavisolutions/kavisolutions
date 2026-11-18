CREATE TABLE "fellowship_application_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"reviewer_name" text NOT NULL,
	"reviewer_email" text NOT NULL,
	"role" text DEFAULT 'reviewer' NOT NULL,
	"token" text NOT NULL,
	"motivation_score" integer,
	"commitment_score" integer,
	"communication_score" integer,
	"problem_score" integer,
	"field_score" integer,
	"fit_score" integer,
	"recommendation" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"token_expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_email" text DEFAULT '' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text DEFAULT '' NOT NULL,
	"application_id" text,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"category" text DEFAULT 'grievance' NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"summary" text NOT NULL,
	"details" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assigned_to" text DEFAULT '' NOT NULL,
	"resolution" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fellowship_delivery_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"type" text DEFAULT 'weekly' NOT NULL,
	"phase" text DEFAULT '' NOT NULL,
	"week" integer,
	"reviewer_name" text DEFAULT '' NOT NULL,
	"reviewer_email" text DEFAULT '' NOT NULL,
	"attendance_percent" integer,
	"deliverable_score" integer,
	"collaboration_score" integer,
	"field_score" integer,
	"notes" text DEFAULT '' NOT NULL,
	"at_risk" boolean DEFAULT false NOT NULL,
	"risk_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"type" text DEFAULT 'other' NOT NULL,
	"name" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text DEFAULT '' NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"uploaded_by" text DEFAULT '' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "follow_up_due_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "follow_up_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "public_story" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "story_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "update_token" text;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "offer_reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "waitlist_position" integer;--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "waitlist_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "candidate_token" text;--> statement-breakpoint
ALTER TABLE "fellowship_interview_panel" ADD COLUMN "token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_interview_panel" ADD COLUMN "revoked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_interview_panel" ADD COLUMN "last_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD COLUMN "candidate_token" text;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD COLUMN "candidate_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD COLUMN "reschedule_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD COLUMN "reschedule_note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_mentors" ADD COLUMN "portal_token" text;--> statement-breakpoint
ALTER TABLE "fellowship_onboarding" ADD COLUMN "accommodation_notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_onboarding" ADD COLUMN "travel_notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_onboarding" ADD COLUMN "food_notes" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "fellowship_onboarding" ADD COLUMN "arrival_at" timestamp with time zone;--> statement-breakpoint
UPDATE "fellowship_applications" SET "candidate_token" = md5(random()::text || "id" || clock_timestamp()::text) WHERE "candidate_token" IS NULL;--> statement-breakpoint
UPDATE "fellowship_interviews" SET "candidate_token" = md5(random()::text || "id" || clock_timestamp()::text) WHERE "candidate_token" IS NULL;--> statement-breakpoint
UPDATE "fellowship_mentors" SET "portal_token" = md5(random()::text || "id" || clock_timestamp()::text) WHERE "portal_token" IS NULL;--> statement-breakpoint
UPDATE "fellowship_alumni" SET "update_token" = md5(random()::text || "id" || clock_timestamp()::text) WHERE "update_token" IS NULL;--> statement-breakpoint
ALTER TABLE "fellowship_application_reviews" ADD CONSTRAINT "fellowship_application_reviews_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_cases" ADD CONSTRAINT "fellowship_cases_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_delivery_reviews" ADD CONSTRAINT "fellowship_delivery_reviews_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_documents" ADD CONSTRAINT "fellowship_documents_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_application_reviews_token_unique" ON "fellowship_application_reviews" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fellowship_application_reviews_application_idx" ON "fellowship_application_reviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_audit_log_created_idx" ON "fellowship_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fellowship_audit_log_application_idx" ON "fellowship_audit_log" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_cases_status_idx" ON "fellowship_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_cases_application_idx" ON "fellowship_cases" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_delivery_reviews_application_idx" ON "fellowship_delivery_reviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_delivery_reviews_at_risk_idx" ON "fellowship_delivery_reviews" USING btree ("at_risk");--> statement-breakpoint
CREATE INDEX "fellowship_documents_application_idx" ON "fellowship_documents" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_alumni_update_token_unique" ON "fellowship_alumni" USING btree ("update_token");--> statement-breakpoint
CREATE INDEX "fellowship_alumni_follow_up_idx" ON "fellowship_alumni" USING btree ("follow_up_due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_applications_candidate_token_unique" ON "fellowship_applications" USING btree ("candidate_token");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_interviews_candidate_token_unique" ON "fellowship_interviews" USING btree ("candidate_token");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_mentors_portal_token_unique" ON "fellowship_mentors" USING btree ("portal_token");