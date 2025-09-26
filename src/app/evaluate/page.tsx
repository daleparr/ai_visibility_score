'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, Search, BarChart3, Zap, Shield, TrendingUp, Download, Lock, Star, Trophy, Globe } from 'lucide-react'
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

interface DimensionScore {
  name: string
  score: number
  description: string
  pillar: 'infrastructure' | 'perception' | 'commerce'
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
  // Professional tier features
  modelResults?: Array<{
    provider: string
    model: string
    score: number
    confidence: number
    strengths: string[]
    weaknesses: string[]
    recommendation: string
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
  const tier = searchParams.get('tier') || 'free'
  const [isLoading, setIsLoading] = useState(true)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [brandCategory, setBrandCategory] = useState<any>(null)
  const [performanceProfile, setPerformanceProfile] = useState<AIDIPerformanceProfile | null>(null)

  const generateTechnicalReport = async () => {
    if (!evaluationData) return

    const reportContent = `
# AI Visibility Technical Report
## ${evaluationData.url}

**Generated:** ${new Date().toLocaleString()}
**Analysis Tier:** ${evaluationData.tier.toUpperCase()}
**Overall AIDI Score:** ${evaluationData.overallScore.toFixed(2)}/100

## Executive Summary
${evaluationData.tier === 'index-pro' ? 'Index Pro multi-model analysis' : 'Standard GPT-4 analysis'} conducted on ${evaluationData.url}.
Overall AI Discoverability Index (AIDI) score of ${evaluationData.overallScore.toFixed(2)}/100 indicates ${evaluationData.overallScore >= 80 ? 'strong' : evaluationData.overallScore >= 60 ? 'moderate' : 'weak'} AI visibility.

## Pillar Breakdown
### 🏗️ Infrastructure & Machine Readability: ${evaluationData.pillarScores?.infrastructure?.toFixed(2) || 'N/A'}/100
How easily AI can parse and understand your brand's digital footprint.

### 🎯 Perception & Reputation: ${evaluationData.pillarScores?.perception?.toFixed(2) || 'N/A'}/100
How well AI understands your brand matters and positioning.

### 🛒 Commerce & Transaction Clarity: ${evaluationData.pillarScores?.commerce?.toFixed(2) || 'N/A'}/100
How AI helps customers buy from you.

## Dimension Analysis
${(evaluationData.dimensionScores || []).map(dim => `
### ${dim.name}: ${dim.score.toFixed(2)}/100
**Pillar:** ${dim.pillar.charAt(0).toUpperCase() + dim.pillar.slice(1)}
**Description:** ${dim.description}
`).join('')}

## Priority Recommendations
${(evaluationData.recommendations || []).map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} PRIORITY)
**Current Score:** ${rec.score.toFixed(2)}/100
**Description:** ${rec.description}
`).join('')}

${evaluationData.tier === 'index-pro' ? `
## Multi-Model Analysis Results
${evaluationData.modelResults?.map(model => `
### ${model.model}
**Score:** ${model.score.toFixed(2)}/100
**Confidence:** ${(model.confidence * 100).toFixed(1)}%
**Strengths:** ${model.strengths.join(', ')}
**Weaknesses:** ${model.weaknesses.join(', ')}
**Recommendation:** ${model.recommendation}
`).join('') || ''}

## Industry Benchmarks
${evaluationData.industryBenchmarks ? `
**Industry:** ${evaluationData.industryBenchmarks.industry}
**Your Rank:** #${evaluationData.industryBenchmarks.yourRank} of ${evaluationData.industryBenchmarks.totalCompanies}
**Percentile:** ${evaluationData.industryBenchmarks.percentile}th percentile
**Industry Median:** ${evaluationData.industryBenchmarks.industryMedian.toFixed(2)}/100
**Top Performer:** ${evaluationData.industryBenchmarks.topPerformer.toFixed(2)}/100
` : ''}

## Certification Status
${evaluationData.certification ? `
**Level:** ${evaluationData.certification.level}
**Badge:** ${evaluationData.certification.badge}
**Valid Until:** ${evaluationData.certification.validUntil}
**Achievements:** ${evaluationData.certification.achievements.join(', ')}
` : 'No certification achieved'}
` : ''}

## Technical Implementation Notes
- Analysis Method: ${evaluationData.analysisMethod || 'Standard AIDI Framework'}
- AI Providers: ${evaluationData.aiProviders.join(', ')}
- Default Model: ${evaluationData.defaultModel}

## Next Steps
1. Review priority recommendations above
2. Download implementation guides for each dimension
3. Monitor score improvements over time
4. Consider upgrading to Professional tier for multi-model analysis

---
*Report generated by AI Discoverability Index*
*For technical support: support@ai-discoverability-index.com*
    `.trim()

    // Create and download the report as PDF
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(20)
    pdf.text('AI Visibility Technical Report', 20, 30)
    
    // Add content (simplified for PDF format)
    pdf.setFontSize(12)
    const lines = reportContent.split('\n').filter(line => line.trim())
    let yPosition = 50
    
    lines.forEach((line, index) => {
      if (yPosition > 270) { // Start new page if needed
        pdf.addPage()
        yPosition = 30
      }
      
      // Remove markdown formatting for PDF
      const cleanLine = line.replace(/[#*`]/g, '').trim()
      if (cleanLine) {
        pdf.text(cleanLine, 20, yPosition)
        yPosition += 7
      }
    })
    
    // Download PDF
    pdf.save(`AI_Visibility_Technical_Report_${evaluationData.url.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)

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
          modelResults: data.modelResults,
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
            
            const statusResponse = await fetch(`/api/evaluation/${evaluationId}/status`)
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4">
                <Brain className="h-6 w-6 mr-2" />
                <span className="text-xl font-bold">AI Discoverability Index</span>
              </Link>
              <h1 className="text-3xl font-bold mb-2">Analyzing Your Brand</h1>
              <p className="text-gray-600">
                {tier === 'free' 
                  ? 'Testing www.nike.com with GPT-3.5 Turbo...' 
                  : tier === 'index-pro'
                  ? 'Running GPT-4 + Perplexity AI analysis...'
                  : 'Testing across GPT-4, Claude Opus, and Mistral Large...'}
              </p>
            </div>

            {/* Loading Animation */}
            <Card className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold mb-4">Running AI Visibility Analysis</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Crawling website content...</p>
                  <p>✓ Running {tier === 'free' ? 'GPT-3.5' : tier === 'index-pro' ? 'GPT-4' : 'multi-model'} probe tests...</p>
                  <p>✓ Analyzing schema and structured data...</p>
                  {tier !== 'free' && (
                    <p>✓ Enhancing with real-time web search...</p>
                  )}
                  <p>⏳ Evaluating 12 key dimensions...</p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {tier === 'free' 
                    ? 'Free analysis with GPT-3.5 Turbo • Usually takes 2-3 minutes' 
                    : tier === 'index-pro'
                    ? 'GPT-4 + Perplexity AI analysis • Usually takes 3-4 minutes'
                    : 'Multi-model enterprise analysis • Usually takes 4-5 minutes'}
                </p>
              </div>
            </Card>
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

          {/* AI Models Used */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Models Analyzed</CardTitle>
              <CardDescription>
                {tier === 'free' 
                  ? 'Free tier uses GPT-4 for comprehensive analysis' 
                  : 'Premium analysis across multiple frontier models'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(evaluationData.aiProviders || []).map((provider, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {provider === 'openai' ? 'ChatGPT (GPT-4)' : 
                     provider === 'anthropic' ? 'Claude-3-Sonnet' :
                     provider === 'google' ? 'Gemini-Pro' :
                     provider === 'mistral' ? 'Mistral-Large' :
                     provider === 'llama' ? 'LLaMA-2-70B' : provider}
                  </Badge>
                ))}
                {tier === 'free' && (
                  <Badge variant="secondary" className="ml-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade for multi-model comparison
                  </Badge>
                )}
              </div>
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
              {evaluationData.modelResults && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Multi-Model Analysis Results</CardTitle>
                    <CardDescription>Individual AI model evaluations and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(evaluationData.modelResults || []).map((model, index) => (
                        <Card key={index} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm">{model.model}</CardTitle>
                              <Badge variant={getScoreBadgeVariant(Math.round(model.score))}>
                                {Math.round(model.score)}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Confidence: {Math.round(model.confidence * 100)}%
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <div className="text-xs font-medium text-green-600 mb-1">Strengths:</div>
                              <div className="text-xs text-gray-600">
                                {(model.strengths || []).join(', ')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-red-600 mb-1">Areas for Improvement:</div>
                              <div className="text-xs text-gray-600">
                                {(model.weaknesses || []).join(', ')}
                              </div>
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              💡 {model.recommendation}
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
                          <span className="ml-2 font-bold">{leaderboardData.category}</span>
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

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free Actions */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700">✅ What You Can Do Now (Free)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Share this report with your team</li>
                  <li>• Bookmark for future reference</li>
                  <li>• Compare with competitors manually</li>
                  <li>• Review basic recommendations below</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={`/evaluate?url=${encodeURIComponent(evaluationData.url)}`}>
                    Re-run Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Actions */}
            <Card className="border-brand-200 bg-brand-50/50">
              <CardHeader>
                <CardTitle className="text-brand-700">💎 Upgrade to Index Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    GPT-4 enhanced analysis (+40% accuracy)
                  </li>
                  <li className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Real-time web search with Perplexity AI
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    25 evaluations per month
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Advanced competitive intelligence
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Priority processing & support
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={async () => {
                    try {
                      const tier = evaluationData.tier === 'free' ? 'index-pro' : 'enterprise'
                      await createCheckoutSession(tier)
                    } catch (error) {
                      console.error('Error starting checkout:', error)
                      alert('Unable to start checkout. Please try again.')
                    }
                  }}
                >
                  {evaluationData.tier === 'free'
                    ? 'Upgrade to Index Pro - £29/month'
                    : 'Upgrade to Enterprise - £199/month'
                  }
                </Button>
              </CardContent>
            </Card>
          </div>

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
                Download Technical Report
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