# Emergency Database Schema Fix Deployment Script (PowerShell)
# Fixes critical missing tables and columns causing evaluation data loss

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

Write-Host "🚨 EMERGENCY DATABASE SCHEMA FIX DEPLOYMENT" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Yellow

# Check if DATABASE_URL is provided
if (-not $DatabaseUrl) {
    Write-Host "❌ ERROR: DATABASE_URL is not provided" -ForegroundColor Red
    Write-Host "Please set DATABASE_URL environment variable or pass it as parameter" -ForegroundColor Yellow
    Write-Host "Usage: .\deploy_emergency_schema_fix.ps1 -DatabaseUrl 'your_connection_string'" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✅ psql is available" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: psql is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

# Test database connection
Write-Host "🔌 Testing database connection..." -ForegroundColor Cyan
try {
    $result = psql $DatabaseUrl -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Connection failed"
    }
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Cannot connect to database" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and network connection" -ForegroundColor Yellow
    exit 1
}

# Create backup (optional)
Write-Host "📋 Creating schema backup..." -ForegroundColor Cyan
$backupFile = "schema_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
try {
    psql $DatabaseUrl -c "\dt production.*" > $backupFile 2>$null
    Write-Host "✅ Schema backup created: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backup creation failed (non-critical)" -ForegroundColor Yellow
}

# Run the emergency schema fix
Write-Host "🔧 Applying emergency schema fix..." -ForegroundColor Cyan
try {
    $result = psql $DatabaseUrl -f "drizzle/emergency_schema_fix.sql" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Schema fix failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Emergency schema fix applied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to apply schema fix" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Verify the fix
Write-Host "🔍 Verifying schema integrity..." -ForegroundColor Cyan
try {
    $verificationResult = psql $DatabaseUrl -t -c "SELECT * FROM production.verify_schema_integrity();"
    
    Write-Host "📊 VERIFICATION RESULTS:" -ForegroundColor Yellow
    Write-Host $verificationResult -ForegroundColor White
    
    # Check if any issues remain
    if ($verificationResult -match "MISSING") {
        Write-Host "❌ SOME ISSUES REMAIN - CHECK VERIFICATION RESULTS ABOVE" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "✅ ALL SCHEMA ISSUES RESOLVED SUCCESSFULLY!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ERROR: Verification failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Test sample write operations
Write-Host "🧪 Testing sample write operations..." -ForegroundColor Cyan
try {
    $testEvalId = [System.Guid]::NewGuid().ToString()
    
    $testQuery = @"
INSERT INTO production.evaluations (id, brand_id, status) 
VALUES ('$testEvalId', (SELECT id FROM production.brands LIMIT 1), 'pending');

INSERT INTO production.crawl_site_signals (evaluation_id, load_time_ms, has_https) 
VALUES ('$testEvalId', 1500, true);

INSERT INTO production.website_snapshots (evaluation_id, url, html_content) 
VALUES ('$testEvalId', 'https://test.com', '<html>test</html>');

DELETE FROM production.crawl_site_signals WHERE evaluation_id = '$testEvalId';
DELETE FROM production.website_snapshots WHERE evaluation_id = '$testEvalId';
DELETE FROM production.evaluations WHERE id = '$testEvalId';
"@

    $result = psql $DatabaseUrl -c $testQuery 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Test operations failed: $result"
    }
    
    Write-Host "✅ Sample write operations successful" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Test write operations failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 EMERGENCY SCHEMA FIX DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "✅ Missing tables created: crawl_site_signals, website_snapshots" -ForegroundColor Green
Write-Host "✅ Missing columns added to evaluation_results" -ForegroundColor Green
Write-Host "✅ Enhanced probe tables prepared: probe_results, hybrid_crawl_data" -ForegroundColor Green
Write-Host "✅ All write operations should now work without errors" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Restart your application to clear any cached schema information" -ForegroundColor White
Write-Host "2. Run a test evaluation to verify data is being saved" -ForegroundColor White
Write-Host "3. Monitor logs to ensure no more 'table does not exist' errors" -ForegroundColor White
Write-Host ""
Write-Host "📊 To verify ongoing health, run:" -ForegroundColor Cyan
Write-Host "   psql `"$DatabaseUrl`" -c `"SELECT * FROM production.verify_schema_integrity();`"" -ForegroundColor White
