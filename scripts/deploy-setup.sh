#!/bin/bash

# AI Visibility Score - Neon + Netlify Deployment Setup Script
# This script helps set up the migration from Supabase to Neon + Netlify

echo "🚀 AI Visibility Score - Neon + Netlify Migration Setup"
echo "======================================================="

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm install

# Install additional dependencies for Neon + NextAuth
echo "📦 Installing Neon + NextAuth dependencies..."
npm install pg @types/pg drizzle-orm drizzle-kit @neondatabase/serverless next-auth @auth/drizzle-adapter tsx

echo "✅ Dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp .env.neon.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials"
else
    echo "ℹ️  .env.local already exists"
fi

# Generate database migration
echo "🗄️  Generating database migration..."
npx drizzle-kit generate:pg

echo "✅ Migration files generated in ./drizzle/"

# Instructions for next steps
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Set up Neon database:"
echo "   - Go to https://neon.tech/"
echo "   - Create new project"
echo "   - Copy connection string to .env.local"
echo ""
echo "2. Set up Google OAuth:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create OAuth 2.0 credentials"
echo "   - Add credentials to .env.local"
echo ""
echo "3. Run database migration:"
echo "   npm run db:migrate"
echo ""
echo "4. Seed initial data:"
echo "   npm run db:seed"
echo ""
echo "5. Test locally:"
echo "   npm run dev -- --port 3005"
echo ""
echo "6. Deploy to Netlify:"
echo "   - Connect repository to Netlify"
echo "   - Set environment variables"
echo "   - Deploy!"
echo ""
echo "📚 See NEON_NETLIFY_MIGRATION_GUIDE.md for detailed instructions"