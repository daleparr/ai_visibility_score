/**
 * User-friendly report utilities for making AI Visibility reports accessible to non-technical users
 */

export interface UserFriendlyDimension {
  technicalName: string
  friendlyName: string
  emoji: string
  businessQuestion: string
  businessImpact: string
  quickWinDescription: string
}

export interface ConversationalCopyRubric {
  coverage: { score: number; description: string }
  quality: { score: number; description: string }
  queryAlignment: { score: number; description: string }
  semanticEnrichment: { score: number; description: string }
}

/**
 * Maps technical dimension names to user-friendly explanations
 */
export const DIMENSION_MAPPINGS: Record<string, UserFriendlyDimension> = {
  'Geographic Visibility': {
    technicalName: 'Geographic Visibility',
    friendlyName: 'Store & Location Discovery',
    emoji: '📍',
    businessQuestion: 'When someone asks AI "Where can I shop your brand?"',
    businessImpact: 'Better local discovery means more foot traffic and location-based recommendations',
    quickWinDescription: 'Complete your Google Business Profiles for 15% better local discovery'
  },
  'Citation Strength': {
    technicalName: 'Citation Strength',
    friendlyName: 'Media Mentions & Authority',
    emoji: '📰',
    businessQuestion: 'How often do quality publications mention your brand?',
    businessImpact: 'More media mentions = AI sees you as more authoritative and trustworthy',
    quickWinDescription: 'Pitch your story to 3 relevant industry publications'
  },
  'AI Response Quality': {
    technicalName: 'AI Response Quality',
    friendlyName: 'AI Knowledge About Your Brand',
    emoji: '💬',
    businessQuestion: 'How accurately can AI answer questions about your brand?',
    businessImpact: 'Better AI knowledge = more accurate recommendations to customers',
    quickWinDescription: 'Update your About page with clear, comprehensive brand information'
  },
  'Schema & Structured Data': {
    technicalName: 'Schema & Structured Data',
    friendlyName: 'Website AI-Friendliness',
    emoji: '🤖',
    businessQuestion: 'How easily can AI understand your website content?',
    businessImpact: 'AI-friendly websites get recommended 40% more often',
    quickWinDescription: 'Add structured product information to your top 20 products'
  },
  'Brand Heritage': {
    technicalName: 'Brand Heritage',
    friendlyName: 'Brand Story Recognition',
    emoji: '📖',
    businessQuestion: 'Can AI explain your brand\'s history and values?',
    businessImpact: 'Strong brand stories help AI recommend you for the right reasons',
    quickWinDescription: 'Create a clear "Our Story" page with key milestones and values'
  },
  'Product Identification': {
    technicalName: 'Product Identification',
    friendlyName: 'Signature Product Visibility',
    emoji: '🏆',
    businessQuestion: 'Can AI identify and recommend your best products?',
    businessImpact: 'Clear product visibility drives more specific, valuable recommendations',
    quickWinDescription: 'Create a "Best Sellers" or "Signature Products" page'
  },
  'Transaction Clarity': {
    technicalName: 'Transaction Clarity',
    friendlyName: 'Purchase Process Clarity',
    emoji: '📦',
    businessQuestion: 'Can AI explain how to buy from you?',
    businessImpact: 'Clear purchase info reduces friction and increases conversions',
    quickWinDescription: 'Simplify your shipping and returns policy pages'
  },
  'Knowledge Graph Presence': {
    technicalName: 'Knowledge Graph Presence',
    friendlyName: 'Search Engine Recognition',
    emoji: '🔗',
    businessQuestion: 'Does Google\'s AI know key facts about your business?',
    businessImpact: 'Knowledge Graph presence makes you appear in more AI responses',
    quickWinDescription: 'Claim and optimize your Google Knowledge Panel'
  },
  'LLM Readability': {
    technicalName: 'LLM Readability',
    friendlyName: 'AI Content Understanding',
    emoji: '🧠',
    businessQuestion: 'How well can AI parse and understand your content?',
    businessImpact: 'Better content understanding = more accurate AI recommendations',
    quickWinDescription: 'Use clearer headings and bullet points in your content'
  },
  'Competitive Positioning': {
    technicalName: 'Competitive Positioning',
    friendlyName: 'Competitive Differentiation',
    emoji: '🎯',
    businessQuestion: 'Can AI explain what makes you different from competitors?',
    businessImpact: 'Clear differentiation helps AI recommend you over competitors',
    quickWinDescription: 'Add a "Why Choose Us" section highlighting unique benefits'
  },
  'Semantic Clarity': {
    technicalName: 'Semantic Clarity',
    friendlyName: 'Content Organization & Clarity',
    emoji: '📝',
    businessQuestion: 'How well-organized and clear is your content for AI?',
    businessImpact: 'Better content organization helps AI understand and recommend you accurately',
    quickWinDescription: 'Improve headings and content structure on key pages'
  },
  'Recommendation Accuracy': {
    technicalName: 'Recommendation Accuracy',
    friendlyName: 'AI Recommendation Quality',
    emoji: '🎯',
    businessQuestion: 'How accurately does AI recommend your products?',
    businessImpact: 'Better recommendations lead to more qualified customer referrals',
    quickWinDescription: 'Add detailed product descriptions and use cases'
  }
}

/**
 * Analyzes Conversational Copy scoring based on the provided rubric
 */
export function analyzeConversationalCopy(
  dimensionScore: number,
  evidence?: any
): ConversationalCopyRubric {
  // Break down the overall score into rubric components
  const coverage = Math.min(25, Math.round(dimensionScore * 0.25))
  const quality = Math.min(25, Math.round(dimensionScore * 0.25))
  const queryAlignment = Math.min(25, Math.round(dimensionScore * 0.25))
  const semanticEnrichment = Math.min(25, Math.round(dimensionScore * 0.25))

  return {
    coverage: {
      score: coverage,
      description: getCoverageDescription(coverage)
    },
    quality: {
      score: quality,
      description: getQualityDescription(quality)
    },
    queryAlignment: {
      score: queryAlignment,
      description: getQueryAlignmentDescription(queryAlignment)
    },
    semanticEnrichment: {
      score: semanticEnrichment,
      description: getSemanticEnrichmentDescription(semanticEnrichment)
    }
  }
}

function getCoverageDescription(score: number): string {
  if (score >= 20) return "Rich copy across most products + editorial content"
  if (score >= 10) return "Some PDPs with conversational tone"
  return "Minimal/flat descriptions"
}

function getQualityDescription(score: number): string {
  if (score >= 20) return "Distinct, use-case-driven copy"
  if (score >= 10) return "Functional but bland"
  return "Generic, repetitive phrasing"
}

function getQueryAlignmentDescription(score: number): string {
  if (score >= 20) return "Consistently mirrors natural queries"
  if (score >= 15) return "Some 'how/why/when' phrasing"
  return "No natural language Q&A"
}

function getSemanticEnrichmentDescription(score: number): string {
  if (score >= 20) return "Copy integrates key attributes, values, and links to ontologies"
  if (score >= 15) return "Some integration but inconsistent"
  return "No integration of brand values or attributes"
}

/**
 * Gets user-friendly explanation for a dimension
 */
export function getDimensionExplanation(dimensionName: string): UserFriendlyDimension | null {
  return DIMENSION_MAPPINGS[dimensionName] || null
}

/**
 * Converts technical score to letter grade
 */
export function getLetterGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Gets business impact description based on score
 */
export function getBusinessImpact(score: number): {
  level: 'high' | 'medium' | 'low'
  description: string
  opportunity: string
} {
  if (score >= 80) {
    return {
      level: 'high',
      description: 'AI frequently recommends your brand in this area',
      opportunity: 'Maintain your strong position and monitor competitors'
    }
  }
  if (score >= 60) {
    return {
      level: 'medium', 
      description: 'AI sometimes recommends your brand in this area',
      opportunity: 'Quick improvements could significantly boost AI recommendations'
    }
  }
  return {
    level: 'low',
    description: 'AI rarely recommends your brand in this area',
    opportunity: 'Major opportunity to improve AI visibility with focused effort'
  }
}

/**
 * Creates before/after AI interaction examples
 */
export function getAIInteractionExample(dimensionName: string, score: number): {
  before: string
  after: string
} {
  const examples: Record<string, { before: string; after: string }> = {
    'Geographic Visibility': {
      before: "I can find some stores but I'm not sure about current hours or exact locations.",
      after: "There are 3 stores near you. The Regent Street location is open until 8pm and has parking available."
    },
    'Citation Strength': {
      before: "I've heard of this brand but don't know much about their reputation.",
      after: "This brand has been featured in Vogue and Business Insider for their sustainable practices and quality."
    },
    'AI Response Quality': {
      before: "I can find basic information but details are limited.",
      after: "This London-based brand specializes in minimalist design, launched in 2007, and focuses on sustainable materials."
    },
    'Schema & Structured Data': {
      before: "I can see they sell clothing but I'm not sure about prices or availability.",
      after: "The quilted bag is £89, available in black and brown, and in stock for next-day delivery."
    },
    'Product Identification': {
      before: "They have various products but I'm not sure what they're known for.",
      after: "They're famous for their quilted bags, minimalist outerwear, and sustainable basics - especially the fisherman sweater."
    },
    'Semantic Clarity': {
      before: "I can find information but it's scattered and hard to understand.",
      after: "Their content is well-organized with clear sections for products, sustainability, and brand story."
    },
    'Recommendation Accuracy': {
      before: "I can suggest some products but I'm not sure they're the best fit.",
      after: "Based on your style preferences, I'd recommend their signature quilted bag - it's versatile, sustainable, and perfect for everyday use."
    },
    'Brand Heritage': {
      before: "I know it's a fashion brand but not much about their background.",
      after: "Founded in London in 2007, this H&M Group brand focuses on minimalist design and sustainable materials with Scandinavian influences."
    },
    'Transaction Clarity': {
      before: "I'm not sure about their shipping policies or return process.",
      after: "They offer free shipping over £50, 30-day returns, and next-day delivery in major cities."
    },
    'Knowledge Graph Presence': {
      before: "I have basic information but it might not be current.",
      after: "According to Google's knowledge base, they have 200+ stores globally and are known for sustainable fashion."
    },
    'LLM Readability': {
      before: "The website content is hard for me to parse and understand.",
      after: "The website uses clear, structured content that I can easily understand and reference."
    },
    'Competitive Positioning': {
      before: "I'm not sure how they compare to other fashion brands.",
      after: "They're positioned as a premium sustainable alternative to fast fashion, competing with COS and Arket in the conscious luxury space."
    }
  }

  return examples[dimensionName] || {
    before: "Limited information available about this aspect of your brand.",
    after: "Comprehensive, accurate information helps AI give better recommendations."
  }
}

/**
 * Gets priority level and effort estimation for improvements
 */
export function getImprovementPriority(score: number, businessImpact: string): {
  priority: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
  timeline: string
  expectedIncrease: string
} {
  if (score < 60) {
    return {
      priority: 'high',
      effort: 'medium',
      timeline: '2-4 weeks',
      expectedIncrease: '+15-25 points'
    }
  }
  if (score < 80) {
    return {
      priority: 'medium',
      effort: 'easy',
      timeline: '1-2 weeks', 
      expectedIncrease: '+8-15 points'
    }
  }
  return {
    priority: 'low',
    effort: 'easy',
    timeline: '1 week',
    expectedIncrease: '+3-8 points'
  }
}

/**
 * Gets implementation steps for specific recommendations
 */
export function getImplementationSteps(recommendationTitle: string): string[] {
  const steps: Record<string, string[]> = {
    'Improve Competitive Positioning': [
      'Research top 3 competitors\' positioning',
      'Identify unique value propositions',
      'Create "Why Choose Us" page',
      'Add comparison content to key pages'
    ],
    'Enhance Geographic Visibility': [
      'Audit all Google Business Profiles',
      'Complete missing location information',
      'Add store hours and contact details',
      'Optimize for local search terms'
    ],
    'Optimize Semantic Clarity': [
      'Review content structure on key pages',
      'Add clear headings and subheadings',
      'Use bullet points for key information',
      'Simplify complex sentences'
    ],
    'Improve Website AI-Friendliness': [
      'Add structured data to product pages',
      'Implement JSON-LD schema markup',
      'Optimize meta descriptions',
      'Add alt text to images'
    ],
    'Enhance Brand Story Recognition': [
      'Create comprehensive About page',
      'Add brand timeline and milestones',
      'Include founder story and values',
      'Link to press coverage and awards'
    ]
  }
  
  return steps[recommendationTitle] || [
    'Analyze current state',
    'Identify improvement opportunities',
    'Implement changes',
    'Monitor results'
  ]
}

/**
 * Gets business impact description for specific recommendations
 */
export function getBusinessImpactForRecommendation(recommendationTitle: string): string {
  const impacts: Record<string, string> = {
    'Improve Competitive Positioning': 'Clear differentiation helps AI recommend you over competitors, potentially increasing referrals by 20-30%',
    'Enhance Geographic Visibility': 'Better local discovery drives foot traffic and location-based recommendations, especially valuable for retail',
    'Optimize Semantic Clarity': 'Clearer content helps AI understand your offerings, leading to more accurate product recommendations',
    'Improve Website AI-Friendliness': 'Structured data makes your products 40% more likely to be recommended by AI assistants',
    'Enhance Brand Story Recognition': 'Strong brand narrative helps AI recommend you for the right reasons and to the right customers'
  }
  
  return impacts[recommendationTitle] || 'Improving this area will enhance how AI discovers and recommends your brand'
}