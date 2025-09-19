CREATE TABLE "competitive_triggers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"brand_id" uuid,
	"competitor_url" varchar(500) NOT NULL,
	"competitor_name" varchar(255),
	"trigger_type" "trigger_type" NOT NULL,
	"evaluation_status" "competitive_evaluation_status" DEFAULT 'pending',
	"evaluation_id" uuid,
	"triggered_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "evaluation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"website_url" varchar(500) NOT NULL,
	"niche_category" varchar(100) NOT NULL,
	"priority" integer DEFAULT 5,
	"status" "evaluation_queue_status" DEFAULT 'pending',
	"scheduled_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp,
	"retry_count" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"niche_category" varchar(100) NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"website_url" varchar(500) NOT NULL,
	"evaluation_id" uuid,
	"adi_score" integer NOT NULL,
	"grade" varchar(5) NOT NULL,
	"pillar_scores" jsonb NOT NULL,
	"dimension_scores" jsonb NOT NULL,
	"strength_highlight" jsonb NOT NULL,
	"gap_highlight" jsonb NOT NULL,
	"rank_global" integer,
	"rank_sector" integer,
	"rank_industry" integer,
	"rank_niche" integer,
	"trend_data" jsonb,
	"last_evaluated" timestamp NOT NULL,
	"cache_expires" timestamp NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"niche_category" varchar(100) NOT NULL,
	"total_brands" integer NOT NULL,
	"evaluated_brands" integer NOT NULL,
	"average_score" integer NOT NULL,
	"median_score" integer NOT NULL,
	"top_performer" varchar(255),
	"top_score" integer,
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "niche_brand_selection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"niche_category" varchar(100) NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"website_url" varchar(500) NOT NULL,
	"selection_type" "selection_type" NOT NULL,
	"priority" integer DEFAULT 5,
	"evaluation_status" varchar(50) DEFAULT 'pending',
	"evaluation_id" uuid,
	"added_at" timestamp DEFAULT now(),
	"last_evaluated" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"subscription_id" integer,
	"stripe_payment_intent_id" varchar,
	"stripe_invoice_id" varchar,
	"amount" integer,
	"currency" varchar DEFAULT 'gbp',
	"status" varchar,
	"tier" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"tier" varchar DEFAULT 'free',
	"status" varchar DEFAULT 'active',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "competitive_triggers" ADD CONSTRAINT "competitive_triggers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_triggers" ADD CONSTRAINT "competitive_triggers_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitive_triggers" ADD CONSTRAINT "competitive_triggers_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_cache" ADD CONSTRAINT "leaderboard_cache_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "niche_brand_selection" ADD CONSTRAINT "niche_brand_selection_evaluation_id_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;