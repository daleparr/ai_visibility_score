'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Award,
  Calendar,
  Info
} from 'lucide-react'
import { federatedLearning } from '@/lib/federated-learning/engine'
import type { IndustryBenchmark } from '@/lib/federated-learning/types'

interface IndustryBenchmarkCardProps {
  userIndustry: string
  userScore?: number
  subscriptionTier: 'free' | 'professional' | 'enterprise'
  className?: string
}

export function IndustryBenchmarkCard({ 
  userIndustry, 
  userScore = 0,
  subscriptionTier, 
  className 
}: IndustryBenchmarkCardProps) {
  const [benchmark, setBenchmark] = useState<IndustryBenchmark | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBenchmark = async () => {
      try {
        const industryBenchmark = await federatedLearning.getIndustryBenchmark(userIndustry)
        setBenchmark(industryBenchmark)
      } catch (error) {
        console.error('Error loading industry benchmark:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBenchmark()
  }, [userIndustry])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Industry Benchmarks
          </CardTitle>
          <CardDescription>Loading industry performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!benchmark) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Industry Benchmarks
          </CardTitle>
          <CardDescription>No benchmark data available for this industry</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getUserPercentile = () => {
    if (!userScore) return 0
    
    const { p25Score, medianScore, p75Score, p90Score } = benchmark.benchmarks
    
    if (userScore >= p90Score) return 90
    if (userScore >= p75Score) return 75
    if (userScore >= medianScore) return 50
    if (userScore >= p25Score) return 25
    return 10
  }

  const getPerformanceLevel = () => {
    const percentile = getUserPercentile()
    if (percentile >= 90) return { label: 'Top Performer', color: 'text-green-600', bg: 'bg-green-50' }
    if (percentile >= 75) return { label: 'Above Average', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (percentile >= 50) return { label: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (percentile >= 25) return { label: 'Below Average', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { label: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const performance = getPerformanceLevel()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-green-500" />
          Industry Benchmarks
          <Badge variant="outline" className="ml-auto capitalize">
            {benchmark.industryCategory}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Based on {benchmark.sampleSize} companies
          <Calendar className="h-4 w-4 ml-2" />
          Updated {new Date(benchmark.lastUpdated).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Performance vs Industry */}
        {userScore > 0 && (
          <div className={`p-4 rounded-lg ${performance.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Your Performance</span>
              <Badge className={performance.color}>
                {getUserPercentile()}th percentile
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">{userScore}</div>
              <div className="flex-1">
                <div className={`text-sm ${performance.color} font-medium`}>
                  {performance.label}
                </div>
                <Progress 
                  value={getUserPercentile()} 
                  className="h-2 mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Industry Score Distribution */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Score Distribution
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Top Performer (90th percentile)</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{benchmark.benchmarks.p90Score}</Badge>
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Above Average (75th percentile)</span>
              <Badge variant="outline">{benchmark.benchmarks.p75Score}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Industry Median</span>
              <Badge variant="outline">{benchmark.benchmarks.medianScore}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Below Average (25th percentile)</span>
              <Badge variant="outline">{benchmark.benchmarks.p25Score}</Badge>
            </div>
          </div>
        </div>

        {/* Industry Strengths & Weaknesses */}
        {subscriptionTier !== 'free' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Common Strengths
              </h4>
              <div className="space-y-2">
                {benchmark.benchmarks.commonStrengths.slice(0, 3).map((strength, index) => (
                  <div key={index} className="text-sm p-2 bg-green-50 rounded">
                    {strength}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Common Weaknesses
              </h4>
              <div className="space-y-2">
                {benchmark.benchmarks.commonWeaknesses.slice(0, 3).map((weakness, index) => (
                  <div key={index} className="text-sm p-2 bg-red-50 rounded">
                    {weakness}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Industry Trends */}
        {subscriptionTier === 'enterprise' && benchmark.trends.scoreEvolution.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Industry Trends (Last 12 Months)</h4>
            <div className="space-y-2">
              {benchmark.trends.scoreEvolution.slice(-6).map((trend, index) => (
                <div key={trend.month} className="flex items-center justify-between text-sm">
                  <span>{new Date(trend.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  <div className="flex items-center gap-2">
                    <span>{Math.round(trend.score)}</span>
                    {index > 0 && (
                      <span className={`text-xs ${
                        trend.score > benchmark.trends.scoreEvolution[benchmark.trends.scoreEvolution.length - 6 + index - 1].score 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {trend.score > benchmark.trends.scoreEvolution[benchmark.trends.scoreEvolution.length - 6 + index - 1].score 
                          ? '↗' 
                          : '↘'
                        }
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emerging Patterns */}
        {subscriptionTier !== 'free' && benchmark.trends.emergingPatterns.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Emerging Patterns
            </h4>
            <div className="space-y-2">
              {benchmark.trends.emergingPatterns.slice(0, 3).map((pattern, index) => (
                <div key={index} className="text-sm p-2 bg-blue-50 rounded flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Patterns */}
        {subscriptionTier === 'enterprise' && benchmark.benchmarks.improvementPatterns.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Successful Improvement Patterns</h4>
            <div className="space-y-2">
              {benchmark.benchmarks.improvementPatterns.slice(0, 3).map((pattern, index) => (
                <div key={index} className="text-sm p-2 bg-purple-50 rounded">
                  {pattern}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompts */}
        {subscriptionTier === 'free' && (
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              Unlock detailed industry insights, trends, and competitive analysis
            </p>
            <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Upgrade to Professional
            </button>
          </div>
        )}

        {subscriptionTier === 'professional' && (
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <p className="text-sm text-purple-700 mb-2">
              Get advanced trend analysis and improvement pattern insights
            </p>
            <button className="text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Upgrade to Enterprise
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}