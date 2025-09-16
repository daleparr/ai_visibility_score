'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  Activity, 
  Database, 
  Users, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'

interface TraceEntry {
  id: string
  timestamp: string
  agentName: string
  status: 'success' | 'failed' | 'running'
  executionTime: number
  brandId: string
  brandName: string
  errorMessage?: string
}

interface APIUsageStats {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  requestsToday: number
  requestsThisWeek: number
  requestsThisMonth: number
}

export default function AdminDashboard() {
  const [traces, setTraces] = useState<TraceEntry[]>([])
  const [apiStats, setApiStats] = useState<APIUsageStats>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    requestsToday: 0,
    requestsThisWeek: 0,
    requestsThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load traces
      const tracesResponse = await fetch('/api/admin/traces?type=all&limit=100')
      if (tracesResponse.ok) {
        const tracesData = await tracesResponse.json()
        setTraces(tracesData.traces || [])
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/admin/traces?type=analytics')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        const analytics = analyticsData.analytics
        if (analytics) {
          setApiStats({
            totalRequests: analytics.totalTraces || 0,
            successRate: analytics.successRate || 0,
            averageResponseTime: analytics.averageExecutionTime || 0,
            requestsToday: analytics.tracesToday || 0,
            requestsThisWeek: analytics.tracesThisWeek || 0,
            requestsThisMonth: analytics.tracesThisMonth || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'running': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'running': return <Clock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const exportTraces = () => {
    const dataStr = JSON.stringify(traces, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aidi-traces-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AIDI Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Agentic tracing and API usage monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportTraces}>
            <Download className="h-4 w-4 mr-2" />
            Export Traces
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Requests</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{apiStats.requestsToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(apiStats.successRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiStats.averageResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Traces</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {traces.filter(t => t.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="traces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traces">Agent Traces</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="traces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Executions</CardTitle>
              <CardDescription>
                Real-time monitoring of AIDI agent executions and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {traces.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No traces available</p>
                    <p className="text-sm">Agent executions will appear here</p>
                  </div>
                ) : (
                  traces.slice(0, 20).map((trace) => (
                    <div key={trace.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(trace.status)}>
                          {getStatusIcon(trace.status)}
                          <span className="ml-1">{trace.status}</span>
                        </Badge>
                        <div>
                          <p className="font-medium">{trace.agentName}</p>
                          <p className="text-sm text-gray-600">{trace.brandName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{trace.executionTime}ms</p>
                        <p className="text-xs text-gray-500">
                          {new Date(trace.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>API usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Today</span>
                    <span className="font-medium">{apiStats.requestsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week</span>
                    <span className="font-medium">{apiStats.requestsThisWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-medium">{apiStats.requestsThisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Success rates by agent type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Crawl Agent', 'Semantic Agent', 'Citation Agent', 'Commerce Agent'].map((agent) => {
                    const agentTraces = traces.filter(t => t.agentName.includes(agent.split(' ')[0]))
                    const successRate = agentTraces.length > 0 
                      ? (agentTraces.filter(t => t.status === 'success').length / agentTraces.length) * 100 
                      : 0
                    
                    return (
                      <div key={agent} className="flex justify-between">
                        <span>{agent}</span>
                        <span className="font-medium">{successRate.toFixed(1)}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>AIDI system settings and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trace Retention</p>
                    <p className="text-sm text-gray-600">How long to keep trace data</p>
                  </div>
                  <Badge variant="outline">30 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-refresh</p>
                    <p className="text-sm text-gray-600">Automatically refresh dashboard</p>
                  </div>
                  <Badge variant="outline">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alert Threshold</p>
                    <p className="text-sm text-gray-600">Error rate threshold for alerts</p>
                  </div>
                  <Badge variant="outline">5%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}