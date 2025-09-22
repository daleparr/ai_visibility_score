<# 
Debug runner for evaluation persistence verification.
Usage:
  $env:PGURL='postgresql://...sslmode=require'
  .\scripts\run-eval-debug.ps1 -ApiBase 'http://localhost:3002' [-ForceFallback]
#>
param(
  [string]$ApiBase = "http://localhost:3002",
  [string]$PgUrl = $env:PGURL,
  [switch]$ForceFallback
)

$ErrorActionPreference = "Stop"

if (-not $PgUrl) { throw "Set `$env:PGURL to your pooled Neon URL (sslmode=require)." }

# 1) Ensure default schema
psql --dbname="$PgUrl" -X -v ON_ERROR_STOP=1 -P "pager=off" -c "ALTER DATABASE neondb SET search_path TO production, public;" -c "ALTER ROLE neondb_owner IN DATABASE neondb SET search_path TO production, public;" | Out-Null
psql --dbname="$PgUrl" -X -v ON_ERROR_STOP=1 -P "pager=off" -c "SHOW search_path;"

# 2) Prepare body
$bodyPath = "tmp-eval.json"
$bodyObj = @{
  brandName    = "DebugCo"
  websiteUrl   = "https://www.example.com"
  url          = "https://www.example.com"
  industry     = "ecommerce"
  forceFallback= [bool]$ForceFallback.IsPresent
  tier         = "free"
}
$bodyObj | ConvertTo-Json | Set-Content -Encoding UTF8 $bodyPath

# 3) POST
try {
  $resp = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/evaluate" -ContentType "application/json" -InFile $bodyPath
} catch {
  Write-Host "Request failed: $($_.Exception.Message)"
  if (Test-Path resp.json) { Remove-Item resp.json -Force }
  $_ | Out-String | Set-Content -Encoding UTF8 'resp-error.txt'
  exit 1
}
$resp | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 'resp.json'
$evalId = $resp.evaluationId
if (-not $evalId) { Write-Host "No evaluationId. Full response follows:"; $resp | ConvertTo-Json -Depth 10 | Write-Host; exit 1 }
Write-Host ("evaluationId: " + $evalId)

# 4) One-shot verification
$verifySql = @"
SELECT 
  (SELECT count(*) FROM production.evaluations WHERE id = '$($evalId)') AS evals,
  (SELECT count(*) FROM production.dimension_scores WHERE evaluation_id = '$($evalId)') AS dim_scores,
  (SELECT count(*) FROM production.website_snapshots WHERE evaluation_id = '$($evalId)') AS snapshots,
  (SELECT count(*) FROM production.crawl_site_signals WHERE evaluation_id = '$($evalId)') AS signals,
  (SELECT count(*) FROM production.evaluation_features_flat WHERE evaluation_id = '$($evalId)') AS features;
"@
psql --dbname="$PgUrl" -X -v ON_ERROR_STOP=1 -P "pager=off" -c $verifySql
psql --dbname="$PgUrl" -X -v ON_ERROR_STOP=1 -P "pager=off" -c "SELECT id, status, overall_score, grade, created_at, completed_at FROM production.evaluations WHERE id = '$($evalId)';"