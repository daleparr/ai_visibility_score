/**
 * Progressive Score Calculator
 * 
 * Calculates running ADI scores as agents complete their execution.
 * Provides real-time score updates and confidence levels based on
 * data availability and agent completion status.
 */

export interface ProgressiveScoreUpdate {
  currentScore: number
  confidence: number
  dataCompleteness: string
  completedAgents: number
  totalAgents: number
  estimatedFinalScore: number
  scoreBreakdown: {
    infrastructure: number
    perception: number
    commerce: number
  }
}

export interface AgentWeight {
  weight: number
  pillar: 'infrastructure' | 'perception' | 'commerce'
  importance: 'critical' | 'high' | 'medium' | 'low'
}

export class ProgressiveScoreCalculator {
  private runningScore = 0
  private completedAgents = 0
  private pillarScores = {
    infrastructure: 0,
    perception: 0,
    commerce: 0
  }
  private pillarAgentCounts = {
    infrastructure: 0,
    perception: 0,
    commerce: 0
  }

  /**
   * Agent weights and pillar assignments
   * Based on ADI methodology with pillar distribution:
   * - Infrastructure: 40%
   * - Perception: 40% 
   * - Commerce: 20%
   */
  private readonly agentWeights: Record<string, AgentWeight> = {
    // Infrastructure Pillar (40% total)
    'crawl_agent': { weight: 0.12, pillar: 'infrastructure', importance: 'critical' },
    'schema_agent': { weight: 0.10, pillar: 'infrastructure', importance: 'high' },
    'semantic_agent': { weight: 0.08, pillar: 'infrastructure', importance: 'high' },
    'knowledge_graph_agent': { weight: 0.06, pillar: 'infrastructure', importance: 'medium' },
    'conversational_copy_agent': { weight: 0.04, pillar: 'infrastructure', importance: 'medium' },

    // Perception Pillar (40% total)
    'llm_test_agent': { weight: 0.15, pillar: 'perception', importance: 'critical' },
    'citation_agent': { weight: 0.10, pillar: 'perception', importance: 'high' },
    'sentiment_agent': { weight: 0.08, pillar: 'perception', importance: 'high' },
    'geo_visibility_agent': { weight: 0.07, pillar: 'perception', importance: 'medium' },

    // Commerce Pillar (20% total)
    'commerce_agent': { weight: 0.12, pillar: 'commerce', importance: 'high' },
    'brand_heritage_agent': { weight: 0.08, pillar: 'commerce', importance: 'medium' },

    // Score Aggregator (not included in progressive calculation)
    'score_aggregator': { weight: 0.00, pillar: 'infrastructure', importance: 'critical' }
  }

  private readonly totalAgents = 12

  /**
   * Update score with a completed agent result
   */
  updateScore(agentName: string, agentScore: number): ProgressiveScoreUpdate {
    const agentConfig = this.agentWeights[agentName]
    
    if (!agentConfig) {
      console.warn(`Unknown agent: ${agentName}, using default weight`)
      return this.getCurrentScore()
    }

    // Skip score aggregator in progressive calculation
    if (agentName === 'score_aggregator') {
      return this.getCurrentScore()
    }

    // Validate score
    const validScore = Math.max(0, Math.min(100, agentScore))
    
    // Update running totals
    this.runningScore += validScore * agentConfig.weight
    this.completedAgents++

    // Update pillar scores
    this.pillarScores[agentConfig.pillar] += validScore * (agentConfig.weight / this.getPillarTotalWeight(agentConfig.pillar))
    this.pillarAgentCounts[agentConfig.pillar]++

    console.log(`📊 Progressive Score Update: ${agentName} (${validScore}) -> Current: ${Math.round(this.runningScore)}`)

    return this.getCurrentScore()
  }

  /**
   * Get current score state
   */
  getCurrentScore(): ProgressiveScoreUpdate {
    const completionRatio = this.completedAgents / (this.totalAgents - 1) // Exclude score_aggregator
    const confidence = this.calculateConfidence()
    const estimatedFinal = this.estimateFinalScore()

    return {
      currentScore: Math.round(this.runningScore),
      confidence,
      dataCompleteness: `${this.completedAgents}/${this.totalAgents - 1} agents`,
      completedAgents: this.completedAgents,
      totalAgents: this.totalAgents - 1,
      estimatedFinalScore: estimatedFinal,
      scoreBreakdown: {
        infrastructure: Math.round(this.pillarScores.infrastructure),
        perception: Math.round(this.pillarScores.perception),
        commerce: Math.round(this.pillarScores.commerce)
      }
    }
  }

  /**
   * Calculate confidence based on completion and agent importance
   */
  private calculateConfidence(): number {
    if (this.completedAgents === 0) return 0

    const completionRatio = this.completedAgents / (this.totalAgents - 1)
    
    // Base confidence from completion ratio
    let confidence = completionRatio * 0.7

    // Bonus confidence for critical agents
    const criticalAgents = ['crawl_agent', 'llm_test_agent']
    const completedCritical = criticalAgents.filter(agent => 
      this.hasCompletedAgent(agent)
    ).length
    
    confidence += (completedCritical / criticalAgents.length) * 0.3

    // Penalty for very low completion
    if (this.completedAgents < 3) {
      confidence *= 0.5
    }

    return Math.max(0.1, Math.min(0.95, confidence))
  }

  /**
   * Estimate final score based on current progress
   */
  private estimateFinalScore(): number {
    if (this.completedAgents === 0) return 50 // Default estimate

    const completionRatio = this.completedAgents / (this.totalAgents - 1)
    
    if (completionRatio >= 0.8) {
      // High completion - current score is likely close to final
      return Math.round(this.runningScore)
    }

    // Estimate missing agent scores based on current average
    const currentAverage = this.runningScore / this.getTotalCompletedWeight()
    const missingWeight = 1.0 - this.getTotalCompletedWeight()
    const estimatedMissingScore = currentAverage * missingWeight

    return Math.round(this.runningScore + estimatedMissingScore)
  }

  /**
   * Get total weight of completed agents
   */
  private getTotalCompletedWeight(): number {
    // This would need to track which agents completed
    // For now, estimate based on completion ratio
    const completionRatio = this.completedAgents / (this.totalAgents - 1)
    return completionRatio
  }

  /**
   * Get total weight for a pillar
   */
  private getPillarTotalWeight(pillar: 'infrastructure' | 'perception' | 'commerce'): number {
    return Object.values(this.agentWeights)
      .filter(config => config.pillar === pillar)
      .reduce((sum, config) => sum + config.weight, 0)
  }

  /**
   * Check if an agent has completed (simplified for now)
   */
  private hasCompletedAgent(agentName: string): boolean {
    // This would need to track completed agents
    // For now, assume based on completion count
    return this.completedAgents > 0
  }

  /**
   * Reset calculator for new evaluation
   */
  reset(): void {
    this.runningScore = 0
    this.completedAgents = 0
    this.pillarScores = {
      infrastructure: 0,
      perception: 0,
      commerce: 0
    }
    this.pillarAgentCounts = {
      infrastructure: 0,
      perception: 0,
      commerce: 0
    }
  }

  /**
   * Get agent configuration
   */
  getAgentConfig(agentName: string): AgentWeight | null {
    return this.agentWeights[agentName] || null
  }

  /**
   * Get completion statistics
   */
  getCompletionStats(): {
    total: number
    completed: number
    remaining: number
    criticalCompleted: number
    criticalRemaining: number
  } {
    const criticalAgents = Object.entries(this.agentWeights)
      .filter(([_, config]) => config.importance === 'critical')
      .map(([name, _]) => name)

    return {
      total: this.totalAgents - 1, // Exclude score_aggregator
      completed: this.completedAgents,
      remaining: (this.totalAgents - 1) - this.completedAgents,
      criticalCompleted: criticalAgents.filter(agent => this.hasCompletedAgent(agent)).length,
      criticalRemaining: criticalAgents.length - criticalAgents.filter(agent => this.hasCompletedAgent(agent)).length
    }
  }
}
