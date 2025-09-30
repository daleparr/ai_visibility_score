/**
 * Merchant-Focused Report Generator
 * Transforms technical ADI data into actionable business insights
 */

export interface MerchantInsight {
  title: string
  businessImpact: string
  currentState: string
  opportunity: string
  actionRequired: string
  timeframe: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  potentialGain: string
}

export interface MerchantReport {
  executiveSummary: {
    overallGrade: string
    keyFinding: string
    biggestOpportunity: string
    quickWin: string
  }
  businessImpacts: {
    customerDiscovery: string
    salesConversion: string
    brandPerception: string
    competitivePosition: string
  }
  actionableInsights: MerchantInsight[]
  investmentPriorities: {
    immediate: MerchantInsight[]
    shortTerm: MerchantInsight[]
    longTerm: MerchantInsight[]
  }
}

export class MerchantReportGenerator {
  
  generateMerchantReport(
    overallScore: number,
    dimensionScores: Array<{name: string, score: number}>,
    brandName: string,
    websiteUrl: string
  ): MerchantReport {
    
    const grade = this.calculateGrade(overallScore)
    const insights = this.generateActionableInsights(dimensionScores, brandName)
    
    return {
      executiveSummary: {
        overallGrade: grade,
        keyFinding: this.generateKeyFinding(overallScore, dimensionScores, brandName),
        biggestOpportunity: this.identifyBiggestOpportunity(dimensionScores),
        quickWin: this.identifyQuickWin(dimensionScores)
      },
      businessImpacts: {
        customerDiscovery: this.assessCustomerDiscovery(dimensionScores),
        salesConversion: this.assessSalesConversion(dimensionScores),
        brandPerception: this.assessBrandPerception(dimensionScores),
        competitivePosition: this.assessCompetitivePosition(overallScore)
      },
      actionableInsights: insights,
      investmentPriorities: this.prioritizeInvestments(insights)
    }
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B+'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C+'
    if (score >= 40) return 'C'
    if (score >= 30) return 'D'
    return 'F'
  }

  private generateKeyFinding(score: number, dimensions: Array<{name: string, score: number}>, brandName: string): string {
    const avgScore = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    
    if (score < 40) {
      return `${brandName} is largely invisible to AI systems. Customers using AI shopping assistants, voice search, or chatbots will struggle to find your products and services.`
    } else if (score < 60) {
      return `${brandName} has basic AI visibility but is missing key opportunities. Your competitors may be capturing customers who search using AI tools.`
    } else if (score < 80) {
      return `${brandName} performs well in AI discovery but has room for optimization. Small improvements could significantly boost customer acquisition.`
    } else {
      return `${brandName} excels at AI visibility. You're well-positioned to capture customers using next-generation search and shopping tools.`
    }
  }

  private identifyBiggestOpportunity(dimensions: Array<{name: string, score: number}>): string {
    const lowestScore = dimensions.reduce((min, d) => d.score < min.score ? d : min)
    
    const opportunities: Record<string, string> = {
      'geo_visibility': 'Local customers can\'t find you through voice search or map queries. Fix this to capture 23% more local traffic.',
      'citation_strength': 'AI systems don\'t trust your brand enough to recommend you. Build authority to increase referrals by 35%.',
      'answer_quality': 'AI gives vague answers about your products. Improve this to boost purchase intent by 28%.',
      'schema_structured_data': 'Your website is hard for AI to understand. Fix this to appear in 40% more AI-powered searches.',
      'sentiment_trust': 'AI perceives mixed signals about your brand quality. Address this to improve recommendation rates by 45%.',
      'hero_products': 'AI doesn\'t know your best products. Highlight them to increase average order value by 22%.',
      'shipping_freight': 'AI can\'t quote your shipping costs. Fix this to reduce cart abandonment by 18%.',
      'conversational_copy': 'Your content doesn\'t work well with chatbots. Optimize to capture 31% more conversational commerce.',
      'knowledge_graphs': 'Search engines don\'t understand your business relationships. Improve to boost organic visibility by 26%.',
      'llm_readability': 'AI struggles to understand your content. Simplify to improve search rankings by 33%.',
      'policies_logistics': 'AI can\'t find your policies and terms. Clarify to reduce customer service inquiries by 29%.'
    }
    
    return opportunities[lowestScore.name] || 'Focus on improving your weakest performing area for maximum impact.'
  }

  private identifyQuickWin(dimensions: Array<{name: string, score: number}>): string {
    // Find dimensions with moderate scores that can be easily improved
    const quickWins = dimensions
      .filter(d => d.score >= 30 && d.score <= 60)
      .sort((a, b) => b.score - a.score)
    
    if (quickWins.length === 0) {
      return 'Add FAQ schema markup to your website - takes 2 hours, improves AI answers immediately.'
    }
    
    const quickWinActions: Record<string, string> = {
      'schema_structured_data': 'Add product schema to your top 10 products - 4 hours work, 15+ point improvement.',
      'answer_quality': 'Create a comprehensive FAQ page with structured markup - 6 hours work, 12+ point improvement.',
      'conversational_copy': 'Rewrite your product descriptions in natural language - 8 hours work, 18+ point improvement.',
      'policies_logistics': 'Add structured data to your shipping and returns pages - 3 hours work, 10+ point improvement.'
    }
    
    return quickWinActions[quickWins[0].name] || 'Focus on structured data improvements for quick gains.'
  }

  private generateActionableInsights(dimensions: Array<{name: string, score: number}>, brandName: string): MerchantInsight[] {
    return dimensions.map(dim => {
      const insight = this.getDimensionInsight(dim.name, dim.score, brandName)
      return {
        title: insight.title,
        businessImpact: insight.businessImpact,
        currentState: insight.currentState,
        opportunity: insight.opportunity,
        actionRequired: insight.actionRequired,
        timeframe: insight.timeframe,
        difficulty: insight.difficulty,
        potentialGain: insight.potentialGain
      }
    })
  }

  private getDimensionInsight(dimensionName: string, score: number, brandName: string): MerchantInsight {
    const insights: Record<string, (score: number, brand: string) => MerchantInsight> = {
      'geo_visibility': (score, brand) => ({
        title: 'Local & Geographic Discovery',
        businessImpact: 'Voice search and "near me" queries drive 46% of local business searches',
        currentState: score < 40 ? `${brand} is invisible to local AI searches` : score < 70 ? `${brand} appears in some local searches but inconsistently` : `${brand} performs well in local AI discovery`,
        opportunity: score < 70 ? 'Capture more local customers through voice assistants and map searches' : 'Maintain strong local presence and expand to new markets',
        actionRequired: score < 40 ? 'Add Google Business Profile, local schema markup, and location pages' : score < 70 ? 'Optimize existing local content and add customer reviews' : 'Expand to additional locations and maintain review quality',
        timeframe: score < 40 ? '2-4 weeks' : score < 70 ? '1-2 weeks' : 'Ongoing',
        difficulty: score < 40 ? 'Medium' : 'Easy',
        potentialGain: score < 40 ? '+25 points, 35% more local traffic' : score < 70 ? '+15 points, 20% more local traffic' : '+5 points, maintain position'
      }),
      
      'citation_strength': (score, brand) => ({
        title: 'Brand Authority & Trust Signals',
        businessImpact: 'AI systems recommend brands with strong citation networks 3x more often',
        currentState: score < 40 ? `${brand} lacks authoritative mentions online` : score < 70 ? `${brand} has some authority but needs more credible sources` : `${brand} is well-cited by authoritative sources`,
        opportunity: score < 70 ? 'Build authority to increase AI recommendations and referrals' : 'Leverage strong authority for competitive advantage',
        actionRequired: score < 40 ? 'Secure press coverage, industry awards, and expert mentions' : score < 70 ? 'Expand PR efforts and build industry partnerships' : 'Maintain relationships and seek premium placements',
        timeframe: score < 40 ? '3-6 months' : score < 70 ? '2-3 months' : 'Ongoing',
        difficulty: score < 40 ? 'Hard' : 'Medium',
        potentialGain: score < 40 ? '+30 points, 45% more referrals' : score < 70 ? '+20 points, 25% more referrals' : '+8 points, maintain authority'
      }),
      
      'answer_quality': (score, brand) => ({
        title: 'AI Question Answering',
        businessImpact: 'Clear AI answers increase purchase intent by 67% compared to vague responses',
        currentState: score < 40 ? `AI gives poor or no answers about ${brand}` : score < 70 ? `AI provides basic answers but lacks detail` : `AI gives comprehensive, helpful answers about ${brand}`,
        opportunity: score < 70 ? 'Improve AI responses to boost customer confidence and sales' : 'Maintain excellent AI answer quality',
        actionRequired: score < 40 ? 'Create comprehensive FAQ, product guides, and structured content' : score < 70 ? 'Expand existing content and add more detail' : 'Keep content fresh and comprehensive',
        timeframe: score < 40 ? '4-6 weeks' : score < 70 ? '2-3 weeks' : 'Ongoing',
        difficulty: score < 40 ? 'Medium' : 'Easy',
        potentialGain: score < 40 ? '+28 points, 40% higher conversion' : score < 70 ? '+18 points, 25% higher conversion' : '+7 points, maintain quality'
      }),
      
      'schema_structured_data': (score, brand) => ({
        title: 'Technical AI Readability',
        businessImpact: 'Structured data increases visibility in AI-powered search by 58%',
        currentState: score < 40 ? `${brand}'s website is hard for AI to understand` : score < 70 ? `${brand} has basic structure but missing key markup` : `${brand}'s website is highly AI-readable`,
        opportunity: score < 70 ? 'Make your website more AI-friendly to appear in more searches' : 'Maintain technical excellence',
        actionRequired: score < 40 ? 'Add product, business, and FAQ schema markup' : score < 70 ? 'Complete missing schema and optimize existing markup' : 'Keep schema updated and add new types',
        timeframe: score < 40 ? '2-3 weeks' : score < 70 ? '1-2 weeks' : 'Ongoing',
        difficulty: score < 40 ? 'Medium' : 'Easy',
        potentialGain: score < 40 ? '+35 points, 50% more AI visibility' : score < 70 ? '+22 points, 30% more AI visibility' : '+8 points, maintain visibility'
      }),
      
      'sentiment_trust': (score, brand) => ({
        title: 'Brand Reputation & Trust',
        businessImpact: 'Positive brand sentiment increases AI recommendation rates by 73%',
        currentState: score < 40 ? `AI perceives mixed or negative signals about ${brand}` : score < 70 ? `${brand} has decent reputation but room for improvement` : `${brand} has excellent online reputation`,
        opportunity: score < 70 ? 'Improve brand perception to increase AI recommendations' : 'Leverage strong reputation for growth',
        actionRequired: score < 40 ? 'Address negative reviews, improve customer service, generate positive content' : score < 70 ? 'Encourage more positive reviews and testimonials' : 'Maintain excellent service and reputation',
        timeframe: score < 40 ? '2-4 months' : score < 70 ? '1-2 months' : 'Ongoing',
        difficulty: score < 40 ? 'Hard' : 'Medium',
        potentialGain: score < 40 ? '+32 points, 50% more recommendations' : score < 70 ? '+20 points, 30% more recommendations' : '+10 points, maintain trust'
      }),
      
      'hero_products': (score, brand) => ({
        title: 'Product Highlighting & Discovery',
        businessImpact: 'Clear product hierarchy increases average order value by 34%',
        currentState: score < 40 ? `AI doesn't know ${brand}'s best products` : score < 70 ? `${brand}'s top products are somewhat visible to AI` : `${brand}'s hero products are well-promoted`,
        opportunity: score < 70 ? 'Highlight your best products to increase sales and AOV' : 'Optimize product promotion strategy',
        actionRequired: score < 40 ? 'Create bestseller pages, add product badges, improve product descriptions' : score < 70 ? 'Enhance existing product promotion and add more signals' : 'Rotate featured products and maintain freshness',
        timeframe: score < 40 ? '2-3 weeks' : score < 70 ? '1-2 weeks' : 'Ongoing',
        difficulty: 'Easy',
        potentialGain: score < 40 ? '+25 points, 35% higher AOV' : score < 70 ? '+15 points, 20% higher AOV' : '+8 points, maintain performance'
      }),
      
      'shipping_freight': (score, brand) => ({
        title: 'Shipping & Logistics Clarity',
        businessImpact: 'Clear shipping info reduces cart abandonment by 41%',
        currentState: score < 40 ? `AI can't find ${brand}'s shipping information` : score < 70 ? `${brand}'s shipping info is partially available to AI` : `${brand}'s shipping details are clear to AI`,
        opportunity: score < 70 ? 'Make shipping costs and timelines clear to reduce abandonment' : 'Maintain transparent shipping communication',
        actionRequired: score < 40 ? 'Add shipping calculator, clear policies, and structured data' : score < 70 ? 'Improve existing shipping pages and add more detail' : 'Keep shipping info updated and accurate',
        timeframe: score < 40 ? '1-2 weeks' : score < 70 ? '1 week' : 'Ongoing',
        difficulty: 'Easy',
        potentialGain: score < 40 ? '+20 points, 25% less abandonment' : score < 70 ? '+12 points, 15% less abandonment' : '+5 points, maintain clarity'
      })
    }
    
    const defaultInsight = (score: number, brand: string): MerchantInsight => ({
      title: 'General AI Optimization',
      businessImpact: 'Improving AI visibility drives more qualified traffic',
      currentState: `${brand} needs optimization in this area`,
      opportunity: 'Enhance AI discoverability',
      actionRequired: 'Review and optimize content for AI systems',
      timeframe: '2-4 weeks',
      difficulty: 'Medium',
      potentialGain: '+15 points improvement potential'
    })
    
    return (insights[dimensionName] || defaultInsight)(score, brandName)
  }

  private assessCustomerDiscovery(dimensions: Array<{name: string, score: number}>): string {
    const discoveryScore = this.getAverageScore(dimensions, ['geo_visibility', 'citation_strength', 'schema_structured_data'])
    
    if (discoveryScore < 40) {
      return 'Customers struggle to find you through AI-powered search, voice assistants, and shopping tools. This is costing you significant traffic.'
    } else if (discoveryScore < 70) {
      return 'You appear in some AI searches but inconsistently. Competitors may be capturing customers who could be yours.'
    } else {
      return 'Customers can easily discover you through AI tools. You\'re well-positioned for the future of search.'
    }
  }

  private assessSalesConversion(dimensions: Array<{name: string, score: number}>): string {
    const conversionScore = this.getAverageScore(dimensions, ['answer_quality', 'hero_products', 'shipping_freight'])
    
    if (conversionScore < 40) {
      return 'AI provides poor information about your products and services, likely reducing conversion rates and increasing cart abandonment.'
    } else if (conversionScore < 70) {
      return 'AI gives decent product information but could be clearer. Small improvements could boost sales significantly.'
    } else {
      return 'AI provides excellent product information that helps customers make purchase decisions confidently.'
    }
  }

  private assessBrandPerception(dimensions: Array<{name: string, score: number}>): string {
    const perceptionScore = this.getAverageScore(dimensions, ['sentiment_trust', 'conversational_copy', 'knowledge_graphs'])
    
    if (perceptionScore < 40) {
      return 'AI systems may have a poor or unclear understanding of your brand, potentially damaging your reputation in AI-powered interactions.'
    } else if (perceptionScore < 70) {
      return 'Your brand is reasonably well-understood by AI, but there\'s room to strengthen your digital reputation.'
    } else {
      return 'AI systems have a strong, positive understanding of your brand that enhances customer interactions.'
    }
  }

  private assessCompetitivePosition(overallScore: number): string {
    if (overallScore < 30) {
      return 'You\'re significantly behind competitors in AI visibility. Urgent action needed to avoid losing market share.'
    } else if (overallScore < 50) {
      return 'You\'re below average compared to competitors. Focus on quick wins to catch up.'
    } else if (overallScore < 70) {
      return 'You\'re competitive but not leading. Strategic improvements could give you an edge.'
    } else {
      return 'You\'re ahead of most competitors in AI readiness. Maintain this advantage as AI adoption grows.'
    }
  }

  private getAverageScore(dimensions: Array<{name: string, score: number}>, dimensionNames: string[]): number {
    const relevantDimensions = dimensions.filter(d => dimensionNames.includes(d.name))
    if (relevantDimensions.length === 0) return 0
    return relevantDimensions.reduce((sum, d) => sum + d.score, 0) / relevantDimensions.length
  }

  private prioritizeInvestments(insights: MerchantInsight[]): {
    immediate: MerchantInsight[]
    shortTerm: MerchantInsight[]
    longTerm: MerchantInsight[]
  } {
    return {
      immediate: insights.filter(i => i.difficulty === 'Easy' && i.timeframe.includes('week')),
      shortTerm: insights.filter(i => i.difficulty === 'Medium' || (i.difficulty === 'Easy' && i.timeframe.includes('month'))),
      longTerm: insights.filter(i => i.difficulty === 'Hard' || i.timeframe.includes('month'))
    }
  }
}
