CREATE TABLE "certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"recipient_name" text NOT NULL,
	"programme" text,
	"role" text,
	"start_date" text,
	"end_date" text,
	"issued_on" text NOT NULL,
	"summary" text,
	"status" text DEFAULT 'issued' NOT NULL,
	"revoked_on" text,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "certificates_type_idx" ON "certificates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "certificates_issued_on_idx" ON "certificates" USING btree ("issued_on");