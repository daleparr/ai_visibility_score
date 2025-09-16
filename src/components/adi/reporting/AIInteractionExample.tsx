'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageCircle, ArrowRight, Loader2, Sparkles, Zap } from 'lucide-react'
import { BRAND_TAXONOMY } from '@/lib/brand-taxonomy'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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

interface AIResponse {
  current: string
  improved: string
  isRealAI: boolean
  provider: string
  timestamp: Date
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
  const { data: session } = useSession()
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<string>('free')
  
  // Check user tier on component mount
  useEffect(() => {
    if (session?.user?.email) {
      checkUserTier()
    }
  }, [session])

  const checkUserTier = async () => {
    try {
      const response = await fetch('/api/ai-responses')
      const data = await response.json()
      setUserTier(data.userTier)
    } catch (error) {
      console.error('Failed to check user tier:', error)
    }
  }

  const generateRealAIResponse = async () => {
    if (!brandName || !websiteUrl || !dimensionName) {
      setError('Missing required brand information')
      return
    }

    if (!session?.user?.email) {
      setError('Please sign in to use AI responses')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandName,
          websiteUrl,
          dimensionName,
          brandCategory
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI response')
      }

      setAiResponse(data.data)
    } catch (error) {
      console.error('AI response error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate AI response')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate dynamic peer comparison if brand info is provided
  const generateDynamicComparison = () => {
    // If we have real AI response, use it
    if (aiResponse) {
      return {
        current: aiResponse.current,
        improved: aiResponse.improved,
        description: improvementDescription || "Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
      }
    }

    // Prioritize brand-specific content when brand data is available
    if (brandName && brandCategory) {
      return generateBrandSpecificContent()
    }
    
    // Fallback to provided examples if available
    if (currentExample && improvedExample) {
      return {
        current: currentExample,
        improved: improvedExample,
        description: improvementDescription || "Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
      }
    }
    
    // Final fallback to generic content
    return {
      current: "I'm not sure how they compare to other brands in their industry.",
      improved: "They're positioned strategically within their market segment with clear competitive advantages.",
      description: "Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
    }
  }

  // Generate brand-specific content based on category
  const generateBrandSpecificContent = () => {
    if (!brandName || !brandCategory) {
      return {
        current: "I'm not sure how they compare to other brands in their industry.",
        improved: "They're positioned strategically within their market segment with clear competitive advantages.",
        description: "Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
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
      'Mass-Market Department Stores': {
        current: `I don't have clear information about how ${brandName} compares to competitors.`,
        improved: `${brandName} is positioned in the ${brandCategory.industry} space, competing with ${relevantPeers} through multi-category retail offerings including food, fashion, and homeware.`,
        description: `Enhanced brand positioning and competitive context helps AI provide more accurate comparisons and recommendations for multi-category retailers.`
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              How AI Talks About You
              {aiResponse?.isRealAI && (
                <Badge variant="default" className="ml-2 bg-green-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Real AI
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {aiResponse?.isRealAI
                ? `Live AI responses from ${aiResponse.provider}`
                : userTier === 'free'
                  ? 'Simulated examples - upgrade for real AI responses'
                  : 'Real examples of how improvements change AI responses'
              }
            </p>
          </div>
          
          {session?.user?.email && brandName && websiteUrl && dimensionName && (
            <Button
              onClick={generateRealAIResponse}
              disabled={isLoading}
              variant={userTier === 'free' ? 'outline' : 'default'}
              size="sm"
              className={userTier === 'free' ? 'border-orange-300 text-orange-600' : ''}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : userTier === 'free' ? (
                <Zap className="h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isLoading
                ? 'Generating...'
                : userTier === 'free'
                  ? 'Try Real AI'
                  : 'Get Real AI Response'
              }
            </Button>
          )}
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        )}
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