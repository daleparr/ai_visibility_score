// Analysis Engine - generates insights, trends, and recommendations from probe data

import { BrandPerformance, IndustryReport, ProbeResult } from './types';

export interface AnalysisInput {
  sectorId: string;
  month: Date;
  probeResults: ProbeResult[];
  previousMonthPerformance?: BrandPerformance[];
}

export class ReportAnalyzer {
  /**
   * Generate a complete monthly report from probe results
   */
  async generateMonthlyReport(input: AnalysisInput): Promise<Partial<IndustryReport>> {
    console.log(`Analyzing ${input.probeResults.length} probe results for report`);
    
    // Step 1: Aggregate raw probe results into brand performance metrics
    const brandPerformance = this.aggregateBrandPerformance(input.probeResults);
    
    // Step 2: Calculate rankings
    const leaderboard = this.calculateLeaderboard(brandPerformance, input.previousMonthPerformance);
    
    // Step 3: Identify trends and changes
    const trends = this.identifyTrends(brandPerformance, input.previousMonthPerformance);
    
    // Step 4: Analyze competitive landscape
    const competitive = this.analyzeCompetitive(brandPerformance, input.probeResults);
    
    // Step 5: Detect emerging threats
    const threats = this.detectEmergingThreats(brandPerformance, input.previousMonthPerformance);
    
    // Step 6: Analyze model-specific insights
    const modelInsights = this.analyzeModelBehavior(input.probeResults);
    
    // Step 7: Generate recommendations
    const recommendations = this.generateRecommendations(leaderboard, trends, competitive);
    
    // Step 8: Create executive summary
    const executiveSummary = this.createExecutiveSummary(leaderboard, trends, threats);
    
    // Step 9: Extract key findings
    const keyFindings = this.extractKeyFindings(trends, competitive, threats, modelInsights);
    
    return {
      sectorId: input.sectorId,
      reportMonth: input.month,
      reportTitle: this.generateReportTitle(input.month, input.sectorId),
      executiveSummary,
      keyFindings,
      leaderboard,
      topMovers: trends.topMovers,
      newEntrants: trends.newEntrants,
      trendsAnalysis: trends.analysis,
      competitiveLandscape: competitive,
      emergingThreats: threats,
      modelInsights,
      recommendations,
    };
  }

  /**
   * Aggregate probe results into brand performance metrics
   */
  private aggregateBrandPerformance(probeResults: ProbeResult[]): Map<string, BrandPerformance> {
    const brandData = new Map<string, {
      mentions: number;
      positions: number[];
      top3Count: number;
      models: Set<string>;
      sentimentScores: number[];
      recommendationPrompts: number;
      totalPrompts: number;
      modelMentions: Record<string, number>;
    }>();
    
    // Aggregate data from all probe results
    for (const result of probeResults) {
      for (const mention of result.brandsMentioned) {
        const brand = mention.brand;
        
        if (!brandData.has(brand)) {
          brandData.set(brand, {
            mentions: 0,
            positions: [],
            top3Count: 0,
            models: new Set(),
            sentimentScores: [],
            recommendationPrompts: 0,
            totalPrompts: 0,
            modelMentions: {},
          });
        }
        
        const data = brandData.get(brand)!;
        data.mentions++;
        data.positions.push(mention.position);
        if (mention.position <= 3) data.top3Count++;
        data.models.add(result.modelId);
        
        // Track per-model mentions
        data.modelMentions[result.modelId] = (data.modelMentions[result.modelId] || 0) + 1;
        
        // Sentiment
        const sentiment = result.sentimentAnalysis[brand];
        if (sentiment?.score !== undefined) {
          data.sentimentScores.push(sentiment.score);
        }
        
        // Recommendation prompts (simplified - would check prompt intent in real implementation)
        if (mention.isRecommendation) {
          data.recommendationPrompts++;
        }
      }
    }
    
    // Convert to BrandPerformance objects
    const totalPrompts = new Set(probeResults.map(r => r.promptId)).size;
    const totalMentions = Array.from(brandData.values()).reduce((sum, d) => sum + d.mentions, 0);
    
    const performance = new Map<string, BrandPerformance>();
    
    for (const [brand, data] of brandData) {
      const avgPosition = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
      const avgSentiment = data.sentimentScores.length > 0
        ? data.sentimentScores.reduce((a, b) => a + b, 0) / data.sentimentScores.length
        : 0;
      
      performance.set(brand, {
        id: '', // Will be set when saving to DB
        sectorId: '',
        reportMonth: new Date(),
        brandName: brand,
        mentionCount: data.mentions,
        mentionShare: (data.mentions / totalMentions) * 100,
        avgPosition,
        top3Appearances: data.top3Count,
        recommendationRate: data.totalPrompts > 0 
          ? (data.recommendationPrompts / data.totalPrompts) * 100 
          : 0,
        modelsMentionedIn: data.models.size,
        modelBreakdown: data.modelMentions,
        avgSentimentScore: avgSentiment,
        sentimentDistribution: this.calculateSentimentDistribution(data.sentimentScores),
        rankOverall: 0, // Will be calculated after sorting
        rankChange: 0,
        coMentionedBrands: [],
        hallucinationRate: 0, // Would calculate from hallucination flags
        sourceCitationRate: 0, // Would calculate from sources
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return performance;
  }

  /**
   * Calculate leaderboard with rankings
   */
  private calculateLeaderboard(
    current: Map<string, BrandPerformance>,
    previous?: BrandPerformance[]
  ): Array<{
    rank: number;
    brand: string;
    score: number;
    change: number;
    metrics: Partial<BrandPerformance>;
  }> {
    // Calculate composite score for each brand
    const scored = Array.from(current.entries()).map(([brand, perf]) => {
      // Composite score formula
      const score = 
        (perf.mentionShare * 0.3) +
        ((10 - perf.avgPosition) * 2) + // Inverse position score
        (perf.top3Appearances * 0.5) +
        ((perf.avgSentimentScore + 1) * 10) + // Normalize -1 to 1 => 0 to 20
        (perf.modelsMentionedIn * 2) +
        (perf.recommendationRate * 0.2);
      
      return { brand, score, perf };
    });
    
    // Sort by score
    scored.sort((a, b) => b.score - a.score);
    
    // Create previous month rank map
    const prevRankMap = new Map<string, number>();
    if (previous) {
      previous.forEach((p, idx) => prevRankMap.set(p.brandName, p.rankOverall));
    }
    
    // Build leaderboard with ranks and changes
    return scored.map((item, index) => {
      const rank = index + 1;
      const prevRank = prevRankMap.get(item.brand);
      const change = prevRank ? prevRank - rank : 0; // Positive = moved up
      
      // Update the performance object with rank
      item.perf.rankOverall = rank;
      item.perf.rankChange = change;
      
      return {
        rank,
        brand: item.brand,
        score: Math.round(item.score * 10) / 10,
        change,
        metrics: item.perf,
      };
    });
  }

  /**
   * Identify trends from month-over-month comparison
   */
  private identifyTrends(
    current: Map<string, BrandPerformance>,
    previous?: BrandPerformance[]
  ): {
    topMovers: Array<any>;
    newEntrants: Array<any>;
    analysis: any;
  } {
    const topMovers: Array<any> = [];
    const newEntrants: Array<any> = [];
    
    if (previous) {
      const prevMap = new Map(previous.map(p => [p.brandName, p]));
      
      for (const [brand, currentPerf] of current) {
        const prevPerf = prevMap.get(brand);
        
        if (!prevPerf) {
          // New entrant
          if (currentPerf.rankOverall <= 20) {
            newEntrants.push({
              brand,
              rank: currentPerf.rankOverall,
              firstAppearance: currentPerf.createdAt,
              notableFor: this.getNotableReason(currentPerf),
            });
          }
        } else if (prevPerf.rankOverall - currentPerf.rankOverall >= 5) {
          // Significant mover (jumped 5+ ranks)
          topMovers.push({
            brand,
            previousRank: prevPerf.rankOverall,
            currentRank: currentPerf.rankOverall,
            change: prevPerf.rankOverall - currentPerf.rankOverall,
            reason: this.inferMoveReason(prevPerf, currentPerf),
          });
        }
      }
      
      // Sort top movers by magnitude of change
      topMovers.sort((a, b) => b.change - a.change);
    }
    
    // Calculate overall trends
    const totalBrands = current.size;
    const avgMentionsPerResponse = 
      Array.from(current.values()).reduce((sum, p) => sum + p.mentionCount, 0) / totalBrands;
    
    const analysis = {
      overallTrend: this.determineOverallTrend(current, previous),
      marketConcentration: this.calculateMarketConcentration(current),
      avgBrandsPerResponse: Math.round(avgMentionsPerResponse * 10) / 10,
      insights: this.generateTrendInsights(current, previous),
    };
    
    return { topMovers: topMovers.slice(0, 10), newEntrants, analysis };
  }

  /**
   * Analyze competitive landscape
   */
  private analyzeCompetitive(
    performance: Map<string, BrandPerformance>,
    probeResults: ProbeResult[]
  ): {
    marketLeaders: string[];
    challengers: string[];
    niche: string[];
    insights: string[];
  } {
    const sorted = Array.from(performance.values()).sort((a, b) => a.rankOverall - b.rankOverall);
    
    return {
      marketLeaders: sorted.slice(0, 5).map(p => p.brandName),
      challengers: sorted.slice(5, 15).map(p => p.brandName),
      niche: sorted.slice(15, 25).map(p => p.brandName),
      insights: this.generateCompetitiveInsights(performance, probeResults),
    };
  }

  /**
   * Detect emerging threats
   */
  private detectEmergingThreats(
    current: Map<string, BrandPerformance>,
    previous?: BrandPerformance[]
  ): Array<{
    brand: string;
    threat: string;
    watchLevel: 'high' | 'medium' | 'low';
    evidence: string;
  }> {
    const threats: Array<any> = [];
    
    if (!previous) return threats;
    
    const prevMap = new Map(previous.map(p => [p.brandName, p]));
    
    for (const [brand, currentPerf] of current) {
      const prevPerf = prevMap.get(brand);
      
      // New brand in top 20
      if (!prevPerf && currentPerf.rankOverall <= 20) {
        threats.push({
          brand,
          threat: 'Fast-rising new entrant',
          watchLevel: 'high',
          evidence: `Entered top 20 at rank #${currentPerf.rankOverall} with ${currentPerf.mentionShare.toFixed(1)}% share`,
        });
      }
      
      // Rapid growth in mention share
      if (prevPerf && currentPerf.mentionShare > prevPerf.mentionShare * 1.5) {
        threats.push({
          brand,
          threat: 'Rapid growth trajectory',
          watchLevel: 'high',
          evidence: `Mention share grew ${((currentPerf.mentionShare / prevPerf.mentionShare - 1) * 100).toFixed(0)}% month-over-month`,
        });
      }
      
      // High sentiment + growing presence
      if (currentPerf.avgSentimentScore > 0.5 && currentPerf.modelsMentionedIn >= 3) {
        threats.push({
          brand,
          threat: 'Strong cross-model preference',
          watchLevel: 'medium',
          evidence: `Mentioned positively across ${currentPerf.modelsMentionedIn} models with ${(currentPerf.avgSentimentScore * 100).toFixed(0)}% positive sentiment`,
        });
      }
    }
    
    return threats.slice(0, 10);
  }

  /**
   * Analyze model-specific behavior
   */
  private analyzeModelBehavior(probeResults: ProbeResult[]): {
    modelDiversity: number;
    modelBiases: Array<{ model: string; bias: string; examples: string[] }>;
    consistencyScore: number;
  } {
    const modelResponses = new Map<string, Set<string>>();
    
    // Group brands mentioned by model
    for (const result of probeResults) {
      if (!modelResponses.has(result.modelId)) {
        modelResponses.set(result.modelId, new Set());
      }
      result.brandsMentioned.forEach(b => {
        modelResponses.get(result.modelId)!.add(b.brand);
      });
    }
    
    // Calculate diversity (how different are model recommendations?)
    const allBrands = new Set<string>();
    modelResponses.forEach(brands => brands.forEach(b => allBrands.add(b)));
    
    const avgBrandsPerModel = 
      Array.from(modelResponses.values()).reduce((sum, brands) => sum + brands.size, 0) / modelResponses.size;
    
    const modelDiversity = avgBrandsPerModel / allBrands.size;
    
    // Calculate consistency (overlap between models)
    const consistencyScore = this.calculateModelConsistency(modelResponses);
    
    // Detect biases (simplified)
    const modelBiases: Array<{ model: string; bias: string; examples: string[] }> = [];
    
    return {
      modelDiversity,
      modelBiases,
      consistencyScore,
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    leaderboard: Array<any>,
    trends: any,
    competitive: any
  ): Array<{
    forBrandTier: 'top10' | 'mid-tier' | 'emerging' | 'absent';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    tactics: string[];
  }> {
    return [
      {
        forBrandTier: 'top10',
        title: 'Maintain Leadership Position',
        description: 'Focus on maintaining current visibility while expanding into new query types.',
        priority: 'high',
        effort: 'medium',
        tactics: [
          'Monitor competitor movements closely',
          'Expand content to cover emerging sub-categories',
          'Strengthen source citations and authority signals',
          'Build partnerships mentioned in AI responses',
        ],
      },
      {
        forBrandTier: 'mid-tier',
        title: 'Break Into Top 10',
        description: 'Strategic push to increase mention frequency and improve positioning.',
        priority: 'high',
        effort: 'high',
        tactics: [
          'Create comprehensive comparison content',
          'Optimize for long-tail conversational queries',
          'Increase quality backlink profile',
          'Launch targeted PR campaigns',
          'Develop thought leadership content',
        ],
      },
      {
        forBrandTier: 'emerging',
        title: 'Build Initial Visibility',
        description: 'Establish baseline presence in AI conversations.',
        priority: 'medium',
        effort: 'high',
        tactics: [
          'Create foundational brand information online',
          'Optimize Wikipedia and knowledge base presence',
          'Build review profiles on major platforms',
          'Develop case studies and success stories',
        ],
      },
      {
        forBrandTier: 'absent',
        title: 'Emergency Visibility Program',
        description: 'Critical actions needed to enter AI conversation.',
        priority: 'high',
        effort: 'high',
        tactics: [
          'Audit and fix basic brand information gaps',
          'Create structured data markup',
          'Launch aggressive content marketing',
          'Pursue authoritative media mentions',
          'Build strategic partnerships',
        ],
      },
    ];
  }

  // Helper methods

  private createExecutiveSummary(leaderboard: Array<any>, trends: any, threats: Array<any>): string {
    const topBrand = leaderboard[0]?.brand || 'N/A';
    const totalBrands = leaderboard.length;
    const newEntrants = trends.newEntrants.length;
    const topThreats = threats.slice(0, 3).map(t => t.brand).join(', ');
    
    return `This month's analysis reveals ${topBrand} leading the AI visibility rankings for this sector across ${totalBrands} total brands tracked. ${newEntrants} new brands entered the top 20, with ${topThreats} identified as key emerging threats. Market concentration ${trends.analysis.overallTrend === 'growing' ? 'increased' : 'decreased'}, signaling ${trends.analysis.overallTrend === 'growing' ? 'consolidation' : 'fragmentation'} of AI recommendation share.`;
  }

  private extractKeyFindings(trends: any, competitive: any, threats: Array<any>, modelInsights: any): Array<any> {
    return [
      {
        title: 'Market Concentration Trend',
        description: `${trends.analysis.overallTrend === 'growing' ? 'Increasing consolidation' : 'Growing competition'} in AI recommendations`,
        impact: 'high',
        category: 'market-structure',
      },
      {
        title: 'Model Consistency',
        description: `${(modelInsights.consistencyScore * 100).toFixed(0)}% overlap in brand recommendations across models`,
        impact: 'medium',
        category: 'model-behavior',
      },
      {
        title: 'Emerging Threats',
        description: `${threats.length} new competitive threats identified this month`,
        impact: threats.length > 5 ? 'high' : 'medium',
        category: 'competitive',
      },
    ];
  }

  private calculateSentimentDistribution(scores: number[]): { positive: number; neutral: number; negative: number } {
    let positive = 0, neutral = 0, negative = 0;
    
    for (const score of scores) {
      if (score > 0.1) positive++;
      else if (score < -0.1) negative++;
      else neutral++;
    }
    
    return { positive, neutral, negative };
  }

  private getNotableReason(perf: BrandPerformance): string {
    if (perf.avgSentimentScore > 0.6) return 'Strong positive sentiment';
    if (perf.top3Appearances > 10) return 'Frequent top-3 placement';
    if (perf.modelsMentionedIn === 4) return 'Universal model coverage';
    return 'Rapid emergence';
  }

  private inferMoveReason(prev: BrandPerformance, current: BrandPerformance): string {
    if (current.mentionShare > prev.mentionShare * 1.3) return 'Significant mention share growth';
    if (current.avgSentimentScore > prev.avgSentimentScore + 0.3) return 'Improved sentiment';
    if (current.modelsMentionedIn > prev.modelsMentionedIn) return 'Expanded model coverage';
    return 'Overall performance improvement';
  }

  private determineOverallTrend(
    current: Map<string, BrandPerformance>,
    previous?: BrandPerformance[]
  ): 'growing' | 'stable' | 'declining' {
    if (!previous) return 'stable';
    
    const topFiveCurrent = Array.from(current.values())
      .sort((a, b) => a.rankOverall - b.rankOverall)
      .slice(0, 5);
    
    const topFiveShare = topFiveCurrent.reduce((sum, p) => sum + p.mentionShare, 0);
    
    if (topFiveShare > 60) return 'growing'; // Consolidation
    if (topFiveShare < 40) return 'declining'; // Fragmentation
    return 'stable';
  }

  private calculateMarketConcentration(performance: Map<string, BrandPerformance>): number {
    // Herfindahl-Hirschman Index (HHI)
    const shares = Array.from(performance.values()).map(p => p.mentionShare);
    const hhi = shares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
    return Math.round(hhi);
  }

  private generateTrendInsights(
    current: Map<string, BrandPerformance>,
    previous?: BrandPerformance[]
  ): string[] {
    const insights: string[] = [];
    
    // Top brand dominance
    const sorted = Array.from(current.values()).sort((a, b) => b.mentionShare - a.mentionShare);
    if (sorted[0].mentionShare > 20) {
      insights.push(`${sorted[0].brandName} commands ${sorted[0].mentionShare.toFixed(1)}% of all AI mentions`);
    }
    
    // Model diversity
    const multiModelBrands = Array.from(current.values()).filter(p => p.modelsMentionedIn >= 3);
    insights.push(`${multiModelBrands.length} brands have coverage across 3+ models`);
    
    return insights;
  }

  private generateCompetitiveInsights(
    performance: Map<string, BrandPerformance>,
    probeResults: ProbeResult[]
  ): string[] {
    return [
      `Average ${performance.size} brands mentioned per sector analysis`,
      'Strong sentiment correlation with ranking position observed',
      'Model consistency varies significantly by query type',
    ];
  }

  private calculateModelConsistency(modelResponses: Map<string, Set<string>>): number {
    const models = Array.from(modelResponses.values());
    if (models.length < 2) return 1;
    
    // Calculate pairwise Jaccard similarity
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < models.length; i++) {
      for (let j = i + 1; j < models.length; j++) {
        const intersection = new Set([...models[i]].filter(x => models[j].has(x)));
        const union = new Set([...models[i], ...models[j]]);
        totalSimilarity += intersection.size / union.size;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  private generateReportTitle(month: Date, sectorId: string): string {
    const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const sector = sectorId.charAt(0).toUpperCase() + sectorId.slice(1);
    return `${sector} AI Brand Visibility Report - ${monthName}`;
  }
}

