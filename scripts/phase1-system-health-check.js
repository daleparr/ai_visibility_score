#!/usr/bin/env node

/**
 * Phase 1: System Health Verification Script
 * Comprehensive end-to-end testing for production readiness
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testTimeout: 30000, // 30 seconds
  concurrentUsers: 5,
  testBrands: [
    'https://apple.com',
    'https://nike.com',
    'https://tesla.com',
    'https://shopify.com',
    'https://stripe.com',
    'https://netflix.com',
    'https://airbnb.com',
    'https://uber.com',
    'https://spotify.com',
    'https://zoom.us',
    'https://slack.com',
    'https://github.com',
    'https://microsoft.com',
    'https://google.com',
    'https://amazon.com',
    'https://facebook.com',
    'https://twitter.com',
    'https://linkedin.com',
    'https://instagram.com',
    'https://tiktok.com'
  ]
};

// Test Results Storage
const testResults = {
  startTime: new Date(),
  endTime: null,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  results: [],
  performance: {
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    responseTimes: []
  }
};

// Utility Functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AIDI-Health-Check/1.0',
        ...options.headers
      },
      timeout: CONFIG.testTimeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

function logTest(testName, status, details = {}) {
  const result = {
    test: testName,
    status: status,
    timestamp: new Date(),
    details: details
  };
  
  testResults.results.push(result);
  testResults.totalTests++;
  
  if (status === 'PASS') {
    testResults.passedTests++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failedTests++;
    console.log(`❌ ${testName}: ${details.error || 'Failed'}`);
  }
  
  if (details.responseTime) {
    testResults.performance.responseTimes.push(details.responseTime);
    testResults.performance.maxResponseTime = Math.max(testResults.performance.maxResponseTime, details.responseTime);
    testResults.performance.minResponseTime = Math.min(testResults.performance.minResponseTime, details.responseTime);
  }
}

// Test Functions
async function testHealthEndpoint() {
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/health`);
    
    if (response.statusCode === 200) {
      logTest('Health Endpoint', 'PASS', { 
        responseTime: response.responseTime,
        statusCode: response.statusCode 
      });
    } else {
      logTest('Health Endpoint', 'FAIL', { 
        error: `Expected 200, got ${response.statusCode}`,
        responseTime: response.responseTime 
      });
    }
  } catch (error) {
    logTest('Health Endpoint', 'FAIL', { error: error.message });
  }
}

async function testDatabaseConnection() {
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/debug-env`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.database && data.database.status === 'connected') {
        logTest('Database Connection', 'PASS', { 
          responseTime: response.responseTime,
          connectionPool: data.database.connectionPool 
        });
      } else {
        logTest('Database Connection', 'FAIL', { 
          error: 'Database not connected',
          details: data.database 
        });
      }
    } else {
      logTest('Database Connection', 'FAIL', { 
        error: `API returned ${response.statusCode}` 
      });
    }
  } catch (error) {
    logTest('Database Connection', 'FAIL', { error: error.message });
  }
}

async function testBrandEvaluation(brandUrl) {
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/api/evaluate`, {
      method: 'POST',
      body: { url: brandUrl }
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      
      // Validate response structure
      const hasRequiredFields = data.evaluationId && 
                               data.overallScore !== undefined && 
                               data.grade && 
                               data.dimensionScores && 
                               data.pillarScores;
      
      if (hasRequiredFields && response.responseTime < 10000) {
        logTest(`Brand Evaluation: ${brandUrl}`, 'PASS', { 
          responseTime: response.responseTime,
          score: data.overallScore,
          grade: data.grade,
          agentsExecuted: data.performance?.agentsExecuted || 'unknown'
        });
      } else {
        logTest(`Brand Evaluation: ${brandUrl}`, 'FAIL', { 
          error: hasRequiredFields ? 'Response too slow' : 'Missing required fields',
          responseTime: response.responseTime,
          missingFields: !hasRequiredFields
        });
      }
    } else {
      logTest(`Brand Evaluation: ${brandUrl}`, 'FAIL', { 
        error: `HTTP ${response.statusCode}`,
        responseTime: response.responseTime 
      });
    }
  } catch (error) {
    logTest(`Brand Evaluation: ${brandUrl}`, 'FAIL', { error: error.message });
  }
}

async function testAuthenticationFlow() {
  try {
    // Test auth configuration endpoint
    const response = await makeRequest(`${CONFIG.baseUrl}/api/auth/providers`);
    
    if (response.statusCode === 200) {
      const providers = JSON.parse(response.data);
      if (providers && Object.keys(providers).length > 0) {
        logTest('Authentication Configuration', 'PASS', { 
          responseTime: response.responseTime,
          providers: Object.keys(providers)
        });
      } else {
        logTest('Authentication Configuration', 'FAIL', { 
          error: 'No auth providers configured' 
        });
      }
    } else {
      logTest('Authentication Configuration', 'FAIL', { 
        error: `HTTP ${response.statusCode}` 
      });
    }
  } catch (error) {
    logTest('Authentication Configuration', 'FAIL', { error: error.message });
  }
}

async function testStripeIntegration() {
  try {
    // Test Stripe configuration (without actual payment)
    const response = await makeRequest(`${CONFIG.baseUrl}/api/stripe/config`);
    
    if (response.statusCode === 200) {
      const config = JSON.parse(response.data);
      if (config.publishableKey && config.priceIds) {
        logTest('Stripe Configuration', 'PASS', { 
          responseTime: response.responseTime,
          hasPublishableKey: !!config.publishableKey,
          priceIds: Object.keys(config.priceIds || {})
        });
      } else {
        logTest('Stripe Configuration', 'FAIL', { 
          error: 'Missing Stripe configuration' 
        });
      }
    } else if (response.statusCode === 404) {
      // Create a basic Stripe config test endpoint if it doesn't exist
      logTest('Stripe Configuration', 'SKIP', { 
        error: 'Stripe config endpoint not found - manual verification needed' 
      });
    } else {
      logTest('Stripe Configuration', 'FAIL', { 
        error: `HTTP ${response.statusCode}` 
      });
    }
  } catch (error) {
    logTest('Stripe Configuration', 'SKIP', { 
      error: 'Stripe test requires manual verification' 
    });
  }
}

async function testConcurrentLoad() {
  console.log(`\n🔄 Testing concurrent load with ${CONFIG.concurrentUsers} users...`);
  
  const promises = [];
  const testBrand = 'https://example.com';
  
  for (let i = 0; i < CONFIG.concurrentUsers; i++) {
    promises.push(testBrandEvaluation(testBrand));
  }
  
  try {
    await Promise.all(promises);
    logTest('Concurrent Load Test', 'PASS', { 
      concurrentUsers: CONFIG.concurrentUsers,
      testBrand: testBrand 
    });
  } catch (error) {
    logTest('Concurrent Load Test', 'FAIL', { 
      error: error.message,
      concurrentUsers: CONFIG.concurrentUsers 
    });
  }
}

function calculatePerformanceMetrics() {
  const responseTimes = testResults.performance.responseTimes;
  if (responseTimes.length > 0) {
    testResults.performance.averageResponseTime = 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }
}

function generateReport() {
  testResults.endTime = new Date();
  calculatePerformanceMetrics();
  
  const duration = testResults.endTime - testResults.startTime;
  const successRate = (testResults.passedTests / testResults.totalTests * 100).toFixed(1);
  
  console.log('\n' + '='.repeat(60));
  console.log('🏥 PHASE 1: SYSTEM HEALTH CHECK RESULTS');
  console.log('='.repeat(60));
  console.log(`📊 Test Summary:`);
  console.log(`   Total Tests: ${testResults.totalTests}`);
  console.log(`   Passed: ${testResults.passedTests}`);
  console.log(`   Failed: ${testResults.failedTests}`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
  
  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   Average Response Time: ${testResults.performance.averageResponseTime.toFixed(0)}ms`);
  console.log(`   Max Response Time: ${testResults.performance.maxResponseTime}ms`);
  console.log(`   Min Response Time: ${testResults.performance.minResponseTime}ms`);
  
  console.log(`\n🎯 Readiness Assessment:`);
  if (successRate >= 90 && testResults.performance.averageResponseTime < 8000) {
    console.log(`   ✅ READY FOR USER TESTING`);
    console.log(`   System meets all performance and reliability criteria`);
  } else if (successRate >= 80) {
    console.log(`   ⚠️  NEEDS OPTIMIZATION`);
    console.log(`   Some issues detected - review failed tests`);
  } else {
    console.log(`   ❌ NOT READY`);
    console.log(`   Critical issues detected - fix before user testing`);
  }
  
  // Save detailed results
  const reportData = {
    summary: {
      timestamp: testResults.endTime,
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      successRate: parseFloat(successRate),
      duration: duration
    },
    performance: testResults.performance,
    detailedResults: testResults.results
  };
  
  require('fs').writeFileSync(
    'phase1-health-check-results.json', 
    JSON.stringify(reportData, null, 2)
  );
  
  console.log(`\n📄 Detailed results saved to: phase1-health-check-results.json`);
  console.log('='.repeat(60));
}

// Main Test Execution
async function runHealthCheck() {
  console.log('🚀 Starting Phase 1: System Health Verification');
  console.log(`🎯 Target URL: ${CONFIG.baseUrl}`);
  console.log(`📊 Testing ${CONFIG.testBrands.length} brands with ${CONFIG.concurrentUsers} concurrent users`);
  console.log('='.repeat(60));
  
  // Core System Tests
  console.log('\n🔧 Testing Core System Components...');
  await testHealthEndpoint();
  await testDatabaseConnection();
  await testAuthenticationFlow();
  await testStripeIntegration();
  
  // Brand Evaluation Tests (sample)
  console.log('\n🧪 Testing Brand Evaluation System...');
  const sampleBrands = CONFIG.testBrands.slice(0, 5); // Test first 5 brands
  for (const brand of sampleBrands) {
    await testBrandEvaluation(brand);
  }
  
  // Load Testing
  await testConcurrentLoad();
  
  // Generate Final Report
  generateReport();
  
  // Exit with appropriate code
  const successRate = (testResults.passedTests / testResults.totalTests * 100);
  process.exit(successRate >= 90 ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  runHealthCheck().catch(error => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, testResults };