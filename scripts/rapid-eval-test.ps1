# =====================================================================================
# RAPID EVALUATION TESTING LOOP
# Single command that runs eval → verifies counts → reports PASS/FAIL in ~10 seconds
# =====================================================================================

param(
    [string]$ApiUrl = "http://localhost:3002",
    [string]$PgUrl = "postgresql://neondb_owner:npg_Wn45TPwKdbkF@ep-little-silence-adftn0q3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
    [string]$TestUrl = "https://www.endclothing.com",
    [string]$Tier = "free",
    [bool]$ForceFallback = $false,
    [bool]$Debug = $true,
    [bool]$DryRun = $false
)

# Color codes for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Status {
    param([string]$Message, [string]$Color = $Blue)
    Write-Host "${Color}[$(Get-Date -Format 'HH:mm:ss')] $Message${Reset}"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${Green}✅ $Message${Reset}"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}❌ $Message${Reset}"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}⚠️  $Message${Reset}"
}

try {
    Write-Status "🚀 Starting rapid evaluation test cycle"
    Write-Status "API: $ApiUrl"
    Write-Status "URL: $TestUrl"
    Write-Status "Tier: $Tier"
    Write-Status "Force Fallback: $ForceFallback"
    Write-Status "Debug Mode: $Debug"
    Write-Status "Dry Run: $DryRun"

    # Step 1: Prepare evaluation request
    $requestBody = @{
        url = $TestUrl
        tier = $Tier
        forceFallback = $ForceFallback
        dryRun = $DryRun
    } | ConvertTo-Json

    $apiEndpoint = "$ApiUrl/api/evaluate"
    if ($Debug) {
        $apiEndpoint += "?debug=true"
    }
    if ($DryRun) {
        $apiEndpoint += if ($Debug) { "&dryRun=true" } else { "?dryRun=true" }
    }

    Write-Status "📡 Sending evaluation request..."
    Write-Host "   Endpoint: $apiEndpoint"
    Write-Host "   Body: $requestBody"

    # Step 2: Execute evaluation
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Method Post -Uri $apiEndpoint -ContentType "application/json" -Body $requestBody -TimeoutSec 120
    }
    catch {
        Write-Error "Evaluation request failed: $_"
        Write-Host "Response: $($_.Exception.Response)"
        exit 1
    }

    $evalTime = $stopwatch.Elapsed.TotalSeconds
    $evaluationId = $response.evaluationId

    if (-not $evaluationId) {
        Write-Error "No evaluationId in response"
        Write-Host "Response: $($response | ConvertTo-Json -Depth 10)"
        exit 1
    }

    Write-Success "Evaluation completed in ${evalTime}s"
    Write-Host "   Evaluation ID: $evaluationId"
    Write-Host "   Status: $($response.status)"
    Write-Host "   Grade: $($response.grade)"
    Write-Host "   Overall Score: $($response.overallScore)"

    # Step 3: Verify database persistence (skip if dry run)
    if ($DryRun) {
        Write-Warning "Dry run mode - skipping database verification"
        Write-Success "DRY RUN COMPLETED SUCCESSFULLY"
        exit 0
    }

    Write-Status "🔍 Verifying database persistence..."

    # Verification SQL
    $verificationSql = @"
SELECT 
  (SELECT COUNT(*) FROM production.evaluations WHERE id = '$evaluationId') AS evals,
  (SELECT COUNT(*) FROM production.dimension_scores WHERE evaluation_id = '$evaluationId') AS dim_scores,
  (SELECT COUNT(*) FROM production.website_snapshots WHERE evaluation_id = '$evaluationId') AS snapshots,
  (SELECT COUNT(*) FROM production.crawl_site_signals WHERE evaluation_id = '$evaluationId') AS signals,
  (SELECT COUNT(*) FROM production.evaluation_features_flat WHERE evaluation_id = '$evaluationId') AS features;
"@

    try {
        $verificationResult = psql "$PgUrl" -X -v ON_ERROR_STOP=1 -P pager=off -t -c $verificationSql
        $counts = $verificationResult.Trim() -split '\s*\|\s*'
        
        if ($counts.Length -ge 5) {
            $evalCount = [int]$counts[0].Trim()
            $dimCount = [int]$counts[1].Trim()
            $snapCount = [int]$counts[2].Trim()
            $signalCount = [int]$counts[3].Trim()
            $featCount = [int]$counts[4].Trim()
        } else {
            throw "Invalid verification result format: $verificationResult"
        }
    }
    catch {
        Write-Error "Database verification failed: $_"
        exit 1
    }

    # Step 4: Analyze results and determine PASS/FAIL
    Write-Status "📊 Analyzing persistence results..."
    Write-Host "   Evaluations: $evalCount"
    Write-Host "   Dimension Scores: $dimCount"
    Write-Host "   Website Snapshots: $snapCount"
    Write-Host "   Crawl Signals: $signalCount"
    Write-Host "   Features: $featCount"

    $allCriteria = @()
    $failedCriteria = @()

    # Evaluation must exist (critical)
    if ($evalCount -eq 1) {
        $allCriteria += "✅ Evaluation record exists"
    } else {
        $allCriteria += "❌ Evaluation record missing/duplicate ($evalCount)"
        $failedCriteria += "evaluation_record"
    }

    # Dimension scores (should have multiple)
    if ($dimCount -gt 0) {
        $allCriteria += "✅ Dimension scores persisted ($dimCount)"
    } else {
        $allCriteria += "❌ No dimension scores found"
        $failedCriteria += "dimension_scores"
    }

    # Artifacts (at least one of each expected)
    if ($snapCount -gt 0) {
        $allCriteria += "✅ Website snapshots persisted ($snapCount)"
    } else {
        $allCriteria += "⚠️  No website snapshots found"
        $failedCriteria += "website_snapshots"
    }

    if ($signalCount -gt 0) {
        $allCriteria += "✅ Crawl signals persisted ($signalCount)"
    } else {
        $allCriteria += "⚠️  No crawl signals found"
        $failedCriteria += "crawl_signals"
    }

    if ($featCount -gt 0) {
        $allCriteria += "✅ Features persisted ($featCount)"
    } else {
        $allCriteria += "⚠️  No features found"
        $failedCriteria += "features"
    }

    # Display detailed results
    Write-Host "`n📋 PERSISTENCE ANALYSIS:"
    foreach ($criterion in $allCriteria) {
        Write-Host "   $criterion"
    }

    # Final PASS/FAIL determination
    $totalTime = $stopwatch.Elapsed.TotalSeconds
    $stopwatch.Stop()

    Write-Host "`n⏱️  Total execution time: ${totalTime}s"

    # Critical failures (evaluation record + dimension scores)
    $criticalFailures = $failedCriteria | Where-Object { $_ -in @("evaluation_record", "dimension_scores") }
    
    if ($criticalFailures.Count -eq 0) {
        Write-Success "🎉 PERSISTENCE TEST PASSED"
        Write-Host "   Core data (evaluation + dimensions) successfully persisted"
        if ($failedCriteria.Count -gt 0) {
            Write-Warning "   Some optional artifacts missing: $($failedCriteria -join ', ')"
            Write-Host "   This may be expected for fallback mode or specific test conditions"
        }
        exit 0
    } else {
        Write-Error "💥 PERSISTENCE TEST FAILED"
        Write-Host "   Critical failures: $($criticalFailures -join ', ')"
        Write-Host "   All failures: $($failedCriteria -join ', ')"
        exit 1
    }
}
catch {
    Write-Error "Test execution failed: $_"
    Write-Host "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}