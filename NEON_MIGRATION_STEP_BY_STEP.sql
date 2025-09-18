-- STEP-BY-STEP NEON MIGRATION
-- Run each section separately in the Neon SQL editor

-- STEP 1: Create ENUMs (run this first)
CREATE TYPE adi_industry_category AS ENUM('apparel', 'footwear', 'accessories', 'beauty', 'home', 'electronics', 'automotive', 'food_beverage', 'health_wellness', 'sports_outdoors', 'luxury', 'mass_market', 'b2b', 'services');

-- STEP 2: Create more ENUMs (run separately)
CREATE TYPE adi_subscription_tier AS ENUM('free', 'professional', 'enterprise');
CREATE TYPE agent_status AS ENUM('pending', 'running', 'completed', 'failed', 'skipped');
CREATE TYPE evaluation_status AS ENUM('pending', 'running', 'completed', 'failed');
CREATE TYPE grade_type AS ENUM('A', 'B', 'C', 'D', 'F');
CREATE TYPE recommendation_priority AS ENUM('1', '2', '3');

-- STEP 3: Create users table (run this)
CREATE TABLE users (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	email varchar(255) NOT NULL UNIQUE,
	email_verified timestamp,
	name varchar(255),
	image varchar(500),
	stripe_customer_id varchar(255),
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

-- STEP 4: Create accounts table (run this)
CREATE TABLE accounts (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	type varchar(255) NOT NULL,
	provider varchar(255) NOT NULL,
	provider_account_id varchar(255) NOT NULL,
	refresh_token text,
	access_token text,
	expires_at integer,
	token_type varchar(255),
	scope varchar(255),
	id_token text,
	session_state varchar(255),
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

-- STEP 5: Create sessions table (run this)
CREATE TABLE sessions (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	session_token varchar(255) NOT NULL UNIQUE,
	user_id uuid NOT NULL,
	expires timestamp NOT NULL,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

-- STEP 6: Create subscriptions table (run this)
CREATE TABLE subscriptions (
	id serial PRIMARY KEY NOT NULL,
	user_id uuid,
	stripe_customer_id varchar UNIQUE,
	stripe_subscription_id varchar UNIQUE,
	tier varchar DEFAULT 'free',
	status varchar DEFAULT 'active',
	current_period_start timestamp,
	current_period_end timestamp,
	cancel_at_period_end boolean DEFAULT false,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

-- STEP 7: Create brands table (run this)
CREATE TABLE brands (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL,
	name varchar(255) NOT NULL,
	website_url varchar(500) NOT NULL,
	industry varchar(100),
	description text,
	competitors jsonb,
	adi_industry_id uuid,
	adi_enabled boolean DEFAULT false,
	annual_revenue_range varchar(50),
	employee_count_range varchar(50),
	primary_market_regions jsonb,
	created_at timestamp DEFAULT now(),
	updated_at timestamp DEFAULT now()
);

-- STEP 8: Add foreign key constraints (run this last)
ALTER TABLE accounts ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade;
ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade;
ALTER TABLE brands ADD CONSTRAINT brands_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade;