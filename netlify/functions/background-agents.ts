import { Handler } from '@netlify/functions'
import { SitemapEnhancedCrawlAgent } from '../../src/lib/adi/agents/sitemap-enhanced-crawl-agent'
import { BulletproofLLMTestAgent } from '../../src/lib/adi/agents/bulletproof-llm-test-agent'
import { SentimentAgent } from '../../src/lib/adi/agents/sentiment-agent'
import { CitationAgent } from '../../src/lib/adi/agents/citation-agent'
import { GeoVisibilityAgent } from '../../src/lib/adi/agents/geo-visibility-agent'
import { CommerceAgent } from '../../src/lib/adi/agents/commerce-agent'
import { BackendAgentTracker } from '../../src/lib/adi/backend-agent-tracker'
import type { ADIAgentInput } from '../../src/types/adi'

// Netlify Background Function for LLM-intensive agents
// Timeout: 15 minutes (much longer than regular functions)

interface BackgroundAgentRequest {
  agentName: string
  input: ADIAgentInput
  evaluationId: string
  executionId: string
}

export const handler: Handler = async (event) => {
  const functionStartTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`🌐 [Background-${requestId}] Function invoked with method: ${event.httpMethod}`)
  console.log(`🌐 [Background-${requestId}] Event body length: ${event.body?.length || 0}`)
  console.log(`🌐 [Background-${requestId}] Headers:`, event.headers)
  console.log(`🌐 [Background-${requestId}] Raw body:`, event.body?.substring(0, 500))
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log(`❌ [Background-${requestId}] Method not allowed: ${event.httpMethod}`)
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const startTime = Date.now()
  const tracker = new BackendAgentTracker()
  
  try {
    console.log(`🔍 [Background-${requestId}] Parsing request body...`)
    const body: BackgroundAgentRequest = JSON.parse(event.body || '{}')
    const { agentName, input, evaluationId, executionId } = body

    console.log(`🚀 [Background-${requestId}] Starting ${agentName} for evaluation ${evaluationId} with execution ID ${executionId}`)
    console.log(`🚀 [Background-${requestId}] Input context keys:`, input?.context ? Object.keys(input.context) : 'no context')

    // Mark as running in database
    console.log(`📋 [Background-${requestId}] Marking ${executionId} as running...`)
    await tracker.markRunning(executionId)
    console.log(`📋 [Background-${requestId}] Successfully marked ${executionId} as running`)

    // Initialize the requested agent
    console.log(`🔧 [Background-${requestId}] Initializing agent: ${agentName}`)
    let agent
    switch (agentName) {
      case 'crawl_agent':
        agent = new SitemapEnhancedCrawlAgent()
        break
      case 'llm_test_agent':
        agent = new BulletproofLLMTestAgent()
        break
      case 'sentiment_agent':
        agent = new SentimentAgent()
        break
      case 'citation_agent':
        agent = new CitationAgent()
        break
      case 'geo_visibility_agent':
        agent = new GeoVisibilityAgent()
        break
      case 'commerce_agent':
        agent = new CommerceAgent()
        break
      default:
        console.log(`❌ [Background-${requestId}] Unknown agent: ${agentName}`)
        await tracker.failExecution(executionId, `Unknown agent: ${agentName}`)
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            error: `Unknown agent: ${agentName}`,
            agentName,
            executionTime: Date.now() - startTime,
            evaluationId
          })
        }
    }

    // Execute the agent with full timeout allowance (15 minutes)
    console.log(`⚡ [Background-${requestId}] Executing ${agentName} agent...`)
    const result = await agent.executeWithTimeout(input)
    const executionTime = Date.now() - startTime
    console.log(`⚡ [Background-${requestId}] Agent ${agentName} completed, execution time: ${executionTime}ms`)

    // Mark as completed in database
    console.log(`💾 [Background-${requestId}] Saving completion to database...`)
    await tracker.completeExecution(executionId, result, executionTime)
    console.log(`💾 [Background-${requestId}] Successfully saved completion for ${executionId}`)

    console.log(`✅ [Background-${requestId}] ${agentName} completed in ${executionTime}ms`)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        agentName,
        result,
        executionTime,
        evaluationId
      })
    }

  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error(`❌ [Background-${requestId}] Agent execution failed after ${executionTime}ms:`, error)

    // Mark as failed in database
    try {
      const body = JSON.parse(event.body || '{}')
      if (body.executionId) {
        console.log(`💾 [Background-${requestId}] Marking ${body.executionId} as failed...`)
        await tracker.failExecution(body.executionId, errorMessage)
        console.log(`💾 [Background-${requestId}] Successfully marked ${body.executionId} as failed`)
      }
    } catch (dbError) {
      console.error(`❌ [Background-${requestId}] Failed to update database with error:`, dbError)
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        agentName: 'unknown',
        executionTime,
        evaluationId: 'unknown'
      })
    }
  }
}
