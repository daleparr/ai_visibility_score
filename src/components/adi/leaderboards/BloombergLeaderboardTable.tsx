'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, TrendingDown, Minus, Trophy, Medal, Award, ExternalLink, 
  Download, GitCompare, Shield, Bell, Zap, Target, BarChart3, 
  ArrowUp, ArrowDown, Star, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react'
import { LeaderboardEntry, LeaderboardData } from '@/types/leaderboards'

interface BloombergLeaderboardTableProps {
  data: LeaderboardData
  onFilterChange?: (filters: any) => void
  showFilters?: boolean
}

export function BloombergLeaderboardTable({ data, onFilterChange, showFilters = true }: BloombergLeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<string>('rank')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <div className="flex items-center"><Trophy className="h-5 w-5 text-yellow-500 mr-1" /><span className="font-bold text-yellow-600">1st</span></div>
    if (rank === 2) return <div className="flex items-center"><Medal className="h-5 w-5 text-gray-400 mr-1" /><span className="font-bold text-gray-600">2nd</span></div>
    if (rank === 3) return <div className="flex items-center"><Award className="h-5 w-5 text-amber-600 mr-1" /><span className="font-bold text-amber-600">3rd</span></div>
    return <div className="text-lg font-bold text-gray-700">#{rank}</div>
  }

  const getTrendDisplay = (trend?: { direction: 'up' | 'down' | 'stable'; change: number }) => {
    if (!trend) return <div className="flex items-center text-gray-400"><Minus className="h-4 w-4" /></div>
    
    const isPositive = trend.direction === 'up'
    const isNegative = trend.direction === 'down'
    
    return (
      <div className={`flex items-center gap-1 ${
        isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
      }`}>
        {isPositive && <ArrowUp className="h-4 w-4" />}
        {isNegative && <ArrowDown className="h-4 w-4" />}
        {trend.direction === 'stable' && <Minus className="h-4 w-4" />}
        <span className="font-bold text-sm">
          {trend.change > 0 ? '+' : ''}{trend.change}
        </span>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    if (score >= 60) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getStrengthBadges = (entry: LeaderboardEntry) => {
    const badges = []
    
    // Determine strengths based on pillar scores
    if (entry.pillarScores.infrastructure >= 85) {
      badges.push({ icon: <CheckCircle className="h-3 w-3" />, label: 'Schema Ready', color: 'bg-green-100 text-green-700' })
    }
    if (entry.pillarScores.perception >= 85) {
      badges.push({ icon: <Star className="h-3 w-3" />, label: 'Strong Sentiment', color: 'bg-blue-100 text-blue-700' })
    }
    if (entry.pillarScores.commerce >= 85) {
      badges.push({ icon: <Target className="h-3 w-3" />, label: 'Commerce Ready', color: 'bg-purple-100 text-purple-700' })
    }
    
    return badges.slice(0, 2) // Max 2 strength badges
  }

  const getWeaknessBadges = (entry: LeaderboardEntry) => {
    const badges = []
    
    // Determine weaknesses based on pillar scores
    if (entry.pillarScores.infrastructure < 70) {
      badges.push({ icon: <XCircle className="h-3 w-3" />, label: 'Missing Schema', color: 'bg-red-100 text-red-700' })
    }
    if (entry.pillarScores.perception < 70) {
      badges.push({ icon: <AlertTriangle className="h-3 w-3" />, label: 'Low Visibility', color: 'bg-orange-100 text-orange-700' })
    }
    if (entry.pillarScores.commerce < 70) {
      badges.push({ icon: <XCircle className="h-3 w-3" />, label: 'Weak Commerce', color: 'bg-red-100 text-red-700' })
    }
    
    return badges.slice(0, 2) // Max 2 weakness badges
  }

  const generateSparklineData = (rank: number) => {
    // Generate realistic trend data for sparkline
    const baseScore = 95 - (rank * 3)
    const points = []
    for (let i = 0; i < 12; i++) {
      const variation = (Math.random() - 0.5) * 8
      points.push(Math.max(40, Math.min(100, baseScore + variation)))
    }
    return points
  }

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((value - min) / range) * 15
      return `${x},${y}`
    }).join(' ')
    
    const isUpward = data[data.length - 1] > data[0]
    
    return (
      <svg width="60" height="20" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isUpward ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
          className="opacity-80"
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bloomberg-Style Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              🏆 {data.category}: Global Top 20
              <Badge className="ml-3 bg-orange-500 text-white animate-pulse">LIVE</Badge>
            </h1>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="flex items-center"><BarChart3 className="h-4 w-4 mr-1" />Q1 2026 Update</span>
              <span className="flex items-center"><Zap className="h-4 w-4 mr-1" />Last Updated: {data.lastUpdated}</span>
              <span className="flex items-center"><Target className="h-4 w-4 mr-1" />{data.totalBrands} Brands Tracked</span>
            </div>
          </div>
          <div className="text-right">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              onClick={() => {
                // Navigate to evaluation page
                window.location.href = '/evaluate'
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Get Your AIDI Report
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{(data.sectorInsights?.averageScore || 75).toFixed(2)}</div>
            <div className="text-sm text-green-700">Sector Average</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.sectorInsights?.topPerformer || 'Supreme'}</div>
            <div className="text-sm text-blue-700">Top Performer</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{data.sectorInsights?.trendingUp?.length || 3}</div>
            <div className="text-sm text-orange-700">Trending Up</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{data.sectorInsights?.trendingDown?.length || 2}</div>
            <div className="text-sm text-red-700">Trending Down</div>
          </CardContent>
        </Card>
      </div>

      {/* League Table */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">League Table</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to comparison tool with top 3 brands pre-selected
                  const topBrands = data.entries.slice(0, 3).map(e => e.domain).join(',')
                  window.location.href = `/evaluate?compare=${topBrands}&mode=comparison`
                }}
              >
                <GitCompare className="h-4 w-4 mr-1" />
                Compare Brands
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to alerts setup page
                  window.location.href = '/dashboard?tab=alerts'
                }}
              >
                <Bell className="h-4 w-4 mr-1" />
                Set Alerts
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-slate-100 border-b font-semibold text-sm text-slate-700">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-2">Brand</div>
            <div className="col-span-1 text-center">AIDI Score</div>
            <div className="col-span-2">Strengths</div>
            <div className="col-span-2">Weaknesses</div>
            <div className="col-span-1 text-center">Movement</div>
            <div className="col-span-1 text-center">Trend</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-200">
            {data.entries.map((entry, index) => {
              const strengthBadges = getStrengthBadges(entry)
              const weaknessBadges = getWeaknessBadges(entry)
              const sparklineData = generateSparklineData(entry.rank)
              
              return (
                <div 
                  key={index} 
                  className={`grid grid-cols-12 gap-2 p-4 hover:bg-slate-50 transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center items-center">
                    {getRankDisplay(entry.rank)}
                  </div>

                  {/* Brand */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold">
                        {entry.brand.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{entry.brand}</div>
                        <div className="text-xs text-slate-500">{entry.domain}</div>
                      </div>
                    </div>
                  </div>

                  {/* AIDI Score */}
                  <div className="col-span-1 text-center">
                    <div className={`text-2xl font-bold px-2 py-1 rounded ${getScoreColor(entry.overallScore)}`}>
                      {entry.overallScore.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Grade {entry.grade}</div>
                  </div>

                  {/* Strengths */}
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {strengthBadges.map((badge, i) => (
                        <Badge key={i} className={`text-xs px-2 py-1 ${badge.color}`}>
                          {badge.icon}
                          <span className="ml-1">{badge.label}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-1">
                      {weaknessBadges.map((badge, i) => (
                        <Badge key={i} className={`text-xs px-2 py-1 ${badge.color}`}>
                          {badge.icon}
                          <span className="ml-1">{badge.label}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Movement */}
                  <div className="col-span-1 text-center">
                    {getTrendDisplay(entry.trend)}
                    {entry.trend && (
                      <div className="text-xs text-slate-500 mt-1">{entry.trend.period}</div>
                    )}
                  </div>

                  {/* Trend Sparkline */}
                  <div className="col-span-1 flex justify-center items-center">
                    {renderSparkline(sparklineData)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      onClick={() => window.open(`https://${entry.domain}`, '_blank')}
                      title="Visit Website"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-100"
                      onClick={() => {
                        // Navigate to evaluation page with comparison mode
                        window.location.href = `/evaluate?url=${entry.domain}&compare=${entry.brand}`
                      }}
                      title="Compare with My Brand"
                    >
                      <GitCompare className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-green-100"
                      onClick={() => {
                        // Generate and download brand report
                        const reportData = {
                          brand: entry.brand,
                          domain: entry.domain,
                          score: entry.overallScore,
                          grade: entry.grade,
                          rank: entry.rank,
                          category: data.category,
                          pillarScores: entry.pillarScores,
                          timestamp: new Date().toISOString()
                        }
                        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${entry.brand.toLowerCase().replace(/\s+/g, '-')}-adi-report.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      title="Download Report"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Intelligence Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top 5 Competitive Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.entries.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold">
                      {entry.brand.charAt(0)}
                    </div>
                    <span className="font-medium">{entry.brand}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{entry.pillarScores.infrastructure}</div>
                      <div className="text-slate-500">Tech</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{entry.pillarScores.perception}</div>
                      <div className="text-slate-500">Brand</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{entry.pillarScores.commerce}</div>
                      <div className="text-slate-500">Commerce</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Benchmarks */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Sector Benchmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sector Average</span>
                <div className="flex items-center gap-2">
                  <Progress value={data.sectorInsights?.averageScore || 75} className="w-20" />
                  <span className="font-bold">{data.sectorInsights?.averageScore || 75}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded p-3">
                <div className="text-sm font-medium mb-2">Common Patterns</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Strong: {data.sectorInsights?.commonStrengths?.[0] || 'Schema & Structured Data'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span>Weak: {data.sectorInsights?.commonWeaknesses?.[0] || 'Conversational Copy'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold">Ready to compete?</h3>
            <span className="text-slate-300">See where your brand ranks in this leaderboard</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Navigate to certification page or show info
                alert(`🏅 AIDI Certification\n\nEarn official AI Discoverability badges:\n• AI Shelf Leader (Top 10%)\n• Schema Ready Certified\n• Conversational Copy Excellence\n\nAnalyze your brand to qualify!`)
              }}
            >
              <Shield className="h-4 w-4 mr-1" />
              Get Certified
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                // Navigate to evaluation page
                window.location.href = '/evaluate'
              }}
            >
              <Zap className="h-4 w-4 mr-1" />
              Analyze My Brand
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}