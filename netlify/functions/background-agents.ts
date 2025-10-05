import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
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

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const functionStartTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`🌐 [Background-${requestId}] Function invoked at ${new Date().toISOString()}`)
  console.log(`🌐 [Background-${requestId}] Method: ${event.httpMethod}`)
  console.log(`🌐 [Background-${requestId}] Headers:`, JSON.stringify(event.headers, null, 2))
  console.log(`🌐 [Background-${requestId}] Body length: ${event.body?.length || 0}`)
  console.log(`🌐 [Background-${requestId}] Raw body preview:`, event.body?.substring(0, 500))
  console.log(`🌐 [Background-${requestId}] Environment check:`, {
    NODE_ENV: process.env.NODE_ENV,
    NETLIFY: process.env.NETLIFY,
    CONTEXT: process.env.CONTEXT,
    hasDatabase: !!process.env.DATABASE_URL || !!process.env.NEON_DATABASE_URL
  })
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log(`❌ [Background-${requestId}] Method not allowed: ${event.httpMethod}`)
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Method not allowed',
        allowed: ['POST'],
        received: event.httpMethod
      })
    }
  }

  const startTime = Date.now()
  const tracker = new BackendAgentTracker()
  
  try {
    console.log(`🔍 [Background-${requestId}] Parsing request body...`)
    
    if (!event.body) {
      console.error(`❌ [Background-${requestId}] No request body provided`)
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Request body is required',
          requestId
        })
      }
    }
    
    const body: BackgroundAgentRequest = JSON.parse(event.body)
    const { agentName, input, evaluationId, executionId } = body

    console.log(`🚀 [Background-${requestId}] Parsed request:`, {
      agentName,
      evaluationId,
      executionId,
      hasInput: !!input,
      inputKeys: input ? Object.keys(input) : [],
      contextKeys: input?.context ? Object.keys(input.context) : []
    })

    // Validate required fields
    if (!agentName || !evaluationId || !executionId) {
      console.error(`❌ [Background-${requestId}] Missing required fields:`, {
        hasAgentName: !!agentName,
        hasEvaluationId: !!evaluationId,
        hasExecutionId: !!executionId
      })
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing required fields: agentName, evaluationId, executionId',
          received: { agentName: !!agentName, evaluationId: !!evaluationId, executionId: !!executionId },
          requestId
        })
      }
    }

    // Mark as running in database
    console.log(`📋 [Background-${requestId}] Marking ${executionId} as running...`)
    try {
      await tracker.markRunning(executionId)
      console.log(`📋 [Background-${requestId}] Successfully marked ${executionId} as running`)
    } catch (dbError) {
      console.error(`❌ [Background-${requestId}] Failed to mark ${executionId} as running:`, dbError)
      console.error(`❌ [Background-${requestId}] Database error details:`, {
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : String(dbError),
        executionId,
        evaluationId
      })
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Failed to update execution status in database',
          details: dbError instanceof Error ? dbError.message : String(dbError),
          agentName,
          executionId,
          evaluationId,
          requestId
        })
      }
    }

    // Initialize the requested agent
    console.log(`🔧 [Background-${requestId}] Initializing agent: ${agentName}`)
    let agent
    switch (agentName) {
      case 'crawl_agent':
        console.log(`🔧 [Background-${requestId}] Creating SitemapEnhancedCrawlAgent...`)
        agent = new SitemapEnhancedCrawlAgent()
        break
      case 'llm_test_agent':
        console.log(`🔧 [Background-${requestId}] Creating BulletproofLLMTestAgent...`)
        agent = new BulletproofLLMTestAgent()
        break
      case 'sentiment_agent':
        console.log(`🔧 [Background-${requestId}] Creating SentimentAgent...`)
        agent = new SentimentAgent()
        break
      case 'citation_agent':
        console.log(`🔧 [Background-${requestId}] Creating CitationAgent...`)
        agent = new CitationAgent()
        break
      case 'geo_visibility_agent':
        console.log(`🔧 [Background-${requestId}] Creating GeoVisibilityAgent...`)
        agent = new GeoVisibilityAgent()
        break
      case 'commerce_agent':
        console.log(`🔧 [Background-${requestId}] Creating CommerceAgent...`)
        agent = new CommerceAgent()
        break
      default:
        console.error(`❌ [Background-${requestId}] Unknown agent: ${agentName}`)
        console.error(`❌ [Background-${requestId}] Available agents: crawl_agent, llm_test_agent, sentiment_agent, citation_agent, geo_visibility_agent, commerce_agent`)
        
        try {
          await tracker.failExecution(executionId, `Unknown agent: ${agentName}`)
          console.log(`📋 [Background-${requestId}] Marked ${executionId} as failed due to unknown agent`)
        } catch (failError) {
          console.error(`❌ [Background-${requestId}] Failed to mark execution as failed:`, failError)
        }
        
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            error: `Unknown agent: ${agentName}`,
            availableAgents: ['crawl_agent', 'llm_test_agent', 'sentiment_agent', 'citation_agent', 'geo_visibility_agent', 'commerce_agent'],
            agentName,
            executionTime: Date.now() - startTime,
            evaluationId,
            requestId
          })
        }
    }
    
    console.log(`✅ [Background-${requestId}] Successfully initialized ${agentName} agent`)

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
