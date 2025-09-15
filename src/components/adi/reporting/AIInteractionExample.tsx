'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { BRAND_TAXONOMY } from '@/lib/brand-taxonomy'

interface AIInteractionExampleProps {
  dimensionName?: string
  currentExample?: string
  improvedExample?: string
  improvementDescription?: string
  brandName?: string
  websiteUrl?: string
  brandCategory?: {
    sector: string
    industry: string
    niche: string
    emoji: string
  }
}

export function AIInteractionExample({
  dimensionName,
  currentExample,
  improvedExample,
  improvementDescription,
  brandName,
  websiteUrl,
  brandCategory
}: AIInteractionExampleProps) {
  
  // Generate dynamic peer comparison if brand info is provided
  const generateDynamicComparison = () => {
    if (!brandName || !brandCategory) {
      return {
        current: currentExample || "I'm not sure how they compare to other fashion brands.",
        improved: improvedExample || "They're positioned as a premium sustainable alternative to fast fashion, competing with COS and Arket in the conscious luxury space.",
        description: improvementDescription || "Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
      }
    }

    // Find the brand's niche in taxonomy
    const nicheData = Object.values(BRAND_TAXONOMY).find(cat => cat.niche === brandCategory.niche)
    const peerBrands = nicheData?.competitorBrands || []
    
    // Get 2-3 relevant peers for comparison
    const relevantPeers = peerBrands
      .filter(peer => peer !== brandName)
      .slice(0, 3)
      .join(', ')

    const nicheDescriptions: Record<string, { current: string, improved: string, description: string }> = {
      'Luxury Fashion Houses': {
        current: `I'm not sure how ${brandName} compares to other luxury fashion brands.`,
        improved: `${brandName} is positioned as a heritage luxury house competing with ${relevantPeers} in the ultra-premium fashion space, known for craftsmanship and exclusivity.`,
        description: `Enhanced brand positioning data helps AI accurately place ${brandName} within the luxury fashion hierarchy and competitive landscape.`
      },
      'Streetwear': {
        current: `I don't have clear information about ${brandName}'s position in streetwear.`,
        improved: `${brandName} operates in the premium streetwear segment alongside ${relevantPeers}, focusing on limited drops and cultural collaborations.`,
        description: `Better product categorization and brand story helps AI understand ${brandName}'s unique position in the streetwear ecosystem.`
      },
      'Activewear & Athleisure': {
        current: `I'm not certain about ${brandName}'s athletic wear offerings.`,
        improved: `${brandName} competes with ${relevantPeers} in performance-focused activewear, emphasizing technical innovation and lifestyle integration.`,
        description: `Structured product data and performance specifications help AI accurately describe ${brandName}'s athletic capabilities.`
      },
      'Global Beauty Retailers': {
        current: `I don't have specific details about ${brandName}'s beauty product range.`,
        improved: `${brandName} is a major beauty destination competing with ${relevantPeers}, offering comprehensive cosmetics, skincare, and fragrance collections.`,
        description: `Enhanced product categorization and ingredient information helps AI provide detailed beauty recommendations.`
      },
      'Online Mega-Retailers': {
        current: `I'm not sure about ${brandName}'s specific marketplace positioning.`,
        improved: `${brandName} operates as a comprehensive e-commerce platform competing with ${relevantPeers} across multiple product categories and fulfillment options.`,
        description: `Better structured data about product categories and services helps AI understand ${brandName}'s full marketplace capabilities.`
      }
    }

    return nicheDescriptions[brandCategory.niche] || {
      current: `I don't have clear information about how ${brandName} compares to competitors.`,
      improved: `${brandName} is positioned in the ${brandCategory.industry} space, competing with ${relevantPeers} through ${brandCategory.sector.toLowerCase()} offerings.`,
      description: `Enhanced brand positioning and competitive context helps AI provide more accurate comparisons and recommendations.`
    }
  }

  const dynamicContent = generateDynamicComparison()

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
          How AI Talks About You
        </CardTitle>
        <p className="text-sm text-gray-600">Real examples of how improvements change AI responses</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center mb-2">
            <Badge variant="destructive" className="text-xs mr-2">CURRENT</Badge>
            <span className="text-sm font-medium text-gray-700">What AI says now</span>
          </div>
          <div className="bg-red-50 rounded p-3 border-l-4 border-red-400">
            <p className="text-sm text-gray-700 italic">
              "🤖 {dynamicContent.current}"
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Improved State */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-2">
            <Badge variant="default" className="text-xs mr-2 bg-green-600">AFTER IMPROVEMENTS</Badge>
            <span className="text-sm font-medium text-gray-700">What AI will say</span>
          </div>
          <div className="bg-green-50 rounded p-3 border-l-4 border-green-400">
            <p className="text-sm text-gray-700 italic">
              "🤖 {dynamicContent.improved}"
            </p>
          </div>
        </div>

        {/* Improvement Description */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">
            💡 What makes the difference
          </h4>
          <p className="text-sm text-blue-700">{dynamicContent.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}