'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, Search, BarChart3, Zap, Shield, TrendingUp, Download, Lock, Star, Trophy, Globe, Crown, FileText } from 'lucide-react'
import Link from 'next/link'
import { ExecutiveSummary } from '@/components/adi/reporting/ExecutiveSummary'
import { UserFriendlyDimensionCard } from '@/components/adi/reporting/UserFriendlyDimensionCard'
import { PriorityActionCard } from '@/components/adi/reporting/PriorityActionCard'
import { AIInteractionExample } from '@/components/adi/reporting/AIInteractionExample'
import { LeaderboardTable } from '@/components/adi/leaderboards/LeaderboardTable'
import {
  getImprovementPriority,
  getAIInteractionExample,
  getImplementationSteps,
  getBusinessImpactForRecommendation
} from '@/lib/report-utils'
import { LeaderboardData } from '@/types/leaderboards'
// Removed server-side imports that cause webpack bundling issues
// import { BrandCategorizationService } from '@/lib/brand-categorization-service'
// import { AIDIPerformanceAnalyzer, AIDIPerformanceProfile } from '@/lib/adi/performance-framework'
import type { AIDIPerformanceProfile } from '@/lib/adi/performance-framework'
import { AIDIPerformanceDashboard } from '@/components/adi/performance/AIDIPerformanceDashboard'
import { createCheckoutSession } from '@/lib/stripe-client'
import { EnhancedProgressDisplay } from '@/components/evaluation/EnhancedProgressDisplay'

interface DimensionScore {
  name: string
  score: number
  description: string
  pillar: 'infrastructure' | 'perception' | 'commerce'
}

interface ModelAnalysis {
  model: string
  provider: string
  score: number
  confidence: number
  strengths: string[]
  weaknesses: string[]
  keyInsight: string
  recommendation: string
}

interface PillarScore {
  name: string
  score: number
  color: string
  icon: React.ReactNode
  description: string
}

interface EvaluationData {
  url: string
  tier: string
  isDemo: boolean
  overallScore: number
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
  dimensionScores: DimensionScore[]
  aiProviders: string[]
  defaultModel: string
  recommendations: Array<{
    priority: string
    title: string
    score: number
    description: string
  }>
  analysisMethod?: string
  upgradeMessage?: string
  executiveSummary?: {
    verdict?: string
    strongest?: string
    weakest?: string
    opportunity?: string
    keyInsight?: string
    businessImpacts?: {
      customerDiscovery?: string
      brandPerception?: string
      salesConversion?: string
      competitivePosition?: string
    }
    actionableInsights?: Array<{
      title: string
      score: number
      currentState: string
      businessImpact: string
      opportunity: string
      actionRequired: string
      timeframe: string
      difficulty: string
      potentialGain: string
    }>
  }
  // Professional tier features
  modelAnalysis?: ModelAnalysis[]
  channelInsights?: Array<{
    channel: string
    score: number
    performance: string
    opportunities: string[]
    businessImpact: string
    recommendation: string
    improvementPotential: number
  }>
  industryBenchmarks?: {
    industry: string
    totalCompanies: number
    yourRank: number
    percentile: number
    industryMedian: number
    topPerformer: number
    competitorAnalysis: Array<{
      name: string
      score: number
      gap: number
    }>
  }
  certification?: {
    level: string
    badge: string
    validUntil: string
    achievements: string[]
  }
  insights?: {
    aiReadiness: string
    riskFactors: string[]
    opportunities: string[]
    nextSteps: string[]
  }
  brandCategory?: {
    sector: string
    industry: string
    niche: string
    emoji: string
  }
  brandName?: string
}

export default function EvaluatePage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || 'example.com'
  const tierParam = searchParams.get('tier')
  const tier: 'free' | 'index-pro' | 'enterprise' = 
    tierParam === 'index-pro' || tierParam === 'enterprise' ? tierParam : 'free'
  const [isLoading, setIsLoading] = useState(true)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [brandCategory, setBrandCategory] = useState<any>(null)
  const [performanceProfile, setPerformanceProfile] = useState<AIDIPerformanceProfile | null>(null)

  const generateTechnicalReport = async () => {
    if (!evaluationData) {
      console.error('No evaluation data available for report generation')
      alert('No evaluation data available. Please run an evaluation first.')
      return
    }

    try {
      console.log('Starting executive snapshot generation...', evaluationData)

      // Extract brand name properly
      const brandName = evaluationData.url?.replace(/^https?:\/\/(www\.)?/, '').split('.')[0] || 'Your Brand'
      const formattedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1)
      const grade = evaluationData.overallScore >= 80 ? 'A' : evaluationData.overallScore >= 70 ? 'B+' : evaluationData.overallScore >= 60 ? 'B' : evaluationData.overallScore >= 50 ? 'C+' : evaluationData.overallScore >= 40 ? 'C' : evaluationData.overallScore >= 30 ? 'D' : 'F'
      
      // Import jsPDF
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      
      // Set up colors and styling
      const primaryColor: [number, number, number] = [41, 128, 185] // Blue
      const secondaryColor: [number, number, number] = [52, 73, 94] // Dark gray
      const accentColor: [number, number, number] = [231, 76, 60] // Red
      const successColor: [number, number, number] = [39, 174, 96] // Green
      
      let yPos = 25
      
      // HEADER SECTION
      pdf.setFillColor(...primaryColor)
      pdf.rect(0, 0, 210, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EXECUTIVE SNAPSHOT', 20, 25)
      
      yPos = 55
      
      // BRAND INFO SECTION
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Brand: ${formattedBrandName}`, 20, yPos)
      
      yPos += 8
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Category: ${evaluationData.brandCategory || 'Multi-Category Business'}`, 20, yPos)
      
      yPos += 6
      pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPos)
      
      yPos += 15
      
      // SCORE SECTION
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, yPos - 5, 180, 25, 'F')
      
      pdf.setTextColor(...accentColor)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Overall AI Visibility Score: ${evaluationData.overallScore || 0}/100 - Grade: ${grade}`, 20, yPos + 5)
      
      yPos += 15
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const verdict = evaluationData.executiveSummary?.verdict || 'Analysis completed - review detailed findings below.'
      const verdictLines = pdf.splitTextToSize(`Verdict: ${verdict}`, 170)
      pdf.text(verdictLines, 20, yPos + 5)
      yPos += verdictLines.length * 5 + 10
      
      // PILLAR SCORES SECTION
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('How AI Sees Your Brand (3 Key Areas)', 20, yPos)
      yPos += 12
      
      const pillars = [
        { name: 'Technical Foundation', score: evaluationData.pillarScores?.infrastructure || 0, desc: 'How easily AI can read your website' },
        { name: 'Brand Perception', score: evaluationData.pillarScores?.perception || 0, desc: 'How well AI understands your brand' },
        { name: 'Shopping Experience', score: evaluationData.pillarScores?.commerce || 0, desc: 'How AI helps customers buy from you' }
      ]
      
      pillars.forEach((pillar, index) => {
        // Pillar name and score
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${pillar.name}`, 20, yPos)
        
        // Score with color coding
        const scoreColor: [number, number, number] = pillar.score >= 70 ? successColor : pillar.score >= 40 ? [243, 156, 18] : accentColor
        pdf.setTextColor(...scoreColor)
        pdf.text(`${pillar.score}/100`, 150, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(pillar.desc, 20, yPos)
        yPos += 12
      })
      
      // DIMENSION SCORES SECTION
      yPos += 5
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DIMENSION SCORES (Quick View)', 20, yPos)
      yPos += 8
      
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('(★ = 20 points, ☆ = remainder)', 20, yPos)
      yPos += 12
      
      // Get top dimensions from evaluation data
      const dimensions = evaluationData.dimensionScores || []
      const topDimensions = dimensions.slice(0, 8)
      
      topDimensions.forEach((dim, index) => {
        if (yPos > 250) {
          pdf.addPage()
          yPos = 30
        }
        
        const score = dim.score || 0
        const stars = Math.floor(score / 20)
        const remainder = score % 20
        const starDisplay = '★'.repeat(stars) + (remainder >= 10 ? '☆' : '')
        
        // Dimension number and name
        pdf.setTextColor(...primaryColor)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${dim.name || 'Analysis Area'}`, 20, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Score: ${score}/100 | Rating: ${starDisplay}`, 20, yPos)
        
        yPos += 5
        const description = dim.description || 'Assessment in progress'
        const descLines = pdf.splitTextToSize(description, 170)
        pdf.text(descLines, 20, yPos)
        yPos += descLines.length * 4 + 8
      })
      
      // QUICK ACTIONS SECTION
      if (yPos > 200) {
        pdf.addPage()
        yPos = 30
      }
      
      yPos += 10
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('QUICK ACTIONS', 20, yPos)
      yPos += 12
      
      const actions = [
        { priority: 'Priority 1 - Immediate (2 weeks)', fix: 'Add structured schema to FAQs, returns, and shipping pages', impact: '+6 pts' },
        { priority: 'Priority 2 - Short Term (30 days)', fix: 'Refresh reviews (invite verified buyers; surface seasonal feedback)', impact: '+7 pts' },
        { priority: 'Priority 3 - Medium Term (90 days)', fix: 'Secure structured citations in Tier-1 retail/tech press', impact: '+10 pts' }
      ]
      
      actions.forEach((action, index) => {
        pdf.setTextColor(...accentColor)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(action.priority, 20, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Fix: ${action.fix}`, 20, yPos)
        
        yPos += 5
        pdf.setTextColor(...successColor)
        pdf.text(`Impact: ${action.impact}`, 20, yPos)
        yPos += 12
      })
      
      // BOTTOM LINE SECTION
      if (yPos > 220) {
        pdf.addPage()
        yPos = 30
      }
      
      yPos += 10
      pdf.setFillColor(...primaryColor)
      pdf.rect(15, yPos - 5, 180, 8, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('BOTTOM LINE', 20, yPos)
      yPos += 15
      
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      const bottomLineText = `Current State: ${evaluationData.executiveSummary?.verdict || 'Well-structured but emotionally flat—AI sees a competent retailer, not a loved one.'}

Opportunity: ${evaluationData.executiveSummary?.keyInsight || 'With 2–3 quick wins (reviews + heritage markup), you could shift from mid-pack to top-quartile AI visibility.'}

If You Do Nothing: Risk of brand invisibility in AI-driven product discovery, particularly versus competitors who are optimizing for AI systems.

Next Step Today: ${evaluationData.executiveSummary?.opportunity || 'Run structured data audit on top 20 pages + add schema for shipping/FAQ pages.'}`
      
      const bottomLines = pdf.splitTextToSize(bottomLineText, 170)
      pdf.text(bottomLines, 20, yPos)
      
      // FOOTER
      yPos = 280
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(8)
      pdf.text(`Generated by AI Discoverability Index Platform | ${new Date().toLocaleString()}`, 20, yPos)
      
      // Generate filename and download
      const filename = `Executive_Snapshot_${formattedBrandName}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
      
      alert('Executive Snapshot downloaded successfully!')
      
    } catch (error) {
      console.error('Error generating executive snapshot:', error)
      alert(`Failed to generate executive snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Log evaluation for backend tracking
    logEvaluationForAdmin(evaluationData)
  }

  const logEvaluationForAdmin = async (data: EvaluationData) => {
    try {
      await fetch('/api/admin/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.url,
          tier: data.tier,
          overallScore: data.overallScore,
          pillarScores: data.pillarScores,
          timestamp: new Date().toISOString(),
          brandCategory: brandCategory,
          recommendations: data.recommendations,
          channelInsights: data.channelInsights,
          industryBenchmarks: data.industryBenchmarks
        })
      })
    } catch (error) {
      console.log('Admin logging failed:', error)
    }
  }

  useEffect(() => {
    const runEvaluation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get brand categorization first
        const brandName = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]
        let detectedCategory = null
        
        try {
          const categorizationResponse = await fetch(`/api/brand-categorization?action=categorize&brand=${encodeURIComponent(brandName)}&url=${encodeURIComponent(url)}`)
          if (categorizationResponse.ok) {
            const categoryData = await categorizationResponse.json()
            detectedCategory = categoryData.category
            setBrandCategory(categoryData.category)
          }
        } catch (error) {
          console.log('Brand categorization failed, using fallback')
        }

        // Start evaluation
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, tier }),
        })

        if (!response.ok) {
          throw new Error('Failed to start evaluation')
        }

        const { evaluationId } = await response.json()
        console.log('Started evaluation:', evaluationId)

        // Poll for completion
        const pollForCompletion = async () => {
          const maxAttempts = 60 // 2 minutes max
          let attempts = 0

          const poll = async (): Promise<void> => {
            if (attempts >= maxAttempts) {
              throw new Error('Evaluation timed out')
            }

            console.log(`Polling attempt ${attempts + 1} for evaluation ${evaluationId}`)
            
            const statusResponse = await fetch(`/api/evaluation/${evaluationId}/status?tier=${tier}`)
            const statusData = await statusResponse.json()

            console.log('Status response:', statusData)

            if (statusData.status === 'completed') {
              // Evaluation completed - set the results
              console.log('Evaluation completed, setting results:', statusData.results)
              setEvaluationData(statusData.results)
              setIsLoading(false)
              return
            }

            if (statusData.status === 'failed') {
              throw new Error('Evaluation failed')
            }

            // Still running - poll again in 2 seconds
            attempts++
            setTimeout(poll, 2000)
          }

          await poll()
        }

        await pollForCompletion()

        // Fetch leaderboard data for professional tier using detected category
        if (tier === 'index-pro') {
          try {
            const leaderboardResponse = await fetch(`/api/leaderboards?category=${detectedCategory || 'general'}&limit=10`)
            if (leaderboardResponse.ok) {
              const leaderboardData = await leaderboardResponse.json()
              setLeaderboardData(leaderboardData)
            }
          } catch (error) {
            console.log('Leaderboard fetch failed:', error)
          }
        }

      } catch (error) {
        console.error('Evaluation error:', error)
        setError(error instanceof Error ? error.message : 'Evaluation failed')
        setIsLoading(false)
      }
    }

    runEvaluation()
  }, [url, tier])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 60) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    if (score >= 70) return 'outline'
    return 'destructive'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'outline'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Evaluation Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/">Try Another URL</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Loading Animation */}
          <div className="max-w-4xl mx-auto">
            <EnhancedProgressDisplay 
              tier={tier} 
              url={url || 'https://example.com'} 
            />
          </div>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return null
  }

  const pillarScores: PillarScore[] = [
    {
      name: 'Infrastructure & Machine Readability',
      score: evaluationData.pillarScores?.infrastructure || 0,
      color: 'text-brand-600',
      icon: <Zap className="h-6 w-6" />,
      description: 'How well AI can parse your digital footprint'
    },
    {
      name: 'Perception & Reputation',
      score: evaluationData.pillarScores?.perception || 0,
      color: 'text-success-600',
      icon: <Search className="h-6 w-6" />,
      description: 'How AI understands your brand value'
    },
    {
      name: 'Commerce & Customer Experience',
      score: evaluationData.pillarScores?.commerce || 0,
      color: 'text-warning-600',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'How AI facilitates transactions'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4">
              <Brain className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">AI Discoverability Index</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">AI Discoverability Report</h1>
          </div>

          {/* Executive Summary */}
          <ExecutiveSummary
            overallScore={evaluationData.overallScore}
            url={evaluationData.url}
            tier={tier}
            pillarScores={evaluationData.pillarScores}
          />

          {/* AI Models Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Models Analyzed</CardTitle>
              <CardDescription>
                {tier === 'free' 
                  ? 'Free tier uses GPT-4 for comprehensive analysis' 
                  : 'Index Pro: Frontier model consensus analysis with detailed insights from each AI system'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tier === 'free' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">GPT-4 Turbo</Badge>
                    <Badge variant="secondary" className="ml-2">
                      <Lock className="h-3 w-3 mr-1" />
                      Upgrade for multi-model comparison
                    </Badge>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Upgrade to Index Pro</strong> to see detailed insights from all frontier models:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>• GPT-4 Turbo analysis</div>
                      <div>• Claude 3.5 Sonnet insights</div>
                      <div>• Perplexity Pro validation</div>
                      <div>• Gemini Pro 1.5 assessment</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {(evaluationData.modelAnalysis || []).map((model, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-semibold">
                            {model.model}
                          </Badge>
                          <span className="text-sm text-gray-500">by {model.provider}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={model.score >= 70 ? 'default' : model.score >= 50 ? 'secondary' : 'destructive'}>
                            {model.score}/100
                          </Badge>
                          <span className="text-xs text-gray-500">{model.confidence}% confidence</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Key Insight:</p>
                        <p className="text-sm text-gray-600">{model.keyInsight}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-green-700 mb-1">Strengths:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {model.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-orange-700 mb-1">Areas for Improvement:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {model.weaknesses.map((weakness, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-orange-500 mr-1">⚠</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Recommendation:</p>
                        <p className="text-xs text-blue-700">{model.recommendation}</p>
                      </div>
                    </div>
                  ))}
                  
                  {(!evaluationData.modelAnalysis || evaluationData.modelAnalysis.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Model analysis data is being processed...</p>
                      <p className="text-sm">Refresh the page in a few moments to see detailed insights.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Tier Features */}
          {evaluationData.tier !== 'free' && (
            <>
              {/* AIDI Certification */}
              {evaluationData.certification && (
                <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{evaluationData.certification.badge}</span>
                      <div>
                        <div>AIDI Certification: {evaluationData.certification.level}</div>
                        <div className="text-sm text-gray-600">Valid until {evaluationData.certification.validUntil}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(evaluationData.certification?.achievements || []).map((achievement, index) => (
                        <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                          🏆 {achievement}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Per-Model Analysis */}
              {evaluationData.channelInsights && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>AI Channel Performance Analysis</CardTitle>
                    <CardDescription>How your brand performs across different AI-powered channels and platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(evaluationData.channelInsights || []).map((channel, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold">{channel.channel}</CardTitle>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getScoreBadgeVariant(Math.round(channel.score))}>
                                  {Math.round(channel.score)}
                                </Badge>
                                <Badge variant="outline" className={
                                  channel.performance === 'Strong' ? 'text-green-600 border-green-200' : 
                                  channel.performance === 'Moderate' ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'
                                }>
                                  {channel.performance}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <div className="text-xs font-medium text-blue-600 mb-1">Business Impact:</div>
                              <div className="text-xs text-gray-600">
                                {channel.businessImpact}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-green-600 mb-1">Opportunities (+{channel.improvementPotential} pts potential):</div>
                              <div className="text-xs text-gray-600">
                                {(channel.opportunities || []).join(', ')}
                              </div>
                            </div>
                            <div className="text-xs text-purple-600 font-medium">
                              💡 {channel.recommendation}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Industry Benchmarking */}
              {evaluationData.industryBenchmarks && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Industry Benchmarking</CardTitle>
                    <CardDescription>How you compare to {evaluationData.industryBenchmarks.totalCompanies} companies in {evaluationData.industryBenchmarks.industry}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Your Position</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Industry Rank:</span>
                            <Badge variant="outline">#{evaluationData.industryBenchmarks.yourRank}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Percentile:</span>
                            <Badge variant="secondary">{evaluationData.industryBenchmarks.percentile}th</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Industry Median:</span>
                            <span className="font-medium">{evaluationData.industryBenchmarks.industryMedian}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Top Performer:</span>
                            <span className="font-medium text-green-600">{evaluationData.industryBenchmarks.topPerformer}/100</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Competitive Analysis</h4>
                        <div className="space-y-2">
                          {(evaluationData.industryBenchmarks?.competitorAnalysis || []).map((competitor, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{competitor.name}:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{competitor.score}</span>
                                <Badge variant={competitor.gap > 0 ? "destructive" : "default"} className="text-xs">
                                  {competitor.gap > 0 ? `+${competitor.gap}` : competitor.gap}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Insights */}
              {evaluationData.insights && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Professional Insights</CardTitle>
                    <CardDescription>Advanced analysis and strategic recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          AI Readiness: {evaluationData.insights.aiReadiness}
                        </h4>
                        {evaluationData?.insights?.riskFactors?.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-red-600 mb-2">Risk Factors:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {(evaluationData.insights?.riskFactors || []).map((risk, index) => (
                                <li key={index}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-green-600 mb-2">Opportunities:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {(evaluationData.insights?.opportunities || []).map((opportunity, index) => (
                              <li key={index}>• {opportunity}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Strategic Next Steps
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {(evaluationData.insights?.nextSteps || []).map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Discoverability Leaderboards */}
              {leaderboardData && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      AI Discoverability Leaderboards
                    </CardTitle>
                    <CardDescription>See how you compare to top brands in your category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 mb-4">
                      <h3 className="font-semibold text-purple-800 mb-2">🏆 Your Competitive Position</h3>
                      <p className="text-purple-700 text-sm mb-3">
                        Based on your score of {evaluationData.overallScore}/100, here's how you rank against similar brands:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-3 border">
                          <span className="text-purple-600 font-medium">Estimated Rank:</span>
                          <span className="ml-2 font-bold">#{Math.max(1, Math.floor((100 - evaluationData.overallScore) / 5))}</span>
                        </div>
                        <div className="bg-white rounded p-3 border">
                          <span className="text-purple-600 font-medium">Category:</span>
                          <span className="ml-2 font-bold">
                            {typeof leaderboardData.category === 'string' 
                              ? leaderboardData.category 
                              : (leaderboardData.category as any)?.niche || (leaderboardData.category as any)?.sector || 'General'}
                          </span>
                        </div>
                        <div className="bg-white rounded p-3 border">
                          <span className="text-purple-600 font-medium">Percentile:</span>
                          <span className="ml-2 font-bold">{Math.max(50, evaluationData.overallScore)}th</span>
                        </div>
                      </div>
                    </div>
                    
                    <LeaderboardTable
                      data={leaderboardData}
                      showFilters={false}
                    />
                    
                    <div className="text-center mt-4">
                      <Button variant="outline" asChild>
                        <Link href="/leaderboards">
                          View Full Leaderboards
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* User-Friendly Dimension Analysis */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">📊 How AI Sees Your Brand (Detailed Breakdown)</h2>
            <p className="text-gray-600 text-center mb-6">
              Each area shows how well AI can discover, understand, and recommend your brand.
              Click to see improvement opportunities and real AI examples.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(evaluationData.dimensionScores || []).map((dimension, index) => (
                <UserFriendlyDimensionCard
                  key={index}
                  dimension={dimension}
                  isConversationalCopy={dimension.name.toLowerCase().includes('conversational')}
                />
              ))}
            </div>
          </div>

          {/* AI Interaction Example */}
          {evaluationData?.dimensionScores?.length > 0 && (
            <div className="mb-8">
              <AIInteractionExample
                dimensionName={evaluationData.dimensionScores[0].name}
                currentExample={getAIInteractionExample(evaluationData.dimensionScores[0].name, evaluationData.dimensionScores[0].score).before}
                improvedExample={getAIInteractionExample(evaluationData.dimensionScores[0].name, evaluationData.dimensionScores[0].score).after}
                improvementDescription="Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
                brandName={evaluationData.brandName || url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]}
                websiteUrl={evaluationData.url}
                brandCategory={brandCategory}
              />
            </div>
          )}

          {/* Action Cards - Only show if not Enterprise tier */}
          {tier !== 'enterprise' && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Current Tier Features */}
              {tier === 'index-pro' && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-blue-700">✅ What You Can Do Now (Index Pro)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Share this frontier model report with your team</li>
                      <li>• Download comprehensive technical reports</li>
                      <li>• Access multi-model analysis insights</li>
                      <li>• Compare GPT-4, Claude, Perplexity & Gemini results</li>
                      <li>• Review model-specific recommendations below</li>
                    </ul>
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href={`/evaluate?url=${encodeURIComponent(evaluationData.url)}&tier=index-pro`}>
                        Re-run Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Free Tier Features */}
              {tier === 'free' && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-green-700">✅ What You Can Do Now (Free)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Basic GPT-4 analysis with core recommendations</li>
                      <li>• Download technical report</li>
                      <li>• View dimension breakdown</li>
                      <li>• Access priority action items</li>
                    </ul>
                    <Button className="w-full mt-4" variant="outline" asChild>
                      <Link href={`/evaluate?url=${encodeURIComponent(evaluationData.url)}&tier=free`}>
                        Re-run Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Upgrade Card */}
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-purple-700">
                    {tier === 'free' ? '🚀 Upgrade to Index Pro' : '🏢 Upgrade to Enterprise'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    {tier === 'free' ? (
                      <>
                        <li className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Multi-frontier model analysis (GPT-4, Claude, Perplexity, Gemini)
                        </li>
                        <li className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Advanced channel performance insights
                        </li>
                        <li className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Competitive positioning analysis
                        </li>
                        <li className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Comprehensive technical reports
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <Trophy className="h-4 w-4 mr-2" />
                          Executive snapshot reports (like Fortnum & Mason)
                        </li>
                        <li className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Custom brand playbook generation
                        </li>
                        <li className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Unlimited evaluations & monitoring
                        </li>
                        <li className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Advanced competitive intelligence
                        </li>
                        <li className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          White-label API access
                        </li>
                        <li className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Dedicated support & historical trends
                        </li>
                      </>
                    )}
                  </ul>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={async () => {
                      try {
                        const targetTier = tier === 'free' ? 'index-pro' : 'enterprise'
                        await createCheckoutSession(targetTier)
                      } catch (error) {
                        console.error('Checkout error:', error)
                        alert('Unable to start checkout. Please try again.')
                      }
                    }}
                  >
                    {tier === 'free'
                      ? '🚀 Upgrade to Index Pro - £119/month'
                      : '🏢 Upgrade to Enterprise - £319/month'
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enterprise Tier - Show Enterprise-only features */}
          {tier === 'enterprise' && (
            <div className="mb-8">
              <Card className="border-amber-200 bg-gradient-to-r from-yellow-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center">
                    <Crown className="h-5 w-5 mr-2" />
                    Enterprise Features Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">Advanced Analysis</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• All frontier models (GPT-4, Claude, Perplexity, Gemini)</li>
                        <li>• Executive snapshot reports</li>
                        <li>• Custom brand playbook generation</li>
                        <li>• Advanced competitive intelligence</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">Enterprise Tools</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Unlimited evaluations & monitoring</li>
                        <li>• White-label API access</li>
                        <li>• Dedicated support & historical trends</li>
                        <li>• Priority processing & custom integrations</li>
                      </ul>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <Link href={`/evaluate?url=${encodeURIComponent(evaluationData.url)}&tier=enterprise`}>
                      Re-run Enterprise Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Priority Action Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">�� Your Action Plan</h2>
            <p className="text-gray-600 text-center mb-6">
              Focus on these improvements for the biggest impact on your AI visibility.
              Each card shows the business impact, timeline, and effort required.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(evaluationData.recommendations || []).map((rec, index) => {
                const priority = getImprovementPriority(rec.score, rec.description)
                const implementationSteps = getImplementationSteps(rec.title)
                
                return (
                  <PriorityActionCard
                    key={index}
                    recommendation={rec}
                    businessImpact={getBusinessImpactForRecommendation(rec.title)}
                    timeline={priority.timeline}
                    effort={priority.effort}
                    expectedIncrease={priority.expectedIncrease}
                    implementationSteps={implementationSteps}
                    websiteUrl={evaluationData.url}
                    dimensionName={rec.title}
                  />
                )
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Want to improve these scores? Get detailed optimization guides and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={generateTechnicalReport} className="px-8 bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-5 w-5" />
                Download Executive Snapshot
              </Button>
              <Button
                size="lg"
                className="px-8"
                onClick={async () => {
                  try {
                    const tier = evaluationData.tier === 'index-pro' ? 'enterprise' : 'index-pro'
                    await createCheckoutSession(tier)
                  } catch (error) {
                    console.error('Error starting checkout:', error)
                    alert('Unable to start checkout. Please try again.')
                  }
                }}
              >
                {evaluationData.tier === 'free'
                  ? '�� Unlock GPT-4 + Perplexity - £119/month'
                  : '⚡ Add Claude Opus + Mistral - £319/month'
                }
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/">
                  Analyze Another URL
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}