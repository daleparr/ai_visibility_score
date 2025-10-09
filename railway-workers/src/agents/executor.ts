import { createLogger } from '../utils/logger'
import { AgentContext, AgentExecutionError } from '../types'
import { AdvancedCrawlAgent } from './advanced-crawl-agent'
import { RealLLMTestAgent } from './real-llm-test-agent'
import { RealSentimentAgent } from './real-sentiment-agent'
import { RealCommerceAgent } from './real-commerce-agent'
import { RealCitationAgent } from './real-citation-agent'
import { RealGeoVisibilityAgent } from './real-geo-visibility-agent'

const logger = createLogger('agent-executor')

interface AgentInterface {
  execute(context: AgentContext): Promise<any>
}

export class AgentExecutor {
  private agents: Map<string, AgentInterface> = new Map()

  constructor() {
    // Initialize REAL agents with LLM API integration
    this.agents.set('crawl_agent', new AdvancedCrawlAgent()) // Advanced crawling with anti-bot features
    this.agents.set('citation_agent', new RealCitationAgent()) // Real citation analysis with Brave Search + LLM
    this.agents.set('commerce_agent', new RealCommerceAgent()) // Real commerce analysis with LLM
    this.agents.set('sentiment_agent', new RealSentimentAgent()) // Real sentiment analysis with LLM
    this.agents.set('llm_test_agent', new RealLLMTestAgent()) // Real LLM testing with GPT-4
    this.agents.set('geo_visibility_agent', new RealGeoVisibilityAgent()) // Real geo visibility with LLM

    logger.info('Agent executor initialized with REAL AGENTS', {
      availableAgents: Array.from(this.agents.keys()),
      realAgents: ['crawl_agent', 'citation_agent', 'commerce_agent', 'sentiment_agent', 'llm_test_agent', 'geo_visibility_agent'],
      note: 'All agents will use real LLM APIs if keys are configured, fallback to heuristics otherwise'
    })
  }

  async executeAgent(agentName: string, context: AgentContext): Promise<any> {
    const startTime = Date.now()
    const initialMemoryUsage = process.memoryUsage()

    logger.info('Starting agent execution', {
      agentName,
      evaluationId: context.evaluationId,
      websiteUrl: context.websiteUrl,
      tier: context.tier
    })

    try {
      const agent = this.agents.get(agentName)
      if (!agent) {
        throw new AgentExecutionError(
          agentName,
          `Unknown agent: ${agentName}. Available agents: ${Array.from(this.agents.keys()).join(', ')}`,
          { context }
        )
      }

      // Execute the agent
      const result = await agent.execute(context)

      const executionTime = Date.now() - startTime
      const finalMemoryUsage = process.memoryUsage()
      const memoryDelta = finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed

      logger.info('Agent execution completed', {
        agentName,
        evaluationId: context.evaluationId,
        executionTime,
        memoryDelta,
        status: result.status
      })

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime,
          memoryDelta,
          completedAt: new Date().toISOString(),
          railwayExecution: true
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      const finalMemoryUsage = process.memoryUsage()

      logger.error('Agent execution failed', {
        agentName,
        evaluationId: context.evaluationId,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })

      throw new AgentExecutionError(
        agentName,
        error instanceof Error ? error.message : String(error),
        {
          context,
          executionTime,
          memoryUsage: finalMemoryUsage,
          originalError: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      )
    }
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys())
  }

  isAgentAvailable(agentName: string): boolean {
    return this.agents.has(agentName)
  }
}
