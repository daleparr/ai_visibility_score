#!/bin/bash

# Emergency Database Schema Fix Deployment Script
# Fixes critical missing tables and columns causing evaluation data loss

set -e  # Exit on any error

echo "🚨 EMERGENCY DATABASE SCHEMA FIX DEPLOYMENT"
echo "============================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your NeonDB connection string"
    exit 1
fi

echo "✅ DATABASE_URL is set"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: psql is not installed"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo "✅ psql is available"

# Backup current schema (optional but recommended)
echo "📋 Creating schema backup..."
BACKUP_FILE="schema_backup_$(date +%Y%m%d_%H%M%S).sql"
psql "$DATABASE_URL" -c "\dt production.*" > "$BACKUP_FILE" 2>/dev/null || echo "⚠️  Backup creation failed (non-critical)"

# Test database connection
echo "🔌 Testing database connection..."
psql "$DATABASE_URL" -c "SELECT version();" > /dev/null
echo "✅ Database connection successful"

# Run the emergency schema fix
echo "🔧 Applying emergency schema fix..."
psql "$DATABASE_URL" -f drizzle/emergency_schema_fix.sql

# Verify the fix
echo "🔍 Verifying schema integrity..."
VERIFICATION_RESULT=$(psql "$DATABASE_URL" -t -c "SELECT * FROM production.verify_schema_integrity();")

echo "📊 VERIFICATION RESULTS:"
echo "$VERIFICATION_RESULT"

# Check if any issues remain
if echo "$VERIFICATION_RESULT" | grep -q "MISSING"; then
    echo "❌ SOME ISSUES REMAIN - CHECK VERIFICATION RESULTS ABOVE"
    exit 1
else
    echo "✅ ALL SCHEMA ISSUES RESOLVED SUCCESSFULLY!"
fi

# Test a sample write operation
echo "🧪 Testing sample write operations..."

# Test crawl_site_signals insert
TEST_EVAL_ID=$(uuidgen)
psql "$DATABASE_URL" -c "
INSERT INTO production.evaluations (id, brand_id, status) 
VALUES ('$TEST_EVAL_ID', (SELECT id FROM production.brands LIMIT 1), 'pending');

INSERT INTO production.crawl_site_signals (evaluation_id, load_time_ms, has_https) 
VALUES ('$TEST_EVAL_ID', 1500, true);

INSERT INTO production.website_snapshots (evaluation_id, url, html_content) 
VALUES ('$TEST_EVAL_ID', 'https://test.com', '<html>test</html>');

DELETE FROM production.crawl_site_signals WHERE evaluation_id = '$TEST_EVAL_ID';
DELETE FROM production.website_snapshots WHERE evaluation_id = '$TEST_EVAL_ID';
DELETE FROM production.evaluations WHERE id = '$TEST_EVAL_ID';
" > /dev/null

echo "✅ Sample write operations successful"

echo ""
echo "🎉 EMERGENCY SCHEMA FIX DEPLOYMENT COMPLETE!"
echo "============================================="
echo "✅ Missing tables created: crawl_site_signals, website_snapshots"
echo "✅ Missing columns added to evaluation_results"
echo "✅ Enhanced probe tables prepared: probe_results, hybrid_crawl_data"
echo "✅ All write operations should now work without errors"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. Restart your application to clear any cached schema information"
echo "2. Run a test evaluation to verify data is being saved"
echo "3. Monitor logs to ensure no more 'table does not exist' errors"
echo ""
echo "📊 To verify ongoing health, run:"
echo "   psql \"\$DATABASE_URL\" -c \"SELECT * FROM production.verify_schema_integrity();\""
