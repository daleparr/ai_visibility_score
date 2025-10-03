import { Handler } from '@netlify/functions'
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
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const startTime = Date.now()
  const tracker = new BackendAgentTracker()
  
  try {
    const body: BackgroundAgentRequest = JSON.parse(event.body || '{}')
    const { agentName, input, evaluationId, executionId } = body

    console.log(`🚀 [Background] Starting ${agentName} for evaluation ${evaluationId}`)

    // Mark as running in database
    await tracker.markRunning(executionId)

    // Initialize the requested agent
    let agent
    switch (agentName) {
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
    const result = await agent.executeWithTimeout(input)
    const executionTime = Date.now() - startTime

    // Mark as completed in database
    await tracker.completeExecution(executionId, result, executionTime)

    console.log(`✅ [Background] ${agentName} completed in ${executionTime}ms`)

    return {
      statusCode: 200,
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
    
    console.error(`❌ [Background] Agent execution failed after ${executionTime}ms:`, error)

    // Mark as failed in database
    try {
      const body = JSON.parse(event.body || '{}')
      if (body.executionId) {
        await tracker.failExecution(body.executionId, errorMessage)
      }
    } catch (dbError) {
      console.error('Failed to update database with error:', dbError)
    }

    return {
      statusCode: 500,
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
