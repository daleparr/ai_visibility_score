import { NextRequest, NextResponse } from 'next/server'
import { BulletproofLLMTestAgent } from '../../src/lib/adi/agents/bulletproof-llm-test-agent'
import { SentimentAgent } from '../../src/lib/adi/agents/sentiment-agent'
import { CitationAgent } from '../../src/lib/adi/agents/citation-agent'
import { GeoVisibilityAgent } from '../../src/lib/adi/agents/geo-visibility-agent'
import { CommerceAgent } from '../../src/lib/adi/agents/commerce-agent'
import type { ADIAgentInput } from '../../src/types/adi'

// Backend function for LLM-intensive agents
// Timeout: 60 seconds (much longer than Netlify's 10s limit)
export const config = {
  runtime: 'nodejs',
  maxDuration: 60, // 60 seconds for quality LLM analysis
}

interface BackendAgentRequest {
  agentName: string
  input: ADIAgentInput
  evaluationId: string
}

interface BackendAgentResponse {
  success: boolean
  agentName: string
  result?: any
  error?: string
  executionTime: number
  evaluationId: string
}

export default async function handler(req: NextRequest): Promise<NextResponse> {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const startTime = Date.now()
  
  try {
    const body: BackendAgentRequest = await req.json()
    const { agentName, input, evaluationId } = body

    console.log(`🚀 [Backend] Starting ${agentName} for evaluation ${evaluationId}`)

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
        return NextResponse.json({
          success: false,
          error: `Unknown agent: ${agentName}`,
          agentName,
          executionTime: Date.now() - startTime,
          evaluationId
        } as BackendAgentResponse, { status: 400 })
    }

    // Execute the agent with full timeout allowance
    const result = await agent.executeWithTimeout(input)
    const executionTime = Date.now() - startTime

    console.log(`✅ [Backend] ${agentName} completed in ${executionTime}ms`)

    return NextResponse.json({
      success: true,
      agentName,
      result,
      executionTime,
      evaluationId
    } as BackendAgentResponse)

  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error(`❌ [Backend] Agent execution failed after ${executionTime}ms:`, error)

    return NextResponse.json({
      success: false,
      error: errorMessage,
      agentName: 'unknown',
      executionTime,
      evaluationId: 'unknown'
    } as BackendAgentResponse, { status: 500 })
  }
}
