'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Users, Globe, Download, RefreshCw, Calendar, Target, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface EvaluationLog {
  id: string
  timestamp: string
  url: string
  tier: string
  overallScore: number
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
  brandCategory?: any
  recommendations: any[]
  modelResults?: any[]
  industryBenchmarks?: any
}

interface AdminSummary {
  totalEvaluations: number
  freeEvaluations: number
  professionalEvaluations: number
  averageScore: number
  evaluationsByDate: Record<string, number>
  upsellOpportunities: Array<{ domain: string; evaluations: number }>
}

interface AdminData {
  evaluations: EvaluationLog[]
  summary: AdminSummary
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface AgentTrace {
  agentName: string
  agentType: string
  executionId: string
  timestamp: string
  duration: number
  input: {
    url: string
    websiteContent?: string
    parameters?: Record<string, any>
  }
  output: {
    score: number
    confidence: number
    reasoning: string
    evidence: string[]
    warnings?: string[]
    errors?: string[]
  }
  metadata: {
    model?: string
    provider?: string
    tokenUsage?: number
    retryCount?: number
    cacheHit?: boolean
  }
  status: 'success' | 'error' | 'timeout' | 'partial'
  debugInfo?: {
    rawResponse?: string
    processingSteps?: string[]
    validationResults?: Record<string, any>
  }
}

interface EvaluationTrace {
  evaluationId: string
  url: string
  tier: string
  timestamp: string
  totalDuration: number
  agentTraces: AgentTrace[]
  aggregationTrace: {
    pillarScores: Record<string, number>
    overallScore: number
    methodology: string
    weightings: Record<string, number>
  }
  issues: {
    failedAgents: string[]
    warnings: string[]
    dataQualityIssues: string[]
  }
}

interface TraceAnalytics {
  totalEvaluations: number
  averageDuration: number
  agentPerformance: Record<string, {
    successRate: number
    averageDuration: number
    averageScore: number
    totalExecutions: number
  }>
  commonIssues: Record<string, number>
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [refreshing, setRefreshing] = useState(false)
  
  // Trace-specific state
  const [traceData, setTraceData] = useState<EvaluationTrace[]>([])
  const [traceAnalytics, setTraceAnalytics] = useState<TraceAnalytics | null>(null)
  const [selectedTrace, setSelectedTrace] = useState<EvaluationTrace | null>(null)
  const [agentFilter, setAgentFilter] = useState<string>('all')

  const fetchAdminData = async (tier: string = 'all') => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams()
      if (tier !== 'all') params.append('tier', tier)
      params.append('limit', '100')
      
      const response = await fetch(`/api/admin/evaluations?${params}`)
      if (!response.ok) throw new Error('Failed to fetch admin data')
      
      const adminData = await response.json()
      setData(adminData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchTraceData = async () => {
    try {
      const [tracesResponse, analyticsResponse] = await Promise.all([
        fetch('/api/admin/traces?type=all&limit=100'),
        fetch('/api/admin/traces?type=analytics')
      ])
      
      if (tracesResponse.ok && analyticsResponse.ok) {
        const tracesData = await tracesResponse.json()
        const analyticsData = await analyticsResponse.json()
        
        setTraceData(tracesData.traces || [])
        setTraceAnalytics(analyticsData.analytics)
      }
    } catch (err) {
      console.error('Failed to fetch trace data:', err)
    }
  }

  useEffect(() => {
    fetchAdminData(tierFilter)
    fetchTraceData()
  }, [tierFilter])

  const handleRefresh = () => {
    fetchAdminData(tierFilter)
    fetchTraceData()
  }

  const exportEvaluations = () => {
    if (!data) return
    
    const csvContent = [
      ['Timestamp', 'URL', 'Tier', 'Overall Score', 'Infrastructure', 'Perception', 'Commerce', 'Brand Category'].join(','),
      ...data.evaluations.map(evaluation => [
        evaluation.timestamp,
        evaluation.url,
        evaluation.tier,
        evaluation.overallScore.toFixed(2),
        evaluation.pillarScores.infrastructure.toFixed(2),
        evaluation.pillarScores.perception.toFixed(2),
        evaluation.pillarScores.commerce.toFixed(2),
        evaluation.brandCategory?.niche || 'Unknown'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evaluations_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <Button onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor evaluations and identify upsell opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportEvaluations}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              All time evaluations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Tier</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.freeEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.freeEvaluations / data.summary.totalEvaluations) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professional Tier</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.professionalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.professionalEvaluations / data.summary.totalEvaluations) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              Across all evaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="evaluations" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="evaluations">Recent Evaluations</TabsTrigger>
            <TabsTrigger value="upsell">Upsell Opportunities</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free Tier Only</SelectItem>
              <SelectItem value="professional">Professional Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Evaluations</CardTitle>
              <CardDescription>
                Latest {data.evaluations.length} evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.evaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{evaluation.url}</span>
                        <Badge variant={evaluation.tier === 'professional' ? 'default' : 'secondary'}>
                          {evaluation.tier}
                        </Badge>
                        {evaluation.brandCategory && (
                          <Badge variant="outline">
                            {evaluation.brandCategory.niche}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Score: {evaluation.overallScore.toFixed(2)}/100 • 
                        {new Date(evaluation.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{evaluation.overallScore.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upsell" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                High-Value Upsell Opportunities
              </CardTitle>
              <CardDescription>
                Free tier users with multiple evaluations (3+ evaluations indicate high engagement)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.summary.upsellOpportunities.length > 0 ? (
                  data.summary.upsellOpportunities.map((opportunity, index) => (
                    <div key={opportunity.domain} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div>
                        <div className="font-medium">{opportunity.domain}</div>
                        <div className="text-sm text-gray-600">
                          {opportunity.evaluations} evaluations • High engagement user
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          Priority #{index + 1}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {opportunity.evaluations} evaluations
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No high-engagement users identified yet.
                    <br />
                    Users with 3+ evaluations will appear here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evaluation Trends
              </CardTitle>
              <CardDescription>
                Daily evaluation volume over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.summary.evaluationsByDate)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 10)
                  .map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{date}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((count / Math.max(...Object.values(data.summary.evaluationsByDate))) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}