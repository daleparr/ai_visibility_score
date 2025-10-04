CREATE TYPE "backend_agent_status" AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE "production"."backend_agent_executions" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "evaluation_id" uuid NOT NULL,
  "agent_name" varchar(100) NOT NULL,
  "status" "backend_agent_status" DEFAULT 'pending' NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "result" jsonb,
  "error" text,
  "execution_time" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "production"."backend_agent_executions" ADD FOREIGN KEY ("evaluation_id") REFERENCES "production"."evaluations" ("id") ON DELETE cascade;