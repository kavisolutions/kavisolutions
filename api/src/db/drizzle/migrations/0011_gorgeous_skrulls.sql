CREATE TABLE "fellowship_email_templates" (
	"key" text PRIMARY KEY NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
