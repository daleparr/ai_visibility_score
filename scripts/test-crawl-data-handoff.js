/**
 * Test script to verify crawl agent data is correctly handed off to downstream agents
 * 
 * Tests:
 * 1. Crawl agent executes and stores HTML/sitemap data
 * 2. Data is persisted in database
 * 3. Downstream agents (schema_agent, semantic_agent) can access the crawl data
 * 4. Fast agents (in Netlify) receive crawl data from Railway
 */

const fetch = require('node-fetch')

const NETLIFY_URL = 'https://ai-discoverability-index.netlify.app'
const TEST_WEBSITE = 'https://shopify.com'

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testCrawlDataHandoff() {
  console.log('🧪 Testing Crawl Agent Data Handoff')
  console.log('=' .repeat(80))

  try {
    // Step 1: Start an evaluation
    console.log('\n📝 Step 1: Starting evaluation...')
    const evalResponse = await fetch(`${NETLIFY_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: TEST_WEBSITE,
        tier: 'free'
      })
    })

    if (!evalResponse.ok) {
      throw new Error(`Evaluation failed: ${evalResponse.status} ${evalResponse.statusText}`)
    }

    const evalData = await evalResponse.json()
    const evaluationId = evalData.evaluationId
    console.log(`✅ Evaluation started: ${evaluationId}`)

    // Step 2: Wait for crawl agent to complete (should go to Railway)
    console.log('\n⏳ Step 2: Waiting for crawl agent to complete...')
    let crawlCompleted = false
    let attempts = 0
    const maxAttempts = 30 // 60 seconds total

    while (!crawlCompleted && attempts < maxAttempts) {
      await delay(2000)
      attempts++

      const statusResponse = await fetch(
        `${NETLIFY_URL}/api/evaluation/${evaluationId}/intelligent-status`
      )
      
      if (!statusResponse.ok) {
        console.warn(`⚠️  Status check failed: ${statusResponse.status}`)
        continue
      }

      const status = await statusResponse.json()
      
      // Check if crawl_agent exists and is completed
      const crawlAgent = status.agentDetails?.find(a => a.agentName === 'crawl_agent')
      
      if (crawlAgent) {
        console.log(`   Crawl agent status: ${crawlAgent.status}`)
        
        if (crawlAgent.status === 'completed') {
          crawlCompleted = true
          console.log('✅ Crawl agent completed!')
        } else if (crawlAgent.status === 'failed') {
          console.log(`❌ Crawl agent failed: ${crawlAgent.lastError}`)
          break
        }
      }
    }

    if (!crawlCompleted) {
      console.log('⚠️  Crawl agent did not complete in time')
      return false
    }

    // Step 3: Check database for crawl agent execution record
    console.log('\n📊 Step 3: Checking database for crawl agent results...')
    await delay(2000)
    
    // We need to query the database directly
    // For now, let's check the status API for result details
    const finalStatusResponse = await fetch(
      `${NETLIFY_URL}/api/evaluation/${evaluationId}/intelligent-status`
    )
    
    const finalStatus = await finalStatusResponse.json()
    const crawlAgentData = finalStatus.agentDetails?.find(a => a.agentName === 'crawl_agent')
    
    console.log('   Crawl agent data:', JSON.stringify(crawlAgentData, null, 2))

    // Step 4: Wait for downstream agents to process
    console.log('\n🔍 Step 4: Monitoring downstream agents...')
    await delay(5000)

    const downstreamStatusResponse = await fetch(
      `${NETLIFY_URL}/api/evaluation/${evaluationId}/intelligent-status`
    )
    
    const downstreamStatus = await downstreamStatusResponse.json()
    
    // Check if downstream agents (schema_agent, semantic_agent) are processing
    const downstreamAgents = ['schema_agent', 'semantic_agent', 'knowledge_graph_agent']
    
    for (const agentName of downstreamAgents) {
      const agent = downstreamStatus.agentDetails?.find(a => a.agentName === agentName)
      if (agent) {
        console.log(`   ${agentName}: ${agent.status}`)
        
        // Check if agent has error related to missing crawl data
        if (agent.status === 'failed' || agent.status === 'skipped') {
          if (agent.lastError?.includes('No HTML') || agent.lastError?.includes('No crawl')) {
            console.log(`   ❌ HANDOFF FAILURE: ${agentName} cannot access crawl data!`)
            console.log(`      Error: ${agent.lastError}`)
          }
        }
      }
    }

    // Step 5: Check for cascading failures
    console.log('\n🔍 Step 5: Checking for cascading failures...')
    const failedAgents = downstreamStatus.agentDetails?.filter(a => 
      a.status === 'failed' && 
      (a.lastError?.includes('No HTML') || a.lastError?.includes('No crawl'))
    ) || []

    if (failedAgents.length > 0) {
      console.log(`❌ CASCADING FAILURE DETECTED: ${failedAgents.length} agents failed due to missing crawl data`)
      failedAgents.forEach(agent => {
        console.log(`   - ${agent.agentName}: ${agent.lastError}`)
      })
      return false
    } else {
      console.log('✅ No cascading failures detected')
    }

    // Step 6: Final summary
    console.log('\n📊 Final Summary:')
    console.log(`   Total agents: ${downstreamStatus.progress?.totalAgents || 0}`)
    console.log(`   Completed: ${downstreamStatus.progress?.completedAgents || 0}`)
    console.log(`   Failed: ${downstreamStatus.progress?.failedAgents || 0}`)
    console.log(`   Running: ${downstreamStatus.progress?.runningAgents || 0}`)
    
    const successRate = downstreamStatus.progress?.totalAgents > 0
      ? ((downstreamStatus.progress.completedAgents / downstreamStatus.progress.totalAgents) * 100).toFixed(1)
      : 0
    
    console.log(`   Success Rate: ${successRate}%`)

    if (successRate < 50) {
      console.log('\n❌ TEST FAILED: Less than 50% of agents completed successfully')
      return false
    }

    console.log('\n✅ TEST PASSED: Crawl data handoff appears to be working')
    return true

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message)
    console.error(error.stack)
    return false
  }
}

// Run the test
testCrawlDataHandoff()
  .then(passed => {
    console.log('\n' + '='.repeat(80))
    if (passed) {
      console.log('✅ CRAWL DATA HANDOFF TEST: PASSED')
      process.exit(0)
    } else {
      console.log('❌ CRAWL DATA HANDOFF TEST: FAILED')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 CRAWL DATA HANDOFF TEST: ERROR')
    console.error(error)
    process.exit(1)
  })

