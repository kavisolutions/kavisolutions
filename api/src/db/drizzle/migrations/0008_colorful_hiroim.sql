CREATE TABLE "fellowship_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"candidate_status" text DEFAULT '' NOT NULL,
	"track" text NOT NULL,
	"motivation" text NOT NULL,
	"full_time" boolean DEFAULT false NOT NULL,
	"vipassana" boolean DEFAULT false NOT NULL,
	"field_work" boolean DEFAULT false NOT NULL,
	"terms_accepted" boolean DEFAULT false NOT NULL,
	"cohort" text DEFAULT 'Unassigned' NOT NULL,
	"stage" text DEFAULT 'applied' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_applications_reference_unique" ON "fellowship_applications" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "fellowship_applications_stage_idx" ON "fellowship_applications" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "fellowship_applications_email_idx" ON "fellowship_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "fellowship_applications_created_at_idx" ON "fellowship_applications" USING btree ("created_at");