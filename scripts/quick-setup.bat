@echo off
setlocal enabledelayedexpansion

REM AI Visibility Score - Zero Friction Setup Script (Windows)
REM This script sets up everything needed for user testing in under 5 minutes

echo.
echo 🚀 AI Visibility Score - Quick Setup for User Testing
echo ==================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    echo Please install npm (usually comes with Node.js)
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ⚠️  IMPORTANT: Database Setup Required
echo Before continuing, you need to:
echo 1. Go to https://neon.tech
echo 2. Sign up and create a project called 'ai-visibility-score'
echo 3. Copy your DATABASE_URL
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo 📝 Creating environment configuration...
    copy .env.neon.example .env.local >nul
    echo ✅ Created .env.local from template
) else (
    echo ⚠️  .env.local already exists
)

echo.
echo 🔧 Please update your .env.local file with:
echo 1. Your Neon DATABASE_URL
echo 2. A random 32-character ENCRYPTION_KEY
echo 3. Ensure DEMO_MODE=true
echo.

pause

REM Check if DATABASE_URL is configured
findstr /C:"postgresql://demo:demo@demo.neon.tech" .env.local >nul
if not errorlevel 1 (
    echo ❌ Please update DATABASE_URL in .env.local with your actual Neon database URL
    pause
    exit /b 1
)

REM Check if ENCRYPTION_KEY is configured
findstr /C:"demo_encryption_key_32_characters" .env.local >nul
if not errorlevel 1 (
    echo ⚠️  Using demo encryption key. Consider generating a real one for production.
)

echo 🗄️  Setting up database schema...
call npm run db:generate
if errorlevel 1 (
    echo ❌ Failed to generate database schema
    pause
    exit /b 1
)

call npm run db:migrate
if errorlevel 1 (
    echo ❌ Failed to apply database migrations
    pause
    exit /b 1
)

echo ✅ Database schema applied successfully

echo.
echo 🌱 Seeding initial data...
call npm run db:seed
if errorlevel 1 (
    echo ⚠️  Seeding failed or not needed
)

echo.
echo 🎉 Setup Complete!
echo.
echo 🚀 Starting development server...
echo Your AI Visibility Score platform will be available at:
echo.
echo 📊 Main Dashboard: http://localhost:3005/demo
echo 💎 ADI Premium:   http://localhost:3005/demo/adi
echo 🏠 Landing Page:  http://localhost:3005
echo.
echo Perfect for user testing - no authentication required!
echo.

REM Start the development server
call npm run dev -- --port 3005