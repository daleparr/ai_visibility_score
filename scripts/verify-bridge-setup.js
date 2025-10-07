#!/usr/bin/env node

/**
 * Bridge Setup Verification Script
 * Verifies that both Netlify and Railway are properly configured
 */

const https = require('https')
const http = require('http')

// Configuration
const NETLIFY_URL = process.env.NETLIFY_URL || process.env.URL || 'https://ai-visibility-score.netlify.app'
const RAILWAY_URL = process.env.RAILWAY_API_URL || 'https://aidi-railway-workers.railway.app'

console.log('🔍 AIDI Bridge Setup Verification')
console.log('================================')
console.log(`Netlify URL: ${NETLIFY_URL}`)
console.log(`Railway URL: ${RAILWAY_URL}`)
console.log('')

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const req = client.request(url, options, (res) => {
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
    req.setTimeout(10000, () => reject(new Error('Request timeout')))
    
    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`Testing ${name}...`)
    const response = await makeRequest(url)
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: OK (${response.status})`)
      if (response.data && typeof response.data === 'object') {
        console.log(`   Status: ${response.data.status || 'unknown'}`)
        if (response.data.version) console.log(`   Version: ${response.data.version}`)
        if (response.data.timestamp) console.log(`   Timestamp: ${response.data.timestamp}`)
      }
      return true
    } else {
      console.log(`❌ ${name}: Failed (${response.status})`)
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`)
    return false
  }
}

async function testBridgeEndpoint() {
  try {
    console.log('Testing Netlify Bridge Endpoint...')
    const response = await makeRequest(`${NETLIFY_URL}/api/bridge/enqueue`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    // We expect this to fail with 400 (missing parameters), not 404
    if (response.status === 400 || response.status === 405) {
      console.log('✅ Netlify Bridge Endpoint: Available')
      return true
    } else if (response.status === 404) {
      console.log('❌ Netlify Bridge Endpoint: Not deployed')
      return false
    } else {
      console.log(`⚠️  Netlify Bridge Endpoint: Unexpected response (${response.status})`)
      return false
    }
  } catch (error) {
    console.log(`❌ Netlify Bridge Endpoint: Error - ${error.message}`)
    return false
  }
}

async function testRailwayQueue() {
  try {
    console.log('Testing Railway Queue Status...')
    const response = await makeRequest(`${RAILWAY_URL}/queue/status`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-for-testing'
      }
    })
    
    // We expect 401 (unauthorized), which means the endpoint exists
    if (response.status === 401) {
      console.log('✅ Railway Queue Endpoint: Available (auth required)')
      return true
    } else {
      console.log(`❌ Railway Queue Endpoint: Unexpected response (${response.status})`)
      return false
    }
  } catch (error) {
    console.log(`❌ Railway Queue Endpoint: Error - ${error.message}`)
    return false
  }
}

async function runVerification() {
  console.log('Starting verification tests...\n')
  
  const tests = [
    // Netlify Tests
    { name: 'Netlify Main Site', test: () => testEndpoint('Netlify Main', NETLIFY_URL) },
    { name: 'Netlify Bridge API', test: testBridgeEndpoint },
    
    // Railway Tests  
    { name: 'Railway Health', test: () => testEndpoint('Railway Health', `${RAILWAY_URL}/health`) },
    { name: 'Railway Detailed Health', test: () => testEndpoint('Railway Detailed Health', `${RAILWAY_URL}/health/detailed`) },
    { name: 'Railway Queue', test: testRailwayQueue },
  ]
  
  const results = []
  
  for (const test of tests) {
    const result = await test.test()
    results.push({ name: test.name, passed: result })
    console.log('') // Add spacing
  }
  
  // Summary
  console.log('Verification Summary')
  console.log('===================')
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`)
  })
  
  console.log('')
  console.log(`Results: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! Bridge setup is ready.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.')
    process.exit(1)
  }
}

// Environment variable checks
console.log('Environment Variables Check')
console.log('===========================')

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:')
  missingVars.forEach(varName => console.log(`   - ${varName}`))
  console.log('')
} else {
  console.log('✅ All required environment variables are set')
  console.log('')
}

// Run the verification
runVerification().catch(error => {
  console.error('Verification failed:', error)
  process.exit(1)
})
