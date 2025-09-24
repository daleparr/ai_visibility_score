-- Manual recovery script for missing production tables on Neon
-- Run in the target database using psql or the Neon SQL editor

BEGIN;

CREATE SCHEMA IF NOT EXISTS production;

-- Ensure the users table exists before proceeding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'production'
          AND table_name = 'users'
    ) THEN
        RAISE EXCEPTION 'production.users table is missing. Run the base schema migrations before this patch.';
    END IF;
END
$$;

-- Create production.user_profiles if missing
CREATE TABLE IF NOT EXISTS production.user_profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(100),
    industry VARCHAR(100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE production.user_profiles
            ADD CONSTRAINT user_profiles_id_users_id_fk
            FOREIGN KEY (id) REFERENCES production.users(id)
            ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
END
$$;

CREATE INDEX IF NOT EXISTS user_profiles_id_idx
    ON production.user_profiles (id);

-- Create production.subscriptions if missing
CREATE TABLE IF NOT EXISTS production.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES production.users(id),
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    tier VARCHAR(32) DEFAULT 'free',
    status VARCHAR(32) DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
    ON production.subscriptions (user_id);

DO $$
BEGIN
    BEGIN
        ALTER TABLE production.subscriptions
            ADD CONSTRAINT subscriptions_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES production.users(id)
            ON DELETE SET NULL ON UPDATE NO ACTION;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END;
END
$$;

-- Optional: copy data from legacy schemas into the new tables
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_profiles'
    ) THEN
        INSERT INTO production.user_profiles (
            id,
            full_name,
            company_name,
            role,
            industry,
            created_at,
            updated_at
        )
        SELECT
            legacy.id,
            legacy.full_name,
            legacy.company_name,
            legacy.role,
            legacy.industry,
            COALESCE(legacy.created_at, now()),
            COALESCE(legacy.updated_at, now())
        FROM public.user_profiles AS legacy
        ON CONFLICT (id) DO UPDATE
            SET full_name = EXCLUDED.full_name,
                company_name = EXCLUDED.company_name,
                role = EXCLUDED.role,
                industry = EXCLUDED.industry,
                updated_at = EXCLUDED.updated_at;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'production'
          AND table_name = 'adi_subscriptions'
    ) THEN
        INSERT INTO production.subscriptions (
            user_id,
            stripe_customer_id,
            stripe_subscription_id,
            tier,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            created_at,
            updated_at
        )
        SELECT
            legacy.user_id,
            legacy.stripe_customer_id,
            legacy.stripe_subscription_id,
            COALESCE(legacy.tier, 'free'),
            COALESCE(legacy.status, 'active'),
            legacy.current_period_start,
            legacy.current_period_end,
            COALESCE(legacy.cancel_at_period_end, FALSE),
            COALESCE(legacy.created_at, now()),
            COALESCE(legacy.updated_at, now())
        FROM production.adi_subscriptions AS legacy
        ON CONFLICT (stripe_subscription_id) DO UPDATE
            SET tier = EXCLUDED.tier,
                status = EXCLUDED.status,
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                cancel_at_period_end = EXCLUDED.cancel_at_period_end,
                updated_at = EXCLUDED.updated_at;
    END IF;
END
$$;

COMMIT;