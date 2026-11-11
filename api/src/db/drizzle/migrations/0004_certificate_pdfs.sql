ALTER TABLE "certificates" ADD COLUMN "pdf_key" text;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "pdf_size" integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD COLUMN "pdf_uploaded_at" timestamp with time zone;