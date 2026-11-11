CREATE TABLE "surveyors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"languages" text[] DEFAULT '{}' NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"experience" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'applied' NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "surveyors_status_idx" ON "surveyors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "surveyors_location_idx" ON "surveyors" USING btree ("location");--> statement-breakpoint
CREATE UNIQUE INDEX "surveyors_email_unique" ON "surveyors" USING btree ("email");