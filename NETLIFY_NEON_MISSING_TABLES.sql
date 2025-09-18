-- Additional tables missing from initial migration
-- Run this in Neon SQL editor to add missing tables

CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
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
	"user_id" varchar REFERENCES "users"("id"),
	"subscription_id" integer REFERENCES "subscriptions"("id"),
	"stripe_payment_intent_id" varchar UNIQUE,
	"stripe_invoice_id" varchar,
	"amount" integer,
	"currency" varchar DEFAULT 'gbp',
	"status" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add constraints
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;