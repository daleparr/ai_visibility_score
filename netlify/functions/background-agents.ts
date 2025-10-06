import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import { SitemapEnhancedCrawlAgent } from '../../src/lib/adi/agents/sitemap-enhanced-crawl-agent'
import { BulletproofLLMTestAgent } from '../../src/lib/adi/agents/bulletproof-llm-test-agent'
import { SentimentAgent } from '../../src/lib/adi/agents/sentiment-agent'
import { CitationAgent } from '../../src/lib/adi/agents/citation-agent'
import { GeoVisibilityAgent } from '../../src/lib/adi/agents/geo-visibility-agent'
import { CommerceAgent } from '../../src/lib/adi/agents/commerce-agent'
import { BackendAgentTracker } from '../../src/lib/adi/backend-agent-tracker'
import { withSchema } from '../../src/lib/db'
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

  // Test database connectivity immediately
  console.log(`🔍 [Background-${requestId}] Testing database connectivity...`)
  try {
    await withSchema(async () => {
      const { sql } = await import('../../src/lib/db')
      const testResult = await sql`SELECT 1 as test_connection, current_schema() as current_schema`
      console.log(`✅ [Background-${requestId}] Database connection test successful:`, testResult[0])
    })
  } catch (dbTestError) {
    console.error(`❌ [Background-${requestId}] Database connection test failed:`, dbTestError)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Database connection test failed',
        details: dbTestError instanceof Error ? dbTestError.message : String(dbTestError),
        requestId
      })
    }
  }
  
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
        console.log(`📋 [Background-${requestId}] Execution details: agentName=${agentName}, evaluationId=${evaluationId}, executionId=${executionId}`)
        try {
          await tracker.markRunning(executionId)
          console.log(`📋 [Background-${requestId}] Successfully marked ${executionId} as running`)
          
          // Immediate verification that the update worked
          console.log(`🔍 [Background-${requestId}] Verifying running status was saved...`)
          const runningVerification = await tracker.getExecution(executionId)
          if (runningVerification) {
            console.log(`✅ [Background-${requestId}] Running verification successful: ${runningVerification.status}`)
          } else {
            console.error(`❌ [Background-${requestId}] Running verification failed: execution not found`)
          }
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

        // Mark as completed in database with enhanced verification
        console.log(`💾 [Background-${requestId}] Saving completion to database...`)
        console.log(`💾 [Background-${requestId}] Completion details: executionId=${executionId}, agentName=${agentName}, executionTime=${executionTime}ms`)
        try {
          await tracker.completeExecution(executionId, result, executionTime)
          console.log(`💾 [Background-${requestId}] Successfully saved completion for ${executionId}`)
          
          // Enhanced verification with retry to handle potential database consistency issues
          console.log(`🔍 [Background-${requestId}] Verifying completion was saved...`)
          let verification = await tracker.getExecution(executionId)
          let retryCount = 0
          const maxRetries = 3
          
          console.log(`🔍 [Background-${requestId}] Initial verification result:`, {
            found: !!verification,
            status: verification?.status,
            executionId: verification?.id,
            completedAt: verification?.completedAt,
            evaluationId: verification?.evaluationId,
            agentName: verification?.agentName
          })
          
          while ((!verification || verification.status !== 'completed') && retryCount < maxRetries) {
            console.log(`🔄 [Background-${requestId}] Verification attempt ${retryCount + 1}/${maxRetries}...`)
            await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
            verification = await tracker.getExecution(executionId)
            console.log(`🔄 [Background-${requestId}] Retry ${retryCount + 1} result:`, {
              found: !!verification,
              status: verification?.status,
              executionId: verification?.id,
              completedAt: verification?.completedAt,
              evaluationId: verification?.evaluationId,
              agentName: verification?.agentName
            })
            retryCount++
          }
          
          if (!verification) {
            throw new Error(`Execution ${executionId} not found after completion even after ${maxRetries} retries`)
          }
          if (verification.status !== 'completed') {
            throw new Error(`Execution ${executionId} status is ${verification.status}, expected 'completed' after ${maxRetries} retries`)
          }
          console.log(`✅ [Background-${requestId}] Completion verified after ${retryCount} attempts: ${verification.status}`)
          console.log(`✅ [Background-${requestId}] Final verification details:`, {
            id: verification.id,
            status: verification.status,
            agentName: verification.agentName,
            evaluationId: verification.evaluationId,
            startedAt: verification.startedAt,
            completedAt: verification.completedAt,
            executionTime: verification.executionTime
          })
          
          // Also test if we can find this execution by evaluationId
          console.log(`🔍 [Background-${requestId}] Testing if execution can be found by evaluationId...`)
          const allExecutions = await tracker.getEvaluationExecutions(evaluationId)
          const foundByEvalId = allExecutions.find(e => e.id === executionId)
          if (foundByEvalId) {
            console.log(`✅ [Background-${requestId}] Execution found by evaluationId: ${foundByEvalId.status}`)
          } else {
            console.error(`❌ [Background-${requestId}] Execution NOT found by evaluationId despite individual lookup success`)
            console.error(`❌ [Background-${requestId}] All executions for ${evaluationId}:`, allExecutions.map(e => ({ id: e.id, agentName: e.agentName, status: e.status })))
          }
      
    } catch (completionError) {
      console.error(`❌ [Background-${requestId}] Failed to complete execution ${executionId}:`, completionError)
      console.error(`❌ [Background-${requestId}] Completion error details:`, {
        name: completionError instanceof Error ? completionError.name : 'Unknown',
        message: completionError instanceof Error ? completionError.message : String(completionError),
        executionId,
        agentName,
        evaluationId
      })
      
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Failed to save completion to database',
          details: completionError instanceof Error ? completionError.message : String(completionError),
          agentName,
          executionId,
          evaluationId,
          requestId
        })
      }
    }

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
        evaluationId,
        verificationStatus: 'completed'
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
