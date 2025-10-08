import { createLogger } from '../utils/logger'
import { AgentContext, AgentExecutionError } from '../types'
import { AdvancedCrawlAgent } from './advanced-crawl-agent'

const logger = createLogger('agent-executor')

interface AgentInterface {
  execute(context: AgentContext): Promise<any>
}

class PlaceholderAgent implements AgentInterface {
  constructor(private agentName: string) {}

  async execute(context: AgentContext): Promise<any> {
    logger.info(`Executing placeholder agent: ${this.agentName}`, {
      evaluationId: context.evaluationId,
      websiteUrl: context.websiteUrl
    })

    // Simulate agent processing time
    const processingTime = Math.random() * 5000 + 2000 // 2-7 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime))

    if (this.agentName === 'citation_agent') {
      return {
        agentName: this.agentName,
        status: 'completed',
        results: [
          {
            resultType: 'citation_analysis',
            rawValue: 75,
            normalizedScore: 75,
            confidenceLevel: 0.8,
            evidence: {
              websiteUrl: context.websiteUrl,
              citationSources: ['example.com', 'news.com'],
              authorityScore: 75,
              reasoning: 'Found moderate citation presence'
            }
          }
        ],
        executionTime: processingTime,
        metadata: {
          placeholder: true,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Default response for other agents
    return {
      agentName: this.agentName,
      status: 'completed',
      results: [
        {
          resultType: `${this.agentName}_analysis`,
          rawValue: Math.floor(Math.random() * 40) + 60, // Random score 60-100
          normalizedScore: Math.floor(Math.random() * 40) + 60,
          confidenceLevel: 0.7,
          evidence: {
            websiteUrl: context.websiteUrl,
            reasoning: `Placeholder analysis for ${this.agentName}`,
            placeholder: true
          }
        }
      ],
      executionTime: processingTime,
      metadata: {
        placeholder: true,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export class AgentExecutor {
  private agents: Map<string, AgentInterface> = new Map()

  constructor() {
    // Initialize advanced and placeholder agents
    this.agents.set('crawl_agent', new AdvancedCrawlAgent()) // Advanced implementation with anti-bot features
    this.agents.set('citation_agent', new PlaceholderAgent('citation_agent'))
    this.agents.set('commerce_agent', new PlaceholderAgent('commerce_agent'))
    this.agents.set('sentiment_agent', new PlaceholderAgent('sentiment_agent'))
    this.agents.set('llm_test_agent', new PlaceholderAgent('llm_test_agent'))
    this.agents.set('geo_visibility_agent', new PlaceholderAgent('geo_visibility_agent'))

    logger.info('Agent executor initialized', {
      availableAgents: Array.from(this.agents.keys()),
      advancedAgents: ['crawl_agent'],
      placeholderAgents: ['citation_agent', 'commerce_agent', 'sentiment_agent', 'llm_test_agent', 'geo_visibility_agent']
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
