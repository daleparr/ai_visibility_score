'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, Search, BarChart3, Zap, Shield, TrendingUp, Download, Lock, Star } from 'lucide-react'
import Link from 'next/link'

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
            <p className="text-gray-600 mb-4">Analysis for <span className="font-semibold">{evaluationData.url}</span></p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Overall Score: <span className={`font-bold ml-1 ${getScoreColor(evaluationData.overallScore)}`}>{evaluationData.overallScore}/100</span>
              </Badge>
              <Badge variant="outline">
                {evaluationData.isDemo ? 'Demo Mode' : 'Live Analysis'} • {evaluationData.aiProviders.length} AI Model{evaluationData.aiProviders.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Overall Score Card */}
          <Card className="mb-8 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Your AI Visibility Score</CardTitle>
              <CardDescription>How well AI models can discover, understand, and recommend your brand</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold ${getScoreColor(evaluationData.overallScore)} mb-2`}>
                  {evaluationData.overallScore}
                </div>
                <div className="text-gray-500">out of 100</div>
                <Progress value={evaluationData.overallScore} className="w-full max-w-md mx-auto mt-4" />
              </div>
              
              {/* Pillar Scores */}
              <div className="grid md:grid-cols-3 gap-6">
                {pillarScores.map((pillar, index) => (
                  <div key={index} className="text-center">
                    <div className={`${pillar.color} mb-2 flex justify-center`}>
                      {pillar.icon}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{pillar.name}</h3>
                    <div className={`text-2xl font-bold ${getScoreColor(pillar.score)}`}>
                      {pillar.score}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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

          {/* Detailed Dimension Scores */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {evaluationData.dimensionScores.map((dimension, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{dimension.name}</CardTitle>
                    <Badge variant={getScoreBadgeVariant(dimension.score)}>
                      {dimension.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={dimension.score} className="mb-2" />
                  <p className="text-xs text-gray-600">{dimension.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

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

          {/* Basic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
              <CardDescription>Priority actions to improve your AI visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge variant={getPriorityColor(rec.priority)} className="mt-1 capitalize">
                      {rec.priority}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-gray-600">Score: {rec.score}/100 - {rec.description}</p>
                      <p className="text-xs text-gray-500 mt-1">💡 Upgrade for detailed implementation guide</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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