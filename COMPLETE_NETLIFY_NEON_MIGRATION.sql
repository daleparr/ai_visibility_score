-- COMPLETE NETLIFY NEON DATABASE MIGRATION
-- Copy and paste this entire script into the Neon SQL editor
-- This includes all tables needed for the application

-- Create ENUMs first
CREATE TYPE "public"."adi_industry_category" AS ENUM('apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 'luxury', 'mass_market', 'b2b', 'services');
CREATE TYPE "public"."adi_subscription_tier" AS ENUM('free', 'professional', 'enterprise');
CREATE TYPE "public"."agent_status" AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE "public"."evaluation_status" AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE "public"."grade_type" AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE "public"."recommendation_priority" AS ENUM('1', '2', '3');

-- Core authentication and user tables
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"name" varchar(255),
	"image" varchar(500),
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);

CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"company_name" varchar(255),
	"role" varchar(100),
	"industry" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Subscription and payment tables (MISSING FROM ORIGINAL MIGRATION)
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid REFERENCES "users"("id"),
	"stripe_customer_id" varchar UNIQUE,
	"stripe_subscription_id" varchar UNIQUE,
	"tier" varchar DEFAULT 'free',
	"status" varchar DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid REFERENCES "users"("id"),
	"subscription_id" integer REFERENCES "subscriptions"("id"),
	"stripe_payment_intent_id" varchar UNIQUE,
	"stripe_invoice_id" varchar,
	"amount" integer,
	"currency" varchar DEFAULT 'gbp',
	"status" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Brand and evaluation tables
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"website_url" varchar(500) NOT NULL,
	"industry" varchar(100),
	"description" text,
	"competitors" jsonb,
	"adi_industry_id" uuid,
	"adi_enabled" boolean DEFAULT false,
	"annual_revenue_range" varchar(50),
	"employee_count_range" varchar(50),
	"primary_market_regions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"status" "evaluation_status" DEFAULT 'pending',
	"overall_score" integer,
	"grade" "grade_type",
	"verdict" text,
	"strongest_dimension" varchar(100),
	"weakest_dimension" varchar(100),
	"biggest_opportunity" varchar(100),
	"adi_score" integer,
	"adi_grade" "grade_type",
	"confidence_interval" integer,
	"reliability_score" integer,
	"industry_percentile" integer,
	"global_rank" integer,
	"methodology_version" varchar(20) DEFAULT 'ADI-v1.0',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "dimension_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"dimension_name" varchar(100) NOT NULL,
	"score" integer NOT NULL,
	"explanation" text,
	"recommendations" jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "ai_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"api_key_encrypted" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "evaluation_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"test_type" varchar(100) NOT NULL,
	"prompt_used" text,
	"response_received" text,
	"score_contribution" integer,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"priority" "recommendation_priority" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"impact_level" varchar(20),
	"effort_level" varchar(20),
	"category" varchar(50),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "competitor_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"competitor_url" varchar(500) NOT NULL,
	"competitor_name" varchar(255),
	"overall_score" integer,
	"dimension_scores" jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "adi_industries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "adi_industry_category" NOT NULL,
	"description" text,
	"query_canon" jsonb,
	"benchmark_criteria" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "adi_industries_name_unique" UNIQUE("name")
);

CREATE TABLE "adi_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry_id" uuid,
	"benchmark_date" timestamp NOT NULL,
	"total_brands_evaluated" integer,
	"median_score" integer,
	"p25_score" integer,
	"p75_score" integer,
	"p90_score" integer,
	"top_performer_score" integer,
	"dimension_medians" jsonb,
	"methodology_version" varchar(20),
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "adi_leaderboards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"industry_id" uuid,
	"rank_global" integer,
	"rank_industry" integer,
	"rank_category" integer,
	"adi_score" integer,
	"score_change_30d" integer,
	"score_change_90d" integer,
	"is_public" boolean DEFAULT false,
	"featured_badge" varchar(100),
	"leaderboard_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "adi_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "adi_subscription_tier" DEFAULT 'free' NOT NULL,
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"is_active" boolean DEFAULT true,
	"monthly_evaluation_limit" integer DEFAULT 3,
	"api_access_enabled" boolean DEFAULT false,
	"benchmarking_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "adi_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" uuid NOT NULL,
	"agent_name" varchar(100) NOT NULL,
	"agent_version" varchar(20) DEFAULT 'v1.0',
	"status" "agent_status" DEFAULT 'pending',
	"started_at" timestamp,
	"completed_at" timestamp,
	"execution_time_ms" integer,
	"input_data" jsonb,
	"output_data" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "adi_agent_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"result_type" varchar(100) NOT NULL,
	"raw_value" integer,
	"normalized_score" integer,
	"confidence_level" integer,
	"evidence" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Add all foreign key constraints
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "brands" ADD CONSTRAINT "brands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "dimension_scores" ADD CONSTRAINT "dimension_scores_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_providers" ADD CONSTRAINT "ai_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "evaluation_results" ADD CONSTRAINT "evaluation_results_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "competitor_benchmarks" ADD CONSTRAINT "competitor_benchmarks_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "adi_benchmarks" ADD CONSTRAINT "adi_benchmarks_industry_id_adi_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."adi_industries"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "adi_leaderboards" ADD CONSTRAINT "adi_leaderboards_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "adi_leaderboards" ADD CONSTRAINT "adi_leaderboards_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "adi_leaderboards" ADD CONSTRAINT "adi_leaderboards_industry_id_adi_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."adi_industries"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "adi_subscriptions" ADD CONSTRAINT "adi_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "adi_agents" ADD CONSTRAINT "adi_agents_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "adi_agent_results" ADD CONSTRAINT "adi_agent_results_agent_id_adi_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."adi_agents"("id") ON DELETE cascade ON UPDATE no action;