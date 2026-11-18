CREATE TABLE "fellowship_client_engagements" (
	"id" text PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"project_title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"contract_value" integer DEFAULT 0 NOT NULL,
	"received_amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'lead' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"owner" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_colleges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"district" text DEFAULT '' NOT NULL,
	"state" text DEFAULT 'Andhra Pradesh' NOT NULL,
	"type" text DEFAULT 'degree' NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_role" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"stage" text DEFAULT 'identified' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"last_contacted_at" timestamp with time zone,
	"next_follow_up_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_content_items" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'social_post' NOT NULL,
	"channel" text DEFAULT 'instagram' NOT NULL,
	"status" text DEFAULT 'idea' NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"due_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"url" text DEFAULT '' NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"engagements" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_donations" (
	"id" text PRIMARY KEY NOT NULL,
	"donor_name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"purpose" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'pledged' NOT NULL,
	"reward_preference" text DEFAULT 'none' NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"received_at" timestamp with time zone,
	"mode" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_fee_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"candidate_name" text DEFAULT '' NOT NULL,
	"candidate_email" text DEFAULT '' NOT NULL,
	"programme" text DEFAULT 'fellowship' NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"scholarship_amount" integer DEFAULT 0 NOT NULL,
	"paid_amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"channel" text DEFAULT 'website' NOT NULL,
	"category" text DEFAULT 'admissions' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"callback_at" timestamp with time zone,
	"resolution" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_outreach_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"college_id" text,
	"audience" text DEFAULT 'student' NOT NULL,
	"question" text NOT NULL,
	"answer" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"asked_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_outreach_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"college_id" text,
	"title" text NOT NULL,
	"mode" text DEFAULT 'offline' NOT NULL,
	"audience" text DEFAULT 'students' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"attendees" integer DEFAULT 0 NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_placements" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"candidate_name" text DEFAULT '' NOT NULL,
	"candidate_email" text DEFAULT '' NOT NULL,
	"employer" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"package_amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'offer' NOT NULL,
	"source" text DEFAULT 'external' NOT NULL,
	"offer_at" timestamp with time zone,
	"joined_at" timestamp with time zone,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_stipends" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"candidate_name" text DEFAULT '' NOT NULL,
	"candidate_email" text DEFAULT '' NOT NULL,
	"month_number" integer NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"due_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"mode" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gurukulam_interests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'gurukulam' NOT NULL,
	"background" text DEFAULT '' NOT NULL,
	"goal" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"application_id" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fellowship_fee_plans" ADD CONSTRAINT "fellowship_fee_plans_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_outreach_questions" ADD CONSTRAINT "fellowship_outreach_questions_college_id_fellowship_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."fellowship_colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_outreach_sessions" ADD CONSTRAINT "fellowship_outreach_sessions_college_id_fellowship_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."fellowship_colleges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_placements" ADD CONSTRAINT "fellowship_placements_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_stipends" ADD CONSTRAINT "fellowship_stipends_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gurukulam_interests" ADD CONSTRAINT "gurukulam_interests_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fellowship_client_status_idx" ON "fellowship_client_engagements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_client_start_idx" ON "fellowship_client_engagements" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "fellowship_colleges_stage_idx" ON "fellowship_colleges" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "fellowship_colleges_follow_up_idx" ON "fellowship_colleges" USING btree ("next_follow_up_at");--> statement-breakpoint
CREATE INDEX "fellowship_colleges_name_idx" ON "fellowship_colleges" USING btree ("name");--> statement-breakpoint
CREATE INDEX "fellowship_content_status_idx" ON "fellowship_content_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_content_due_idx" ON "fellowship_content_items" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "fellowship_content_channel_idx" ON "fellowship_content_items" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "fellowship_donations_status_idx" ON "fellowship_donations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_donations_created_idx" ON "fellowship_donations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fellowship_fee_plans_application_idx" ON "fellowship_fee_plans" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_fee_plans_status_idx" ON "fellowship_fee_plans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_fee_plans_due_idx" ON "fellowship_fee_plans" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "fellowship_inquiries_status_idx" ON "fellowship_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_inquiries_callback_idx" ON "fellowship_inquiries" USING btree ("callback_at");--> statement-breakpoint
CREATE INDEX "fellowship_inquiries_created_idx" ON "fellowship_inquiries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fellowship_outreach_questions_status_idx" ON "fellowship_outreach_questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_outreach_questions_college_idx" ON "fellowship_outreach_questions" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "fellowship_outreach_sessions_college_idx" ON "fellowship_outreach_sessions" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "fellowship_outreach_sessions_scheduled_idx" ON "fellowship_outreach_sessions" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "fellowship_outreach_sessions_status_idx" ON "fellowship_outreach_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_placements_application_idx" ON "fellowship_placements" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_placements_status_idx" ON "fellowship_placements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_stipends_application_idx" ON "fellowship_stipends" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_stipends_status_idx" ON "fellowship_stipends" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fellowship_stipends_due_idx" ON "fellowship_stipends" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "gurukulam_interests_status_idx" ON "gurukulam_interests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "gurukulam_interests_kind_idx" ON "gurukulam_interests" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "gurukulam_interests_created_idx" ON "gurukulam_interests" USING btree ("created_at");