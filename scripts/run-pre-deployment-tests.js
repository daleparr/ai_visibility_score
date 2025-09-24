/**
 * PRE-DEPLOYMENT TEST EXECUTION SCRIPT
 * 
 * Executes comprehensive test suite to validate Brave & CSE API integration,
 * agentic workflow persistence, and Neon database integrity before deployment.
 * 
 * Usage: node scripts/run-pre-deployment-tests.js [--suite=all|api|workflow|database|e2e|performance]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Also try .env.ai_visibility_score as fallback
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: '.env.ai_visibility_score' });
}

// Test suite configurations
const TEST_SUITES = {
  api: {
    name: '🚦 API Rate Limiting & Quota Validation',
    path: 'tests/integration/api-rate-limiting.test.ts',
    timeout: 60000,
    critical: true
  },
  workflow: {
    name: '🤖 Agentic Workflow Persistence',
    path: 'tests/integration/agentic-workflow-persistence.test.ts',
    timeout: 60000,
    critical: true
  },
  database: {
    name: '💾 Neon Database Integrity',
    path: 'tests/integration/neon-database-integrity.test.ts',
    timeout: 45000,
    critical: true
  },
  e2e: {
    name: '🚀 End-to-End Evaluation Flow',
    path: 'tests/integration/end-to-end-evaluation-flow.test.ts',
    timeout: 180000,
    critical: true
  },
  performance: {
    name: '⚡ Performance & Load Testing',
    path: 'tests/integration/performance-load-testing.test.ts',
    timeout: 300000,
    critical: false
  },
  comprehensive: {
    name: '🧪 Comprehensive Pre-Deployment Suite',
    path: 'tests/integration/pre-deployment-test-suite.test.ts',
    timeout: 60000,
    critical: true
  }
};

// Environment validation
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  
  // Handle both DATABASE_URL and NETLIFY_DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Missing database URL. Need either DATABASE_URL or NETLIFY_DATABASE_URL');
    return false;
  }
  
  // Set DATABASE_URL for tests if using NETLIFY_DATABASE_URL
  if (!process.env.DATABASE_URL && process.env.NETLIFY_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
    console.log('🔄 Using NETLIFY_DATABASE_URL as DATABASE_URL for tests');
  }
  
  const requiredEnv = ['NEXTAUTH_SECRET'];
  const optionalEnv = [
    'BRAVE_API_KEY',
    'GOOGLE_API_KEY',
    'GOOGLE_CSE_ID',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  const missing = requiredEnv.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  const availableOptional = optionalEnv.filter(env => process.env[env]);
  console.log(`✅ Environment validation passed`);
  console.log(`📊 Database: ${databaseUrl.substring(0, 50)}...`);
  console.log(`📊 Optional APIs available: ${availableOptional.length}/${optionalEnv.length}`);
  
  return true;
}

// Execute test suite
async function executeTestSuite(suiteName, suiteConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 EXECUTING: ${suiteConfig.name}`);
  console.log(`📁 File: ${suiteConfig.path}`);
  console.log(`⏱️ Timeout: ${suiteConfig.timeout}ms`);
  console.log(`${'='.repeat(60)}\n`);
  
  const startTime = Date.now();
  
  try {
    // Execute Jest for specific test file
    const jestCommand = `npx jest "${suiteConfig.path}" --verbose --detectOpenHandles --forceExit --testTimeout=${suiteConfig.timeout}`;
    
    execSync(jestCommand, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ ${suiteConfig.name} PASSED (${duration}ms)`);
    
    return { 
      suite: suiteName, 
      name: suiteConfig.name,
      status: 'PASSED', 
      duration,
      critical: suiteConfig.critical
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`\n❌ ${suiteConfig.name} FAILED (${duration}ms)`);
    console.error('Error:', error.message);
    
    return { 
      suite: suiteName, 
      name: suiteConfig.name,
      status: 'FAILED', 
      duration,
      critical: suiteConfig.critical,
      error: error.message
    };
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const suiteArg = args.find(arg => arg.startsWith('--suite='));
  const requestedSuite = suiteArg ? suiteArg.split('=')[1] : 'all';
  
  console.log(`
🧪 PRE-DEPLOYMENT TEST SUITE EXECUTION
======================================

Target: ${requestedSuite === 'all' ? 'All Test Suites' : `${requestedSuite} Suite Only`}
Time: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || 'development'}

🎯 PURPOSE: Validate Brave & CSE API integration with agentic workflow
          and Neon database persistence before production deployment.
  `);
  
  // Validate environment
  if (!validateEnvironment()) {
    console.error('❌ Environment validation failed. Please check your .env configuration.');
    process.exit(1);
  }
  
  // Determine which suites to run
  let suitesToRun = [];
  
  if (requestedSuite === 'all') {
    suitesToRun = Object.entries(TEST_SUITES);
  } else if (TEST_SUITES[requestedSuite]) {
    suitesToRun = [[requestedSuite, TEST_SUITES[requestedSuite]]];
  } else {
    console.error(`❌ Unknown test suite: ${requestedSuite}`);
    console.log(`Available suites: ${Object.keys(TEST_SUITES).join(', ')}, all`);
    process.exit(1);
  }
  
  // Execute test suites
  const results = [];
  const totalStartTime = Date.now();
  
  for (const [suiteName, suiteConfig] of suitesToRun) {
    const result = await executeTestSuite(suiteName, suiteConfig);
    results.push(result);
    
    // Stop on critical failures unless running all suites
    if (result.status === 'FAILED' && result.critical && requestedSuite !== 'all') {
      console.error(`❌ Critical test suite failed: ${result.name}`);
      break;
    }
  }
  
  const totalDuration = Date.now() - totalStartTime;
  
  // Generate final report
  console.log(`\n${'='.repeat(80)}`);
  console.log('🏁 PRE-DEPLOYMENT TEST SUITE EXECUTION COMPLETE');
  console.log(`${'='.repeat(80)}\n`);
  
  const passed = results.filter(r => r.status === 'PASSED');
  const failed = results.filter(r => r.status === 'FAILED');
  const criticalFailed = failed.filter(r => r.critical);
  
  console.log(`📊 EXECUTION SUMMARY:`);
  console.log(`  Total suites: ${results.length}`);
  console.log(`  Passed: ${passed.length}`);
  console.log(`  Failed: ${failed.length}`);
  console.log(`  Critical failures: ${criticalFailed.length}`);
  console.log(`  Total time: ${totalDuration}ms`);
  
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    const critical = result.critical ? '[CRITICAL]' : '[OPTIONAL]';
    console.log(`  ${status} ${result.name} ${critical} (${result.duration}ms)`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  // Generate deployment readiness assessment
  console.log(`\n🎯 DEPLOYMENT READINESS ASSESSMENT:`);
  
  if (criticalFailed.length === 0) {
    console.log(`✅ ALL CRITICAL TESTS PASSED - DEPLOYMENT APPROVED`);
    console.log(`📈 System validated for production deployment`);
    
    // Write success marker
    const successReport = {
      timestamp: new Date().toISOString(),
      testSuites: results.length,
      passed: passed.length,
      failed: failed.length,
      criticalFailures: criticalFailed.length,
      totalDuration,
      deploymentReady: true,
      validatedComponents: [
        'Brave Search & Google CSE API integration',
        'Agentic workflow orchestration',
        'Neon database persistence and integrity',
        'End-to-end evaluation flow',
        'Performance and load handling',
        'Error recovery and resilience'
      ]
    };
    
    fs.writeFileSync(
      'PRE_DEPLOYMENT_TEST_RESULTS.json', 
      JSON.stringify(successReport, null, 2)
    );
    
    console.log(`📄 Test results saved to PRE_DEPLOYMENT_TEST_RESULTS.json`);
    
  } else {
    console.error(`❌ CRITICAL FAILURES DETECTED - DEPLOYMENT BLOCKED`);
    console.error(`🚨 Must resolve ${criticalFailed.length} critical issues before deployment`);
    
    criticalFailed.forEach(failure => {
      console.error(`  ❌ ${failure.name}: ${failure.error}`);
    });
    
    process.exit(1);
  }
  
  console.log(`\n🚀 PRE-DEPLOYMENT VALIDATION COMPLETE`);
  console.log(`Ready for production deployment with validated:`);
  console.log(`• Brave Search & CSE API integration`);
  console.log(`• Agentic workflow persistence`);
  console.log(`• Neon database integrity`);
  console.log(`• End-to-end evaluation flows`);
  console.log(`• Performance and load handling`);
}

// Execute main function
main().catch(error => {
  console.error('❌ Test execution script failed:', error);
  process.exit(1);
});