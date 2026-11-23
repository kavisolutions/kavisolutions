ALTER TABLE "surveyors" ADD COLUMN "role" text DEFAULT 'surveyor' NOT NULL;--> statement-breakpoint
ALTER TABLE "surveyors" ADD COLUMN "coverage" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "surveyors" ADD COLUMN "availability" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "surveyors" ADD COLUMN "capacity" text DEFAULT '' NOT NULL;