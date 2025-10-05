#!/usr/bin/env node

/**
 * Test script to trigger a hybrid evaluation and monitor the debugging output
 */

const { execSync, spawn } = require('child_process');
const { randomUUID } = require('crypto');

console.log('🧪 Testing Hybrid Evaluation with Enhanced Debugging');
console.log('='.repeat(60));

const TEST_URL = process.env.TEST_URL || 'https://nike.com';
const BASE_URL = 'http://localhost:3000';

async function testEvaluation() {
  try {
    console.log(`\n🌐 Testing evaluation for: ${TEST_URL}`);
    console.log(`📍 Base URL: ${BASE_URL}`);

    // Step 1: Start the development server
    console.log('\n🚀 Step 1: Starting development server...');
    const serverProcess = spawn('npm', ['run', 'dev:visibility'], {
      stdio: 'pipe',
      shell: true
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, 30000);

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Server:', output.slice(0, 200));
        if (output.includes('Local:') || output.includes('localhost:3000')) {
          clearTimeout(timeout);
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE') || error.includes('already in use')) {
          console.log('✅ Server already running');
          clearTimeout(timeout);
          resolve();
        } else {
          console.error('Server error:', error.slice(0, 200));
        }
      });
    });

    console.log('✅ Development server is ready');

    // Step 2: Trigger evaluation via API
    console.log('\n📊 Step 2: Triggering hybrid evaluation...');
    
    const evaluationPayload = {
      websiteUrl: TEST_URL,
      userId: 'test-user-' + randomUUID(),
      evaluationType: 'hybrid'
    };

    console.log('Payload:', JSON.stringify(evaluationPayload, null, 2));

    // Use curl to trigger the evaluation
    const curlCommand = `curl -X POST "${BASE_URL}/api/evaluation" -H "Content-Type: application/json" -d '${JSON.stringify(evaluationPayload)}'`;
    
    console.log('\n🔄 Executing:', curlCommand);
    
    let evaluationResponse;
    try {
      const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
      evaluationResponse = JSON.parse(result);
      console.log('✅ Evaluation triggered successfully');
      console.log('Response:', JSON.stringify(evaluationResponse, null, 2));
    } catch (error) {
      console.error('❌ Failed to trigger evaluation:', error.message);
      throw error;
    }

    if (!evaluationResponse.evaluationId) {
      throw new Error('No evaluation ID returned');
    }

    const evaluationId = evaluationResponse.evaluationId;
    console.log(`\n🆔 Evaluation ID: ${evaluationId}`);

    // Step 3: Monitor evaluation progress
    console.log('\n📈 Step 3: Monitoring evaluation progress...');
    
    let attempts = 0;
    const maxAttempts = 24; // 4 minutes at 10-second intervals
    let lastStatus = null;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\n🔍 Attempt ${attempts}/${maxAttempts} - Checking status...`);

      try {
        const statusCommand = `curl -s "${BASE_URL}/api/evaluation/${evaluationId}/hybrid-status"`;
        const statusResult = execSync(statusCommand, { encoding: 'utf8', timeout: 15000 });
        const statusResponse = JSON.parse(statusResult);

        console.log(`📊 Status: ${statusResponse.status}, Progress: ${statusResponse.progress}%`);
        console.log(`🤖 Slow agents: ${statusResponse.slowAgentsCompleted}/${statusResponse.slowAgentsTotal} completed`);
        console.log(`⏱️ Estimated time remaining: ${statusResponse.estimatedTimeRemaining}s`);

        if (statusResponse.executions && statusResponse.executions.length > 0) {
          console.log('\n🔍 Agent execution details:');
          statusResponse.executions.forEach(exec => {
            console.log(`  • ${exec.agentName}: ${exec.status} (${exec.executionTime || 0}ms)`);
          });
        }

        lastStatus = statusResponse;

        if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
          console.log(`\n✅ Evaluation ${statusResponse.status}!`);
          break;
        }

        // Wait 10 seconds before next check
        console.log('⏳ Waiting 10 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 10000));

      } catch (error) {
        console.error(`❌ Status check failed:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (attempts >= maxAttempts) {
      console.log('\n⚠️ Maximum attempts reached. Final status:');
      console.log(JSON.stringify(lastStatus, null, 2));
    }

    // Step 4: Check debug endpoint
    console.log('\n🔍 Step 4: Checking database debug endpoint...');
    try {
      const debugCommand = `curl -s "${BASE_URL}/api/debug/db-status"`;
      const debugResult = execSync(debugCommand, { encoding: 'utf8', timeout: 10000 });
      const debugResponse = JSON.parse(debugResult);
      
      console.log('Database status:', JSON.stringify(debugResponse, null, 2));
    } catch (error) {
      console.error('❌ Debug endpoint check failed:', error.message);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up...');
    serverProcess.kill('SIGTERM');
    
    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Helper function to wait
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
if (require.main === module) {
  testEvaluation().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testEvaluation };
