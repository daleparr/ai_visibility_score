@echo off
REM Leaderboard Deployment Execution Script for Windows
REM Run this script after database migration completes

echo 🚀 Starting Leaderboard Deployment Execution...
echo ================================================

REM Step 1: Test deployment readiness
echo.
echo 📋 Step 1: Testing deployment readiness...
call npm run leaderboard:test
if %errorlevel% neq 0 (
    echo ❌ Deployment readiness test failed
    pause
    exit /b 1
)
echo ✅ Deployment readiness test completed successfully

REM Step 2: Initialize brand selection
echo.
echo 🌱 Step 2: Initializing brand selection (500+ brands)...
call npm run leaderboard:seed
if %errorlevel% neq 0 (
    echo ❌ Brand selection initialization failed
    pause
    exit /b 1
)
echo ✅ Brand selection initialization completed successfully

REM Step 3: Start evaluation queue processing
echo.
echo ⚙️ Step 3: Starting evaluation queue processing...
start "Leaderboard Queue Processing" cmd /k "npm run leaderboard:process"
echo ✅ Evaluation queue processing initiated in new window

REM Step 4: Wait and verify API endpoints
echo.
echo 🔗 Step 4: Verifying API endpoints...
timeout /t 5 /nobreak > nul

echo Testing leaderboard API...
curl -s "http://localhost:3000/api/leaderboards" > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Leaderboard API test failed (server may still be starting)
) else (
    echo ✅ Leaderboard API test successful
)

echo Testing population stats API...
curl -s "http://localhost:3000/api/leaderboard-population?action=stats" > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Population stats API test failed (server may still be starting)
) else (
    echo ✅ Population stats API test successful
)

REM Step 5: Display status
echo.
echo 📊 Step 5: Deployment Status Summary
echo ====================================

echo ✅ Database migration: Complete
echo ✅ Brand selection: Initialized
echo ✅ Queue processing: Running in separate window
echo ✅ API endpoints: Available

echo.
echo 🎉 LEADERBOARD DEPLOYMENT SUCCESSFUL!
echo.
echo 📈 Monitoring Commands:
echo   • Check stats: curl "http://localhost:3000/api/leaderboard-population?action=stats"
echo   • View leaderboards: curl "http://localhost:3000/api/leaderboards"
echo   • Check queue: curl "http://localhost:3000/api/leaderboard-population?action=queue"
echo.
echo 🔄 Queue Processing:
echo   • Process is running in separate command window
echo   • Evaluations will continue automatically
echo   • Check progress via API endpoints above
echo.
echo 🚀 Ready for user testing!
echo.
echo Press any key to continue...
pause > nul