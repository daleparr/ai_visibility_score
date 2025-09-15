
import { BaseADIAgent } from './base-agent'
import type { 
  ADIAgentInput, 
  ADIAgentOutput, 
  ADIAgentConfig
} from '../../../types/adi'

/**
 * Sentiment Agent - Evaluates reputation signals and sentiment analysis
 * Analyzes brand sentiment, reputation indicators, and public perception signals
 */
export class SentimentAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'sentiment_agent',
      version: '1.0.0',
      description: 'Evaluates reputation signals and sentiment analysis for brand perception',
      dependencies: ['citation_agent'],
      timeout: 8000,
      retryLimit: 2,
      parallelizable: false
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`😊 Sentiment Agent: Starting evaluation for ${input.context.websiteUrl}`)
      
      const results: {
        resultType: string
        rawValue: number
        normalizedScore: number
        confidenceLevel: number
        evidence: Record<string, any>
      }[] = []
      
      // Get citation data from previous results
      const citationData = this.getCitationData(input.previousResults || [])
      const crawlData = this.getCrawlData(input.previousResults || [])
      
      // 1. Analyze brand sentiment from citations
      const brandSentimentResult = await this.analyzeBrandSentiment(citationData)
      results.push(brandSentimentResult)
      
      // 2. Evaluate reputation indicators
      const reputationIndicatorsResult = await this.analyzeReputationIndicators(citationData, crawlData)
      results.push(reputationIndicatorsResult)
      
      // 3. Check for trust signals
      const trustSignalsResult = await this.analyzeTrustSignals(crawlData)
      results.push(trustSignalsResult)
      
      // 4. Analyze social proof elements
      const socialProofResult = await this.analyzeSocialProof(crawlData)
      results.push(socialProofResult)
      
      // 5. Evaluate crisis management indicators
      const crisisManagementResult = await this.analyzeCrisisManagement(citationData)
      results.push(crisisManagementResult)

      const executionTime = Date.now() - startTime
      
      console.log(`✅ Sentiment Agent: Completed in ${executionTime}ms`)
      
      return {
        agentName: this.config.name,
        status: 'completed',
        results,
        executionTime,
        metadata: {
          citationSourcesAnalyzed: citationData?.sources?.length || 0,
          sentimentScore: this.calculateOverallSentiment(results),
          reputationSignals: this.countReputationSignals(results),
          agentVersion: this.config.version,
          timestamp: new Date().toISOString()
        }
      }
      
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`❌ Sentiment Agent failed:`, error)
      
      return {
        agentName: this.config.name,
        status: 'failed',
        results: [],
        executionTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date().toISOString(),
          error: error
        }
      }
    }
  }

  /**
   * Analyze brand sentiment from citations and mentions
   */
  private async analyzeBrandSentiment(citationData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const sentimentAnalysis = this.performSentimentAnalysis(citationData)
    
    const sentimentScore = this.calculateSentimentScore(sentimentAnalysis)
    
    return {
      resultType: 'brand_sentiment',
      rawValue: sentimentAnalysis.totalMentions,
      normalizedScore: sentimentScore,
      confidenceLevel: 0.8,
      evidence: {
        totalMentions: sentimentAnalysis.totalMentions,
        positiveMentions: sentimentAnalysis.positiveMentions,
        negativeMentions: sentimentAnalysis.negativeMentions,
        neutralMentions: sentimentAnalysis.neutralMentions,
        sentimentDistribution: sentimentAnalysis.sentimentDistribution,
        sentimentTrend: sentimentAnalysis.sentimentTrend,
        keyPositiveTerms: sentimentAnalysis.keyPositiveTerms,
        keyNegativeTerms: sentimentAnalysis.keyNegativeTerms
      }
    }
  }

  /**
   * Analyze reputation indicators
   */
  private async analyzeReputationIndicators(citationData: any, crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const reputationMetrics = {
      awards: this.findAwards(citationData, crawlData),
      certifications: this.findCertifications(crawlData),
      partnerships: this.findPartnerships(citationData, crawlData),
      testimonials: this.findTestimonials(crawlData),
      expertEndorsements: this.findExpertEndorsements(citationData)
    }
    
    const reputationScore = this.calculateReputationScore(reputationMetrics)
    
    return {
      resultType: 'reputation_indicators',
      rawValue: Object.values(reputationMetrics).flat().length,
      normalizedScore: reputationScore,
      confidenceLevel: 0.85,
      evidence: {
        awardsFound: reputationMetrics.awards.length,
        certificationsFound: reputationMetrics.certifications.length,
        partnershipsFound: reputationMetrics.partnerships.length,
        testimonialsFound: reputationMetrics.testimonials.length,
        expertEndorsementsFound: reputationMetrics.expertEndorsements.length,
        reputationCategories: this.categorizeReputationSignals(reputationMetrics),
        credibilityScore: this.calculateCredibilityScore(reputationMetrics)
      }
    }
  }

  /**
   * Analyze trust signals
   */
  private async analyzeTrustSignals(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const trustSignals = {
      securityBadges: this.findSecurityBadges(crawlData),
      privacyPolicies: this.findPrivacyPolicies(crawlData),
      contactInformation: this.findContactInformation(crawlData),
      businessRegistration: this.findBusinessRegistration(crawlData),
      guarantees: this.findGuarantees(crawlData)
    }
    
    const trustScore = this.calculateTrustScore(trustSignals)
    
    return {
      resultType: 'trust_signals',
      rawValue: Object.values(trustSignals).flat().length,
      normalizedScore: trustScore,
      confidenceLevel: 0.9,
      evidence: {
        securityBadgesFound: trustSignals.securityBadges.length,
        privacyPoliciesFound: trustSignals.privacyPolicies.length,
        contactInformationComplete: trustSignals.contactInformation.length > 2,
        businessRegistrationFound: trustSignals.businessRegistration.length > 0,
        guaranteesOffered: trustSignals.guarantees.length,
        trustCategories: this.categorizeTrustSignals(trustSignals),
        trustworthinessLevel: this.calculateTrustworthinessLevel(trustSignals)
      }
    }
  }

  /**
   * Analyze social proof elements
   */
  private async analyzeSocialProof(crawlData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const socialProofElements = {
      customerReviews: this.findCustomerReviews(crawlData),
      socialMediaLinks: this.findSocialMediaLinks(crawlData),
      userGeneratedContent: this.findUserGeneratedContent(crawlData),
      communityFeatures: this.findCommunityFeatures(crawlData),
      influencerMentions: this.findInfluencerMentions(crawlData)
    }
    
    const socialProofScore = this.calculateSocialProofScore(socialProofElements)
    
    return {
      resultType: 'social_proof',
      rawValue: Object.values(socialProofElements).flat().length,
      normalizedScore: socialProofScore,
      confidenceLevel: 0.75,
      evidence: {
        customerReviewsFound: socialProofElements.customerReviews.length,
        socialMediaLinksFound: socialProofElements.socialMediaLinks.length,
        userGeneratedContentFound: socialProofElements.userGeneratedContent.length,
        communityFeaturesFound: socialProofElements.communityFeatures.length,
        influencerMentionsFound: socialProofElements.influencerMentions.length,
        socialProofTypes: this.categorizeSocialProof(socialProofElements),
        engagementLevel: this.calculateEngagementLevel(socialProofElements)
      }
    }
  }

  /**
   * Analyze crisis management indicators
   */
  private async analyzeCrisisManagement(citationData: any): Promise<{
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }> {
    const crisisIndicators = {
      negativeNewsCount: this.countNegativeNews(citationData),
      responseToNegativeNews: this.findResponseToNegativeNews(citationData),
      crisisRecoverySignals: this.findCrisisRecoverySignals(citationData),
      transparencyIndicators: this.findTransparencyIndicators(citationData)
    }
    
    const crisisManagementScore = this.calculateCrisisManagementScore(crisisIndicators)
    
    return {
      resultType: 'crisis_management',
      rawValue: crisisIndicators.negativeNewsCount,
      normalizedScore: crisisManagementScore,
      confidenceLevel: 0.7,
      evidence: {
        negativeNewsCount: crisisIndicators.negativeNewsCount,
        responseToNegativeNewsFound: crisisIndicators.responseToNegativeNews.length,
        crisisRecoverySignalsFound: crisisIndicators.crisisRecoverySignals.length,
        transparencyIndicatorsFound: crisisIndicators.transparencyIndicators.length,
        crisisManagementQuality: this.assessCrisisManagementQuality(crisisIndicators),
        reputationResilienceScore: this.calculateReputationResilience(crisisIndicators)
      }
    }
  }

  // Helper methods for sentiment analysis
  private performSentimentAnalysis(citationData: any): any {
    if (!citationData?.mentions) {
      return {
        totalMentions: 0,
        positiveMentions: 0,
        negativeMentions: 0,
        neutralMentions: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        sentimentTrend: 'stable',
        keyPositiveTerms: [],
        keyNegativeTerms: []
      }
    }

    // Simulate sentiment analysis (in production, use actual NLP service)
    const mentions = citationData.mentions || []
    const totalMentions = mentions.length
    
    // Simple sentiment classification based on keywords
    const positiveKeywords = ['excellent', 'great', 'amazing', 'outstanding', 'innovative', 'quality', 'best', 'love', 'recommend']
    const negativeKeywords = ['terrible', 'awful', 'poor', 'bad', 'worst', 'hate', 'disappointing', 'fraud', 'scam']
    
    let positiveMentions = 0
    let negativeMentions = 0
    let neutralMentions = 0
    
    const keyPositiveTerms: string[] = []
    const keyNegativeTerms: string[] = []
    
    mentions.forEach((mention: any) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      
      const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length
      const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length
      
      if (positiveCount > negativeCount) {
        positiveMentions++
        positiveKeywords.forEach(keyword => {
          if (text.includes(keyword) && !keyPositiveTerms.includes(keyword)) {
            keyPositiveTerms.push(keyword)
          }
        })
      } else if (negativeCount > positiveCount) {
        negativeMentions++
        negativeKeywords.forEach(keyword => {
          if (text.includes(keyword) && !keyNegativeTerms.includes(keyword)) {
            keyNegativeTerms.push(keyword)
          }
        })
      } else {
        neutralMentions++
      }
    })
    
    const sentimentDistribution = {
      positive: totalMentions > 0 ? (positiveMentions / totalMentions) * 100 : 0,
      negative: totalMentions > 0 ? (negativeMentions / totalMentions) * 100 : 0,
      neutral: totalMentions > 0 ? (neutralMentions / totalMentions) * 100 : 0
    }
    
    const sentimentTrend = positiveMentions > negativeMentions ? 'positive' : 
                          negativeMentions > positiveMentions ? 'negative' : 'stable'
    
    return {
      totalMentions,
      positiveMentions,
      negativeMentions,
      neutralMentions,
      sentimentDistribution,
      sentimentTrend,
      keyPositiveTerms: keyPositiveTerms.slice(0, 10),
      keyNegativeTerms: keyNegativeTerms.slice(0, 10)
    }
  }

  private calculateSentimentScore(analysis: any): number {
    if (analysis.totalMentions === 0) return 50 // Neutral score for no mentions
    
    const positiveRatio = analysis.positiveMentions / analysis.totalMentions
    const negativeRatio = analysis.negativeMentions / analysis.totalMentions
    
    // Score based on sentiment ratio
    let score = 50 + (positiveRatio * 40) - (negativeRatio * 40)
    
    // Bonus for high positive sentiment
    if (positiveRatio > 0.7) score += 10
    
    // Penalty for high negative sentiment
    if (negativeRatio > 0.3) score -= 15
    
    return Math.min(100, Math.max(0, score))
  }

  private findAwards(citationData: any, crawlData: any): string[] {
    const awards: string[] = []
    const awardKeywords = ['award', 'winner', 'recognition', 'honor', 'prize', 'achievement']
    
    // Check citations
    if (citationData?.mentions) {
      citationData.mentions.forEach((mention: any) => {
        const text = (mention.text || mention.content || '').toLowerCase()
        awardKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            awards.push(`citation_award_${keyword}`)
          }
        })
      })
    }
    
    // Check website content
    if (crawlData?.content) {
      const content = crawlData.content.toLowerCase()
      awardKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          awards.push(`website_award_${keyword}`)
        }
      })
    }
    
    return [...new Set(awards)] // Remove duplicates
  }

  private findCertifications(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const certificationKeywords = [
      'certified', 'certification', 'accredited', 'accreditation',
      'iso', 'compliance', 'verified', 'approved'
    ]
    
    const certifications: string[] = []
    const content = crawlData.content.toLowerCase()
    
    certificationKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        certifications.push(`certification_${keyword}`)
      }
    })
    
    return certifications
  }

  private findPartnerships(citationData: any, crawlData: any): string[] {
    const partnerships: string[] = []
    const partnershipKeywords = ['partner', 'partnership', 'collaboration', 'alliance', 'sponsor']
    
    // Check citations
    if (citationData?.mentions) {
      citationData.mentions.forEach((mention: any) => {
        const text = (mention.text || mention.content || '').toLowerCase()
        partnershipKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            partnerships.push(`citation_partnership_${keyword}`)
          }
        })
      })
    }
    
    // Check website content
    if (crawlData?.content) {
      const content = crawlData.content.toLowerCase()
      partnershipKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          partnerships.push(`website_partnership_${keyword}`)
        }
      })
    }
    
    return [...new Set(partnerships)]
  }

  private findTestimonials(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const testimonialIndicators = [
      'testimonial', 'review', 'customer says', 'client feedback',
      'what our customers', 'customer stories', 'success stories'
    ]
    
    const testimonials: string[] = []
    const content = crawlData.content.toLowerCase()
    
    testimonialIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        testimonials.push(`testimonial_${index}`)
      }
    })
    
    return testimonials
  }

  private findExpertEndorsements(citationData: any): string[] {
    if (!citationData?.mentions) return []
    
    const expertKeywords = ['expert', 'specialist', 'authority', 'professional', 'industry leader']
    const endorsements: string[] = []
    
    citationData.mentions.forEach((mention: any) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      expertKeywords.forEach(keyword => {
        if (text.includes(keyword) && (text.includes('recommend') || text.includes('endorse'))) {
          endorsements.push(`expert_endorsement_${keyword}`)
        }
      })
    })
    
    return endorsements
  }

  private calculateReputationScore(metrics: any): number {
    let score = 30 // Base score
    
    // Awards and recognition
    if (metrics.awards.length > 3) score += 25
    else if (metrics.awards.length > 1) score += 15
    
    // Certifications
    if (metrics.certifications.length > 2) score += 20
    else if (metrics.certifications.length > 0) score += 10
    
    // Partnerships
    if (metrics.partnerships.length > 2) score += 15
    else if (metrics.partnerships.length > 0) score += 10
    
    // Testimonials
    if (metrics.testimonials.length > 3) score += 10
    else if (metrics.testimonials.length > 1) score += 5
    
    // Expert endorsements
    if (metrics.expertEndorsements.length > 1) score += 10
    else if (metrics.expertEndorsements.length > 0) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private categorizeReputationSignals(metrics: any): Record<string, number> {
    return {
      awards: metrics.awards.length,
      certifications: metrics.certifications.length,
      partnerships: metrics.partnerships.length,
      testimonials: metrics.testimonials.length,
      expertEndorsements: metrics.expertEndorsements.length
    }
  }

  private calculateCredibilityScore(metrics: any): number {
    const totalSignals = Object.values(metrics).flat().length
    return Math.min(100, totalSignals * 10) // 10 points per signal, max 100
  }

  private findSecurityBadges(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const securityIndicators = ['ssl', 'secure', 'verified', 'trusted', 'mcafee', 'norton', 'verisign']
    const badges: string[] = []
    const content = crawlData.content.toLowerCase()
    
    securityIndicators.forEach(indicator => {
      if (content.includes(indicator)) {
        badges.push(`security_${indicator}`)
      }
    })
    
    return badges
  }

  private findPrivacyPolicies(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const privacyIndicators = ['privacy policy', 'terms of service', 'cookie policy', 'data protection']
    const policies: string[] = []
    const content = crawlData.content.toLowerCase()
    
    privacyIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        policies.push(`privacy_policy_${index}`)
      }
    })
    
    return policies
  }

  private findContactInformation(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const contactIndicators = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
      /\b\d+\s+\w+\s+(?:street|st|avenue|ave|road|rd|drive|dr)\b/i // Addresses
    ]
    
    const contacts: string[] = []
    const content = crawlData.content
    
    contactIndicators.forEach((pattern, index) => {
      if (pattern.test(content)) {
        contacts.push(`contact_${index}`)
      }
    })
    
    return contacts
  }

  private findBusinessRegistration(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const registrationIndicators = [
      'registered business', 'business license', 'company registration',
      'tax id', 'ein', 'business number'
    ]
    
    const registrations: string[] = []
    const content = crawlData.content.toLowerCase()
    
    registrationIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        registrations.push(`registration_${index}`)
      }
    })
    
    return registrations
  }

  private findGuarantees(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const guaranteeIndicators = [
      'money back guarantee', 'satisfaction guarantee', 'warranty',
      'return policy', 'refund policy', '100% guarantee'
    ]
    
    const guarantees: string[] = []
    const content = crawlData.content.toLowerCase()
    
    guaranteeIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        guarantees.push(`guarantee_${index}`)
      }
    })
    
    return guarantees
  }

  private calculateTrustScore(signals: any): number {
    let score = 20 // Base score
    
    // Security badges
    if (signals.securityBadges.length > 2) score += 20
    else if (signals.securityBadges.length > 0) score += 15
    
    // Privacy policies
    if (signals.privacyPolicies.length > 2) score += 20
    else if (signals.privacyPolicies.length > 0) score += 15
    
    // Contact information
    if (signals.contactInformation.length > 2) score += 20
    else if (signals.contactInformation.length > 0) score += 10
    
    // Business registration
    if (signals.businessRegistration.length > 0) score += 15
    
    // Guarantees
    if (signals.guarantees.length > 1) score += 10
    else if (signals.guarantees.length > 0) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private categorizeTrustSignals(signals: any): Record<string, number> {
    return {
      security: signals.securityBadges.length,
      privacy: signals.privacyPolicies.length,
      contact: signals.contactInformation.length,
      registration: signals.businessRegistration.length,
      guarantees: signals.guarantees.length
    }
  }

  private calculateTrustworthinessLevel(signals: any): string {
    const totalSignals = Object.values(signals).flat().length
    
    if (totalSignals > 8) return 'Very High'
    if (totalSignals > 5) return 'High'
    if (totalSignals > 3) return 'Medium'
    if (totalSignals > 1) return 'Low'
    return 'Very Low'
  }

  private findCustomerReviews(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const reviewIndicators = ['customer review', 'user review', 'rating', 'stars', 'feedback']
    const reviews: string[] = []
    const content = crawlData.content.toLowerCase()
    
    reviewIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        reviews.push(`review_${index}`)
      }
    })
    
    return reviews
  }

  private findSocialMediaLinks(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok']
    const links: string[] = []
    const content = crawlData.content.toLowerCase()
    
    socialPlatforms.forEach(platform => {
      if (content.includes(platform)) {
        links.push(`social_${platform}`)
      }
    })
    
    return links
  }

  private findUserGeneratedContent(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const ugcIndicators = ['user generated', 'customer photos', 'user photos', 'community content']
    const ugc: string[] = []
    const content = crawlData.content.toLowerCase()
    
    ugcIndicators.forEach((indicator, index) => {
      if (content.includes(indicator)) {
        ugc.push(`ugc_${index}`)
      }
    })
    
    return ugc
  }

  private findCommunityFeatures(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const communityIndicators = ['forum', 'community', 'discussion', 'comments', 'blog']
    const features: string[] = []
    const content = crawlData.content.toLowerCase()
    
    communityIndicators.forEach(indicator => {
      if (content.includes(indicator)) {
        features.push(`community_${indicator}`)
      }
    })
    
    return features
  }

  private findInfluencerMentions(crawlData: any): string[] {
    if (!crawlData?.content) return []
    
    const influencerIndicators = ['influencer', 'celebrity', 'ambassador', 'spokesperson']
    const mentions: string[] = []
    const content = crawlData.content.toLowerCase()
    
    influencerIndicators.forEach(indicator => {
      if (content.includes(indicator)) {
        mentions.push(`influencer_${indicator}`)
      }
    })
    
    return mentions
  }

  private calculateSocialProofScore(elements: any): number {
    let score = 25 // Base score
    
    // Customer reviews
    if (elements.customerReviews.length > 2) score += 20
    else if (elements.customerReviews.length > 0) score += 15
    
    // Social media presence
    if (elements.socialMediaLinks.length > 3) score += 20
    else if (elements.socialMediaLinks.length > 1) score += 15
    
    // User generated content
    if (elements.userGeneratedContent.length > 1) score += 15
    else if (elements.userGeneratedContent.length > 0) score += 10
    
    // Community features
    if (elements.communityFeatures.length > 2) score += 15
    else if (elements.communityFeatures.length > 0) score += 10
    
    // Influencer mentions
    if (elements.influencerMentions.length > 0) score += 5
    
    return Math.min(100, Math.max(0, score))
  }

  private categorizeSocialProof(elements: any): Record<string, number> {
    return {
      reviews: elements.customerReviews.length,
      socialMedia: elements.socialMediaLinks.length,
      userContent: elements.userGeneratedContent.length,
      community: elements.communityFeatures.length,
      influencers: elements.influencerMentions.length
    }
  }

  private calculateEngagementLevel(elements: any): string {
    const totalElements = Object.values(elements).flat().length
    
    if (totalElements > 10) return 'Very High'
    if (totalElements > 6) return 'High'
    if (totalElements > 3) return 'Medium'
    if (totalElements > 1) return 'Low'
    return 'Very Low'
  }

  private countNegativeNews(citationData: any): number {
    if (!citationData?.mentions) return 0
    
    const negativeKeywords = ['scandal', 'controversy', 'lawsuit', 'fraud', 'investigation', 'recall']
    let negativeCount = 0
    
    citationData.mentions.forEach((mention: any) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      if (negativeKeywords.some(keyword => text.includes(keyword))) {
        negativeCount++
      }
    })
    
    return negativeCount
  }

  private findResponseToNegativeNews(citationData: any): string[] {
    if (!citationData?.mentions) return []
    
    const responseKeywords = ['response', 'statement', 'clarification', 'apology', 'explanation']
    const responses: string[] = []
    
    citationData.mentions.forEach((mention: any, index: number) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      responseKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          responses.push(`response_${keyword}_${index}`)
        }
      })
    })
    
    return responses
  }

  private findCrisisRecoverySignals(citationData: any): string[] {
    if (!citationData?.mentions) return []
    
    const recoveryKeywords = ['recovery', 'improvement', 'turnaround', 'comeback', 'rebound']
    const signals: string[] = []
    
    citationData.mentions.forEach((mention: any, index: number) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      recoveryKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          signals.push(`recovery_${keyword}_${index}`)
        }
      })
    })
    
    return signals
  }

  private findTransparencyIndicators(citationData: any): string[] {
    if (!citationData?.mentions) return []
    
    const transparencyKeywords = ['transparent', 'transparency', 'open', 'honest', 'disclosure']
    const indicators: string[] = []
    
    citationData.mentions.forEach((mention: any, index: number) => {
      const text = (mention.text || mention.content || '').toLowerCase()
      transparencyKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          indicators.push(`transparency_${keyword}_${index}`)
        }
      })
    })
    
    return indicators
  }

  private calculateCrisisManagementScore(indicators: any): number {
    let score = 50 // Base score (neutral)
    
    // Penalty for negative news
    score -= Math.min(30, indicators.negativeNewsCount * 5)
    
    // Bonus for response to negative news
    if (indicators.responseToNegativeNews.length > 0) {
      score += Math.min(20, indicators.responseToNegativeNews.length * 10)
    }
    
    // Bonus for crisis recovery signals
    if (indicators.crisisRecoverySignals.length > 0) {
      score += Math.min(15, indicators.crisisRecoverySignals.length * 5)
    }
    
    // Bonus for transparency
    if (indicators.transparencyIndicators.length > 0) {
      score += Math.min(15, indicators.transparencyIndicators.length * 5)
    }
    
    return Math.min(100, Math.max(0, score))
  }

  private assessCrisisManagementQuality(indicators: any): string {
    if (indicators.negativeNewsCount === 0) return 'No crisis detected'
    if (indicators.responseToNegativeNews.length > indicators.negativeNewsCount) return 'Proactive response'
    if (indicators.responseToNegativeNews.length > 0) return 'Responsive'
    return 'Poor crisis management'
  }

  private calculateReputationResilience(indicators: any): number {
    if (indicators.negativeNewsCount === 0) return 100
    
    const responseRatio = indicators.responseToNegativeNews.length / indicators.negativeNewsCount
    const recoverySignals = indicators.crisisRecoverySignals.length
    const transparencySignals = indicators.transparencyIndicators.length
    
    let resilience = 50 // Base resilience
    resilience += responseRatio * 30 // Up to 30 points for response ratio
    resilience += Math.min(15, recoverySignals * 5) // Up to 15 points for recovery
    resilience += Math.min(5, transparencySignals * 2) // Up to 5 points for transparency
    
    return Math.min(100, Math.max(0, resilience))
  }

  private calculateOverallSentiment(results: any[]): number {
    const sentimentResult = results.find(r => r.resultType === 'brand_sentiment')
    return sentimentResult?.normalizedScore || 50
  }

  private countReputationSignals(results: any[]): number {
    const reputationResult = results.find(r => r.resultType === 'reputation_indicators')
    return reputationResult?.rawValue || 0
  }

  private getCitationData(previousResults: any[]): any {
    return previousResults.find(r => r.result_type === 'citation_agent')?.evidence || null
  }

  private getCrawlData(previousResults: any[]): any {
    return previousResults.find(r => r.result_type === 'crawl_agent')?.evidence || null
  }
}