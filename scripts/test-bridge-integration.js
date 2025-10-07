#!/usr/bin/env node

/**
 * Bridge Integration Test Suite
 * Tests the complete Netlify-Railway bridge integration
 */

const https = require('https')
const crypto = require('crypto')

// Configuration
const NETLIFY_URL = process.env.NETLIFY_URL || process.env.URL || 'https://ai-visibility-score.netlify.app'
const RAILWAY_URL = process.env.RAILWAY_API_URL || 'https://aidi-railway-workers-production.up.railway.app'

console.log('🧪 AIDI Bridge Integration Test Suite')
console.log('====================================')
console.log(`Netlify URL: ${NETLIFY_URL}`)
console.log(`Railway URL: ${RAILWAY_URL}`)
console.log('')

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, data: parsed, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers })
        }
      })
    })
    
    req.on('error', reject)
    req.setTimeout(15000, () => reject(new Error('Request timeout')))
    
    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

async function testFeatureFlags() {
  console.log('🎯 Testing Feature Flags API...')
  try {
    const response = await makeRequest(`${NETLIFY_URL}/api/admin/feature-flags`)
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Feature Flags API: Working')
      console.log(`   Railway Bridge Enabled: ${response.data.data.flags.enableRailwayBridge}`)
      console.log(`   Bridge Tiers: ${response.data.data.flags.railwayBridgeTiers.join(', ')}`)
      return response.data.data.flags
    } else {
      console.log('❌ Feature Flags API: Failed')
      console.log(`   Status: ${response.status}`)
      return null
    }
  } catch (error) {
    console.log(`❌ Feature Flags API: Error - ${error.message}`)
    return null
  }
}

async function testSystemRouting() {
  console.log('🎯 Testing System Routing Logic...')
  
  const testCases = [
    { tier: 'free', agents: ['crawl_agent', 'citation_agent'] },
    { tier: 'index-pro', agents: ['schema_agent', 'semantic_agent'] },
    { tier: 'enterprise', agents: ['crawl_agent', 'commerce_agent', 'sentiment_agent'] }
  ]
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest(`${NETLIFY_URL}/api/admin/feature-flags/test-routing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      })
      
      if (response.status === 200 && response.data.success) {
        const routing = response.data.data.routing
        console.log(`✅ ${testCase.tier} tier: ${routing.useRailwayBridge ? 'Railway' : 'Legacy'} (${routing.reason})`)
      } else {
        console.log(`❌ ${testCase.tier} tier: Failed to get routing decision`)
      }
    } catch (error) {
      console.log(`❌ ${testCase.tier} tier: Error - ${error.message}`)
    }
  }
}

async function testRailwayHealth() {
  console.log('🎯 Testing Railway Health...')
  
  const endpoints = [
    { name: 'Basic Health', path: '/health' },
    { name: 'Detailed Health', path: '/health/detailed' },
    { name: 'Readiness', path: '/health/ready' },
    { name: 'Liveness', path: '/health/live' }
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${RAILWAY_URL}${endpoint.path}`)
      
      if (response.status === 200) {
        console.log(`✅ Railway ${endpoint.name}: Healthy`)
        if (endpoint.path === '/health/detailed' && response.data.checks) {
          Object.entries(response.data.checks).forEach(([service, status]) => {
            console.log(`   ${service}: ${status}`)
          })
        }
      } else {
        console.log(`❌ Railway ${endpoint.name}: Unhealthy (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ Railway ${endpoint.name}: Error - ${error.message}`)
    }
  }
}

async function testBridgeAuthentication() {
  console.log('🎯 Testing Bridge Authentication...')
  
  // Test with invalid token
  try {
    const response = await makeRequest(`${RAILWAY_URL}/queue/status`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 401) {
      console.log('✅ Railway Authentication: Working (correctly rejected invalid token)')
    } else {
      console.log(`❌ Railway Authentication: Unexpected response (${response.status})`)
    }
  } catch (error) {
    console.log(`❌ Railway Authentication: Error - ${error.message}`)
  }
}

async function testBridgeEndpoints() {
  console.log('🎯 Testing Bridge Endpoints...')
  
  // Test Netlify bridge enqueue endpoint
  try {
    const response = await makeRequest(`${NETLIFY_URL}/.netlify/functions/bridge-enqueue`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    // We expect 405 (Method Not Allowed) for GET request
    if (response.status === 405) {
      console.log('✅ Netlify Bridge Enqueue: Available (correctly requires POST)')
    } else if (response.status === 404) {
      console.log('❌ Netlify Bridge Enqueue: Not deployed')
    } else {
      console.log(`⚠️  Netlify Bridge Enqueue: Unexpected response (${response.status})`)
    }
  } catch (error) {
    console.log(`❌ Netlify Bridge Enqueue: Error - ${error.message}`)
  }
  
  // Test Netlify callback endpoint
  try {
    const response = await makeRequest(`${NETLIFY_URL}/.netlify/functions/bridge-callback-api`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.status === 200) {
      console.log('✅ Netlify Bridge Callback: Available')
    } else if (response.status === 404) {
      console.log('❌ Netlify Bridge Callback: Not deployed')
    } else {
      console.log(`⚠️  Netlify Bridge Callback: Unexpected response (${response.status})`)
    }
  } catch (error) {
    console.log(`❌ Netlify Bridge Callback: Error - ${error.message}`)
  }
}

async function testEndToEndFlow() {
  console.log('🎯 Testing End-to-End Flow (Simulation)...')
  
  // This would test a complete evaluation flow, but requires valid authentication
  // For now, we'll just verify the endpoints are ready for integration
  
  const testEvaluation = {
    evaluationId: `test-${Date.now()}`,
    websiteUrl: 'https://example.com',
    tier: 'free',
    agents: ['crawl_agent'],
    priority: 'normal'
  }
  
  try {
    const response = await makeRequest(`${NETLIFY_URL}/.netlify/functions/bridge-enqueue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEvaluation)
    })
    
    // We expect 400 (validation error) or 401 (auth error), not 404
    if (response.status === 400 || response.status === 401) {
      console.log('✅ End-to-End Flow: Bridge is ready (validation/auth working)')
    } else if (response.status === 404) {
      console.log('❌ End-to-End Flow: Bridge endpoint not found')
    } else {
      console.log(`⚠️  End-to-End Flow: Unexpected response (${response.status})`)
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`❌ End-to-End Flow: Error - ${error.message}`)
  }
}

async function runAllTests() {
  console.log('Starting comprehensive bridge integration tests...\n')
  
  const tests = [
    { name: 'Feature Flags', test: testFeatureFlags },
    { name: 'System Routing', test: testSystemRouting },
    { name: 'Railway Health', test: testRailwayHealth },
    { name: 'Bridge Authentication', test: testBridgeAuthentication },
    { name: 'Bridge Endpoints', test: testBridgeEndpoints },
    { name: 'End-to-End Flow', test: testEndToEndFlow }
  ]
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`)
    await test.test()
  }
  
  console.log(`\n${'='.repeat(50)}`)
  console.log('🎉 Bridge Integration Test Suite Complete!')
  console.log('')
  console.log('Next Steps:')
  console.log('1. If all tests pass: Enable Railway bridge with ENABLE_RAILWAY_BRIDGE=true')
  console.log('2. If tests fail: Check Railway logs and environment variables')
  console.log('3. Monitor both systems during initial rollout')
  console.log('')
  console.log('Monitoring Commands:')
  console.log('- Railway logs: railway logs --tail')
  console.log('- Netlify logs: netlify functions:log')
  console.log('- Queue status: curl ' + RAILWAY_URL + '/queue/status')
}

// Run the test suite
runAllTests().catch(error => {
  console.error('Test suite failed:', error)
  process.exit(1)
})
