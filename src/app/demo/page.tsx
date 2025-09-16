'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  TrendingUp, 
  Building2, 
  BarChart3, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Brain
} from 'lucide-react'
import { mockBrands, mockEvaluations } from '@/lib/demo-mode'

export default function DemoPage() {
  const [brands] = useState(mockBrands)
  const [recentEvaluations] = useState(mockEvaluations)
  const [stats] = useState({
    totalBrands: mockBrands.length,
    totalEvaluations: mockEvaluations.length,
    averageScore: 85,
    completedEvaluations: mockEvaluations.filter(e => e.status === 'completed').length
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'running':
        return <Clock className="h-4 w-4 text-warning-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-danger-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800'
      case 'running':
        return 'bg-warning-100 text-warning-800'
      case 'failed':
        return 'bg-danger-100 text-danger-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return 'N/A'
    
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'N/A'
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(dateObj)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-brand-600" />
              <span className="text-2xl font-bold gradient-text">AI Visibility Score</span>
              <Badge variant="secondary" className="ml-2">Demo Mode</Badge>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link href="/demo/adi">
                <Button>View AIDI Dashboard</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Demo Notice */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">🎯 Demo Mode Active</h2>
          <p className="text-blue-700">
            You're viewing the AI Visibility Score platform with sample data. This demonstrates the full UI and functionality without requiring authentication or database setup.
          </p>
        </div>

        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor your AI visibility performance across all brands
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                Brands under evaluation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvaluations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedEvaluations} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                Across all completed evaluations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.completedEvaluations / stats.totalEvaluations) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Evaluation completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Brands */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Brands</CardTitle>
              <CardDescription>
                Sample brands for testing the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brands.map((brand) => (
                  <div key={brand.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-brand-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-brand-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{brand.name}</p>
                        <p className="text-xs text-gray-500">{brand.websiteUrl}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Evaluations</CardTitle>
              <CardDescription>
                Sample evaluation results and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(evaluation.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Brand Evaluation
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(evaluation.status)}
                          >
                            {evaluation.status}
                          </Badge>
                          {evaluation.overallScore && (
                            <Badge className="bg-brand-100 text-brand-700">
                              {evaluation.overallScore} / {evaluation.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDateTime(evaluation.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Features</CardTitle>
            <CardDescription>
              Explore the AI Visibility Score platform capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <BarChart3 className="h-5 w-5 mb-2" />
                <span className="font-medium">View Evaluation Results</span>
                <span className="text-xs text-muted-foreground mt-1">
                  See detailed AI visibility assessments
                </span>
              </Button>
              
              <Link href="/demo/adi">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start w-full">
                  <TrendingUp className="h-5 w-5 mb-2" />
                  <span className="font-medium">AIDI Premium Dashboard</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Advanced AI Discoverability Index
                  </span>
                </Button>
              </Link>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Plus className="h-5 w-5 mb-2" />
                <span className="font-medium">Test Brand Onboarding</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Experience the brand setup flow
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}