@echo off
REM =====================================================
REM CRITICAL PRODUCTION DATABASE FIX DEPLOYMENT SCRIPT
REM Ensures production schema exists and is properly configured
REM =====================================================

echo 🚨 CRITICAL: Deploying production database fix...
echo 📅 %date% %time%

REM Check if NETLIFY_DATABASE_URL is set
if "%NETLIFY_DATABASE_URL%"=="" (
    echo ❌ NETLIFY_DATABASE_URL not set. This must be configured in Netlify dashboard.
    echo 🔧 Set this in Netlify: Site settings ^> Environment variables
    echo 🔗 Value: postgresql://neondb_owner:npg_Wn45TPwKdbkF@ep-little-silence-adftn0q3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require^&channel_binding=require
    exit /b 1
)

echo ✅ Database URL configured

REM Step 1: Run production schema migration
echo 🔄 Step 1: Creating production schema and tables...
psql "%NETLIFY_DATABASE_URL%" -f PRODUCTION_SCHEMA_COMPLETE_MIGRATION.sql

if %errorlevel% neq 0 (
    echo ❌ Production schema migration failed
    exit /b 1
)
echo ✅ Production schema migration completed

REM Step 2: Verify critical tables exist
echo 🔄 Step 2: Verifying critical tables...
psql "%NETLIFY_DATABASE_URL%" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'production' AND table_name IN ('evaluations', 'dimension_scores', 'brands', 'users', 'adi_agent_results')" > temp_count.txt
set /p CRITICAL_TABLES=<temp_count.txt
del temp_count.txt

echo 📊 Found %CRITICAL_TABLES% critical tables in production schema

if %CRITICAL_TABLES% geq 5 (
    echo ✅ All critical tables exist
) else (
    echo ❌ Missing critical tables. Expected 5, found %CRITICAL_TABLES%
    echo 🔍 Listing existing production tables:
    psql "%NETLIFY_DATABASE_URL%" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'production' ORDER BY table_name"
    exit /b 1
)

REM Step 3: Test database connectivity
echo 🔄 Step 3: Testing database connectivity...
psql "%NETLIFY_DATABASE_URL%" -c "SELECT 'Database connection test successful' as status, current_user, current_database()"

if %errorlevel% neq 0 (
    echo ❌ Database connectivity failed
    exit /b 1
)
echo ✅ Database connectivity verified

REM Step 4: Verify table structure
echo 🔄 Step 4: Verifying table structure...
echo 📋 Evaluations table structure:
psql "%NETLIFY_DATABASE_URL%" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'production' AND table_name = 'evaluations' ORDER BY ordinal_position"

echo 📋 Dimension scores table structure:
psql "%NETLIFY_DATABASE_URL%" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'production' AND table_name = 'dimension_scores' ORDER BY ordinal_position"

REM Step 5: Check current record counts
echo 🔄 Step 5: Checking current record counts...
psql "%NETLIFY_DATABASE_URL%" -c "SELECT 'production.evaluations' as table_name, COUNT(*) as record_count FROM production.evaluations UNION ALL SELECT 'production.dimension_scores' as table_name, COUNT(*) as record_count FROM production.dimension_scores UNION ALL SELECT 'production.adi_agent_results' as table_name, COUNT(*) as record_count FROM production.adi_agent_results ORDER BY table_name"

echo.
echo 🎉 PRODUCTION DATABASE FIX DEPLOYMENT COMPLETE!
echo.
echo 📋 NEXT STEPS:
echo 1. Deploy this code to Netlify
echo 2. Ensure NETLIFY_DATABASE_URL is set in Netlify dashboard
echo 3. Test evaluation API endpoint
echo 4. Verify data persistence in production.evaluations
echo.
echo 🔗 Test endpoints after deployment:
echo    - https://your-app.netlify.app/api/production-db-test
echo    - https://your-app.netlify.app/api/evaluate
echo.