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
  ArrowRight
} from 'lucide-react'
import { getBrands, getEvaluations } from '@/lib/database'
import { formatDateTime, getGradeColor, formatScore } from '@/lib/utils'
import type { Brand, Evaluation } from '@/lib/db/schema'

export default function DashboardPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBrands: 0,
    totalEvaluations: 0,
    averageScore: 0,
    completedEvaluations: 0
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get current user ID from session (will work with NextAuth)
        const userId = 'demo-user-id' // Will be replaced with real session data
        
        const [brandsData] = await Promise.all([
          getBrands(userId)
        ])

        setBrands(brandsData)

        // Calculate stats
        const totalBrands = brandsData.length
        let totalEvaluations = 0
        let completedEvaluations = 0
        let totalScore = 0

        // Get evaluations for each brand
        const allEvaluations: Evaluation[] = []
        for (const brand of brandsData) {
          const evaluations = await getEvaluations(brand.id)
          allEvaluations.push(...evaluations)
          totalEvaluations += evaluations.length
          
          const completed = evaluations.filter(e => e.status === 'completed')
          completedEvaluations += completed.length
          
          const scores = completed
            .filter(e => e.overallScore !== null)
            .map(e => e.overallScore!)
          
          if (scores.length > 0) {
            totalScore += scores.reduce((sum, score) => sum + score, 0)
          }
        }

        setRecentEvaluations(allEvaluations.slice(0, 5))
        setStats({
          totalBrands,
          totalEvaluations,
          averageScore: completedEvaluations > 0 ? Math.round(totalScore / completedEvaluations) : 0,
          completedEvaluations
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor your AI visibility performance across all brands
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {stats.totalEvaluations > 0 
                ? Math.round((stats.completedEvaluations / stats.totalEvaluations) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluation completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Brands */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Brands</CardTitle>
            <CardDescription>
              Your most recently added brands
            </CardDescription>
          </CardHeader>
          <CardContent>
            {brands.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No brands yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first brand for evaluation.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <Link href="/dashboard/brands/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Brand
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {brands.slice(0, 5).map((brand) => (
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
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/brands/${brand.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {brands.length > 5 && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/brands">
                        View All Brands
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Evaluations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>
              Latest evaluation results and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start your first evaluation to see results here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(evaluation.status || 'pending')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Brand Evaluation
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(evaluation.status || 'pending')}
                          >
                            {evaluation.status}
                          </Badge>
                          {evaluation.overallScore && (
                            <Badge className={getGradeColor(evaluation.grade || 'F')}>
                              {formatScore(evaluation.overallScore)} / {evaluation.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {evaluation.createdAt ? formatDateTime(evaluation.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {brands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to improve your AI visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/dashboard/evaluations/new">
                  <BarChart3 className="h-5 w-5 mb-2" />
                  <span className="font-medium">Start New Evaluation</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Run a fresh AI visibility assessment
                  </span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/dashboard/brands/new">
                  <Plus className="h-5 w-5 mb-2" />
                  <span className="font-medium">Add New Brand</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Expand your brand portfolio
                  </span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start" asChild>
                <Link href="/dashboard/settings">
                  <TrendingUp className="h-5 w-5 mb-2" />
                  <span className="font-medium">Configure AI Providers</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Set up API keys for evaluations
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}