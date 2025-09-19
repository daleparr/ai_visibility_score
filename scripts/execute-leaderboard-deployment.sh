#!/bin/bash

# Leaderboard Deployment Execution Script
# Run this script after database migration completes

echo "🚀 Starting Leaderboard Deployment Execution..."
echo "================================================"

# Set error handling
set -e

# Function to check command success
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed successfully"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Step 1: Test deployment readiness
echo ""
echo "📋 Step 1: Testing deployment readiness..."
npm run leaderboard:test
check_success "Deployment readiness test"

# Step 2: Initialize brand selection
echo ""
echo "🌱 Step 2: Initializing brand selection (500+ brands)..."
npm run leaderboard:seed
check_success "Brand selection initialization"

# Step 3: Start evaluation queue processing
echo ""
echo "⚙️ Step 3: Starting evaluation queue processing..."
npm run leaderboard:process &
PROCESS_PID=$!
echo "Queue processing started with PID: $PROCESS_PID"
echo "✅ Evaluation queue processing initiated"

# Step 4: Verify API endpoints
echo ""
echo "🔗 Step 4: Verifying API endpoints..."
sleep 5  # Give the server time to start processing

echo "Testing leaderboard API..."
curl -s "http://localhost:3000/api/leaderboards" > /dev/null
check_success "Leaderboard API test"

echo "Testing population stats API..."
curl -s "http://localhost:3000/api/leaderboard-population?action=stats" > /dev/null
check_success "Population stats API test"

# Step 5: Display status
echo ""
echo "📊 Step 5: Deployment Status Summary"
echo "===================================="

echo "✅ Database migration: Complete"
echo "✅ Brand selection: Initialized"
echo "✅ Queue processing: Running (PID: $PROCESS_PID)"
echo "✅ API endpoints: Functional"

echo ""
echo "🎉 LEADERBOARD DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📈 Monitoring Commands:"
echo "  • Check stats: curl 'http://localhost:3000/api/leaderboard-population?action=stats'"
echo "  • View leaderboards: curl 'http://localhost:3000/api/leaderboards'"
echo "  • Check queue: curl 'http://localhost:3000/api/leaderboard-population?action=queue'"
echo ""
echo "🔄 Queue Processing:"
echo "  • Process is running in background (PID: $PROCESS_PID)"
echo "  • Evaluations will continue automatically"
echo "  • Check progress via API endpoints above"
echo ""
echo "🚀 Ready for user testing!"