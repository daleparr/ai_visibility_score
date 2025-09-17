'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExecutiveSummary } from '@/components/adi/reporting/ExecutiveSummary'
import { PillarBreakdown } from '@/components/adi/executive/PillarBreakdown'
import { ScoreGauge } from '@/components/adi/executive/ScoreGauge'
import { RadarChart } from '@/components/adi/analysis/RadarChart'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface BrandEvaluation {
  id: string
  brandName: string
  websiteUrl: string
  overallScore: number
  grade: string
  dimensionScores: Array<{
    name: string
    score: number
    pillar: string
    confidence: number
  }>
  pillarScores: Array<{
    pillar: string
    score: number
    weight: number
  }>
  performance: {
    executionTime: number
    agentsExecuted: number
    successRate: number
  }
  recommendations: Array<{
    priority: string
    title: string
    description: string
  }>
  timestamp: string
  status: string
}

export default function BrandDetailsPage() {
  const params = useParams()
  const brandId = params.brandId as string
  const [evaluation, setEvaluation] = useState<BrandEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrandEvaluation = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if this is a mock brand ID
        if (brandId.startsWith('mock_')) {
          // Generate mock data for demo purposes
          const mockEvaluation: BrandEvaluation = {
            id: brandId,
            brandName: 'Demo Brand',
            websiteUrl: 'https://example.com',
            overallScore: 72,
            grade: 'B',
            dimensionScores: [
              { name: 'Schema & Structured Data', score: 85, pillar: 'infrastructure', confidence: 0.9 },
              { name: 'Semantic Clarity', score: 78, pillar: 'infrastructure', confidence: 0.8 },
              { name: 'Knowledge Graphs', score: 65, pillar: 'infrastructure', confidence: 0.7 },
              { name: 'LLM Readability', score: 82, pillar: 'infrastructure', confidence: 0.85 },
              { name: 'Geographic Visibility', score: 70, pillar: 'perception', confidence: 0.75 },
              { name: 'AI Answer Quality', score: 68, pillar: 'perception', confidence: 0.8 },
              { name: 'Citation Authority', score: 75, pillar: 'perception', confidence: 0.9 },
              { name: 'Reputation Signals', score: 73, pillar: 'perception', confidence: 0.85 },
              { name: 'Hero Products', score: 80, pillar: 'commerce', confidence: 0.8 },
              { name: 'Policies Clarity', score: 77, pillar: 'commerce', confidence: 0.75 }
            ],
            pillarScores: [
              { pillar: 'infrastructure', score: 77, weight: 0.4 },
              { pillar: 'perception', score: 71, weight: 0.47 },
              { pillar: 'commerce', score: 78, weight: 0.13 }
            ],
            performance: {
              executionTime: 5024,
              agentsExecuted: 12,
              successRate: 0.83
            },
            recommendations: [
              {
                priority: 'high',
                title: 'Improve Knowledge Graph Integration',
                description: 'Enhance entity linking and structured data markup to improve AI understanding'
              },
              {
                priority: 'medium',
                title: 'Optimize Geographic Presence',
                description: 'Expand local SEO and geographic visibility signals'
              },
              {
                priority: 'low',
                title: 'Enhance AI Answer Quality',
                description: 'Improve content structure for better AI-generated responses'
              }
            ],
            timestamp: new Date().toISOString(),
            status: 'completed'
          }
          setEvaluation(mockEvaluation)
        } else {
          // For real brand IDs, fetch from API
          const response = await fetch(`/api/brands/${brandId}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch brand: ${response.status}`)
          }
          const data = await response.json()
          setEvaluation(data)
        }
      } catch (err) {
        console.error('Error fetching brand evaluation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load brand evaluation')
      } finally {
        setLoading(false)
      }
    }

    if (brandId) {
      fetchBrandEvaluation()
    }
  }, [brandId])

  const handleReEvaluate = async () => {
    if (!evaluation) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: evaluation.websiteUrl })
      })
      
      if (response.ok) {
        // Refresh the page data
        window.location.reload()
      }
    } catch (err) {
      console.error('Re-evaluation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading brand evaluation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Brand Not Found</CardTitle>
              <CardDescription>The requested brand evaluation could not be found.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{evaluation.brandName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <a 
                href={evaluation.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {evaluation.websiteUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
              <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                {evaluation.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleReEvaluate} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-evaluate
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreGauge score={evaluation.overallScore} grade={evaluation.grade} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Execution Time</span>
              <span className="text-sm font-medium">{(evaluation.performance.executionTime / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Agents Executed</span>
              <span className="text-sm font-medium">{evaluation.performance.agentsExecuted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="text-sm font-medium">{(evaluation.performance.successRate * 100).toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {new Date(evaluation.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pillars">Pillar Breakdown</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ExecutiveSummary
            overallScore={evaluation.overallScore}
            url={evaluation.websiteUrl}
            tier="professional"
            pillarScores={{
              infrastructure: evaluation.pillarScores.find(p => p.pillar === 'infrastructure')?.score || 0,
              perception: evaluation.pillarScores.find(p => p.pillar === 'perception')?.score || 0,
              commerce: evaluation.pillarScores.find(p => p.pillar === 'commerce')?.score || 0
            }}
          />
        </TabsContent>

        <TabsContent value="pillars" className="space-y-4">
          <PillarBreakdown pillars={evaluation.pillarScores.map(p => ({
            name: p.pillar as 'infrastructure' | 'perception' | 'commerce',
            score: p.score,
            weight: p.weight,
            trend: 'stable' as const,
            change: 0
          }))} />
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dimension Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart data={evaluation.dimensionScores.map(d => ({
                  dimension: d.name,
                  score: d.score,
                  maxScore: 100,
                  pillar: d.pillar,
                  confidence: d.confidence
                }))} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {evaluation.dimensionScores.map((dimension, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dimension.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{dimension.pillar}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{dimension.score}/100</p>
                      <p className="text-sm text-muted-foreground">
                        {(dimension.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {evaluation.recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant={
                      rec.priority === 'high' ? 'destructive' : 
                      rec.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{rec.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}