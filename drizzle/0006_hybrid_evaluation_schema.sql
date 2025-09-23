DO $$ BEGIN
 CREATE TYPE "production"."probe_name" AS ENUM('schema_probe', 'policy_probe', 'kg_probe', 'semantics_probe');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "production"."model_id" AS ENUM('gpt4o', 'claude35', 'gemini15');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production"."page_blobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"page_type" "public"."page_type" NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"html_gzip" text,
	"extracted_jsonld" jsonb,
	"fetched_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "production"."probe_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"probe_name" "production"."probe_name" NOT NULL,
	"model" "production"."model_id" NOT NULL,
	"prompt_hash" varchar(64),
	"output_json" jsonb,
	"is_valid" boolean DEFAULT false,
	"citations_ok" boolean DEFAULT false,
	"confidence" integer,
	"started_at" timestamp,
	"finished_at" timestamp,
	"execution_time_ms" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production"."page_blobs" ADD CONSTRAINT "page_blobs_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "production"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "production"."probe_runs" ADD CONSTRAINT "probe_runs_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "production"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;