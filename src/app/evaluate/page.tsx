'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, Search, BarChart3, Zap, Shield, TrendingUp, Download, Lock, Star } from 'lucide-react'
import Link from 'next/link'
import { ExecutiveSummary } from '@/components/adi/reporting/ExecutiveSummary'
import { UserFriendlyDimensionCard } from '@/components/adi/reporting/UserFriendlyDimensionCard'
import { PriorityActionCard } from '@/components/adi/reporting/PriorityActionCard'
import { AIInteractionExample } from '@/components/adi/reporting/AIInteractionExample'
import {
  getImprovementPriority,
  getAIInteractionExample,
  getImplementationSteps,
  getBusinessImpactForRecommendation
} from '@/lib/report-utils'

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
}

export default function EvaluatePage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || 'example.com'
  const tier = searchParams.get('tier') || 'free'
  const [isLoading, setIsLoading] = useState(true)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runEvaluation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, tier }),
        })

        if (!response.ok) {
          throw new Error('Failed to run evaluation')
        }

        const data = await response.json()
        setEvaluationData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
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
                <span className="text-xl font-bold">AI Visibility Score</span>
              </Link>
              <h1 className="text-3xl font-bold mb-2">Analyzing Your Brand</h1>
              <p className="text-gray-600">Testing {url} across {tier === 'free' ? 'GPT-4' : '5+ AI models'}...</p>
            </div>

            {/* Loading Animation */}
            <Card className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold mb-4">Running AI Visibility Analysis</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Crawling website content...</p>
                  <p>✓ Testing {tier === 'free' ? 'GPT-4' : 'ChatGPT, Claude, Gemini'} responses...</p>
                  <p>✓ Analyzing schema and structured data...</p>
                  <p>⏳ Evaluating 12 key dimensions...</p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  {tier === 'free' ? 'Free analysis with GPT-4' : 'Premium multi-model analysis'} • Usually takes 2-3 minutes
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
      score: evaluationData.pillarScores.infrastructure,
      color: 'text-brand-600',
      icon: <Zap className="h-6 w-6" />,
      description: 'How well AI can parse your digital footprint'
    },
    {
      name: 'Perception & Reputation',
      score: evaluationData.pillarScores.perception,
      color: 'text-success-600',
      icon: <Search className="h-6 w-6" />,
      description: 'How AI understands your brand value'
    },
    {
      name: 'Commerce & Customer Experience',
      score: evaluationData.pillarScores.commerce,
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
              <span className="text-xl font-bold">AI Visibility Score</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">AI Visibility Report</h1>
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
                {evaluationData.aiProviders.map((provider, index) => (
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
              {/* ADI Certification */}
              {evaluationData.certification && (
                <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{evaluationData.certification.badge}</span>
                      <div>
                        <div>ADI Certification: {evaluationData.certification.level}</div>
                        <div className="text-sm text-gray-600">Valid until {evaluationData.certification.validUntil}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {evaluationData.certification.achievements.map((achievement, index) => (
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
                      {evaluationData.modelResults.map((model, index) => (
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
                                {model.strengths.join(', ')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-red-600 mb-1">Areas for Improvement:</div>
                              <div className="text-xs text-gray-600">
                                {model.weaknesses.join(', ')}
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
                          {evaluationData.industryBenchmarks.competitorAnalysis.map((competitor, index) => (
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
                        {evaluationData.insights.riskFactors.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-red-600 mb-2">Risk Factors:</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {evaluationData.insights.riskFactors.map((risk, index) => (
                                <li key={index}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-green-600 mb-2">Opportunities:</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {evaluationData.insights.opportunities.map((opportunity, index) => (
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
                          {evaluationData.insights.nextSteps.map((step, index) => (
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
              {evaluationData.dimensionScores.map((dimension, index) => (
                <UserFriendlyDimensionCard
                  key={index}
                  dimension={dimension}
                  isConversationalCopy={dimension.name.toLowerCase().includes('conversational')}
                />
              ))}
            </div>
          </div>

          {/* AI Interaction Example */}
          {evaluationData.dimensionScores.length > 0 && (
            <div className="mb-8">
              <AIInteractionExample
                dimensionName={evaluationData.dimensionScores[0].name}
                currentExample={getAIInteractionExample(evaluationData.dimensionScores[0].name, evaluationData.dimensionScores[0].score).before}
                improvedExample={getAIInteractionExample(evaluationData.dimensionScores[0].name, evaluationData.dimensionScores[0].score).after}
                improvementDescription="Better structured data and content organization helps AI give more accurate, detailed responses about your brand."
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
                <CardTitle className="text-brand-700">🚀 Unlock Premium Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF/Excel reports
                  </li>
                  <li className="flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Detailed optimization guides
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Industry benchmarking
                  </li>
                  <li className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Multi-model comparison ({evaluationData.aiProviders.length > 1 ? 'Active' : 'Available'})
                  </li>
                </ul>
                <Button className="w-full">
                  Upgrade to Premium - $49
                  <Lock className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Priority Action Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">🚀 Your Action Plan</h2>
            <p className="text-gray-600 text-center mb-6">
              Focus on these improvements for the biggest impact on your AI visibility.
              Each card shows the business impact, timeline, and effort required.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evaluationData.recommendations.map((rec, index) => {
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
              <Button size="lg" className="px-8">
                Upgrade to Premium - $49
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