CREATE TABLE "fellowship_alumni" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cohort" text DEFAULT '' NOT NULL,
	"track" text DEFAULT '' NOT NULL,
	"destination_type" text DEFAULT '' NOT NULL,
	"organisation" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"outcome_6m" text DEFAULT '' NOT NULL,
	"outcome_12m" text DEFAULT '' NOT NULL,
	"mentor_willing" boolean DEFAULT false NOT NULL,
	"testimonial_consent" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_interview_panel" (
	"id" text PRIMARY KEY NOT NULL,
	"interview_id" text NOT NULL,
	"mentor_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'mentor' NOT NULL,
	"token" text NOT NULL,
	"motivation_score" integer,
	"commitment_score" integer,
	"communication_score" integer,
	"problem_score" integer,
	"field_score" integer,
	"fit_score" integer,
	"recommendation" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_interviews" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"mode" text DEFAULT 'online' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"meeting_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_mentors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"expertise" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_onboarding" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"id_verified" boolean DEFAULT false NOT NULL,
	"education_verified" boolean DEFAULT false NOT NULL,
	"emergency_contact" text DEFAULT '' NOT NULL,
	"medical_notes" text DEFAULT '' NOT NULL,
	"code_of_conduct" boolean DEFAULT false NOT NULL,
	"posh_ack" boolean DEFAULT false NOT NULL,
	"media_consent" boolean DEFAULT false NOT NULL,
	"device_needs" text DEFAULT '' NOT NULL,
	"baseline_done" boolean DEFAULT false NOT NULL,
	"vipassana_ack" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fellowship_applications" ADD COLUMN "offer_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "fellowship_alumni" ADD CONSTRAINT "fellowship_alumni_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_interview_panel" ADD CONSTRAINT "fellowship_interview_panel_interview_id_fellowship_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."fellowship_interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_interview_panel" ADD CONSTRAINT "fellowship_interview_panel_mentor_id_fellowship_mentors_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."fellowship_mentors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_interviews" ADD CONSTRAINT "fellowship_interviews_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_onboarding" ADD CONSTRAINT "fellowship_onboarding_application_id_fellowship_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."fellowship_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fellowship_alumni_email_idx" ON "fellowship_alumni" USING btree ("email");--> statement-breakpoint
CREATE INDEX "fellowship_alumni_cohort_idx" ON "fellowship_alumni" USING btree ("cohort");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_interview_panel_token_unique" ON "fellowship_interview_panel" USING btree ("token");--> statement-breakpoint
CREATE INDEX "fellowship_interview_panel_interview_idx" ON "fellowship_interview_panel" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX "fellowship_interviews_application_idx" ON "fellowship_interviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "fellowship_interviews_scheduled_idx" ON "fellowship_interviews" USING btree ("scheduled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_mentors_email_unique" ON "fellowship_mentors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "fellowship_mentors_status_idx" ON "fellowship_mentors" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_onboarding_application_unique" ON "fellowship_onboarding" USING btree ("application_id");