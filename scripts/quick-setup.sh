#!/bin/bash

# AI Visibility Score - Zero Friction Setup Script
# This script sets up everything needed for user testing in under 5 minutes

set -e

echo "🚀 AI Visibility Score - Quick Setup for User Testing"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Database Setup Required${NC}"
echo "Before continuing, you need to:"
echo "1. Go to https://neon.tech"
echo "2. Sign up and create a project called 'ai-visibility-score'"
echo "3. Copy your DATABASE_URL"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${BLUE}📝 Creating environment configuration...${NC}"
    cp .env.neon.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Please update your .env.local file with:${NC}"
echo "1. Your Neon DATABASE_URL"
echo "2. A random 32-character ENCRYPTION_KEY"
echo "3. Ensure DEMO_MODE=true"
echo ""

read -p "Press Enter when you've updated .env.local..."

# Check if DATABASE_URL is configured
if grep -q "postgresql://demo:demo@demo.neon.tech" .env.local; then
    echo -e "${RED}❌ Please update DATABASE_URL in .env.local with your actual Neon database URL${NC}"
    exit 1
fi

# Check if ENCRYPTION_KEY is configured
if grep -q "demo_encryption_key_32_characters" .env.local; then
    echo -e "${YELLOW}⚠️  Using demo encryption key. Consider generating a real one for production.${NC}"
fi

echo -e "${BLUE}🗄️  Setting up database schema...${NC}"
npm run db:generate
npm run db:migrate

echo -e "${GREEN}✅ Database schema applied successfully${NC}"

echo ""
echo -e "${BLUE}🌱 Seeding initial data...${NC}"
npm run db:seed || echo -e "${YELLOW}⚠️  Seeding failed or not needed${NC}"

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}🚀 Starting development server...${NC}"
echo "Your AI Visibility Score platform will be available at:"
echo ""
echo -e "${GREEN}📊 Main Dashboard: http://localhost:3005/demo${NC}"
echo -e "${GREEN}💎 ADI Premium:   http://localhost:3005/demo/adi${NC}"
echo -e "${GREEN}🏠 Landing Page:  http://localhost:3005${NC}"
echo ""
echo -e "${YELLOW}Perfect for user testing - no authentication required!${NC}"
echo ""

# Start the development server
npm run dev -- --port 3005