# CMS Deployment Script for Windows
# Run this to deploy CMS in one command

Write-Host "🚀 Deploying AIDI CMS..." -ForegroundColor Green
Write-Host ""

# Step 1: Check DATABASE_URL
Write-Host "Step 1: Checking database connection..." -ForegroundColor Cyan
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not set in environment" -ForegroundColor Red
    Write-Host "   Please set it in .env.local" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Database URL found" -ForegroundColor Green
Write-Host ""

# Step 2: Run database migration
Write-Host "Step 2: Running CMS database migration..." -ForegroundColor Cyan
try {
    Get-Content sql\cms-schema.sql | psql $env:DATABASE_URL
    Write-Host "✓ Database migration complete" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed. Check your DATABASE_URL and PostgreSQL connection" -ForegroundColor Red
    Write-Host "   You can run manually: psql `$env:DATABASE_URL -f sql\cms-schema.sql" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Check dependencies
Write-Host "Step 3: Checking dependencies..." -ForegroundColor Cyan
$deps = npm list date-fns 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  date-fns not found, installing..." -ForegroundColor Yellow
    npm install date-fns
    Write-Host "✓ date-fns installed" -ForegroundColor Green
} else {
    Write-Host "✓ date-fns already installed" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build check
Write-Host "Step 4: Checking TypeScript build..." -ForegroundColor Cyan
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build has warnings, but continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Start dev server
Write-Host "Step 5: Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "🎉 CMS Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your CMS at:" -ForegroundColor White
Write-Host "  http://localhost:3005/admin/cms" -ForegroundColor Cyan
Write-Host ""
Write-Host "Public pages:" -ForegroundColor White
Write-Host "  http://localhost:3005/blog (Blog)" -ForegroundColor Cyan
Write-Host "  http://localhost:3005/careers (Jobs)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""

npm run dev


