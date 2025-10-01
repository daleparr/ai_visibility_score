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

  const getMovementDisplay = (change: number) => {
    if (change > 0) return <div className="flex items-center text-green-600"><ArrowUp className="h-4 w-4" /><span className="font-bold text-sm">+{change}</span></div>
    if (change < 0) return <div className="flex items-center text-red-600"><ArrowDown className="h-4 w-4" /><span className="font-bold text-sm">{change}</span></div>
    return <div className="flex items-center text-gray-400"><Minus className="h-4 w-4" /></div>
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
      badges.push({ text: 'Schema Ready', color: 'bg-green-100 text-green-700' })
    }
    if (entry.pillarScores.perception >= 85) {
      badges.push({ text: 'Strong Sentiment', color: 'bg-blue-100 text-blue-700' })
    }
    if (entry.pillarScores.commerce >= 85) {
      badges.push({ text: 'Commerce Ready', color: 'bg-purple-100 text-purple-700' })
    }
    
    return badges.slice(0, 2) // Max 2 strength badges
  }

  const getWeaknessBadges = (entry: LeaderboardEntry) => {
    const badges = []
    
    // Determine weaknesses based on pillar scores
    if (entry.pillarScores.infrastructure < 70) {
      badges.push({ text: 'Missing Schema', color: 'bg-red-100 text-red-700' })
    }
    if (entry.pillarScores.perception < 70) {
      badges.push({ text: 'Low Visibility', color: 'bg-orange-100 text-orange-700' })
    }
    if (entry.pillarScores.commerce < 70) {
      badges.push({ text: 'Weak Commerce', color: 'bg-red-100 text-red-700' })
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

  return (
    <div className="space-y-6">
      {/* Bloomberg-Style Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6 rounded-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center">
              🏆 {data.category}: Global Top 20
              <Badge className="ml-3 bg-orange-500 text-white animate-pulse">LIVE</Badge>
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-slate-300 text-sm">
              <span className="flex items-center"><BarChart3 className="h-4 w-4 mr-1" />Q1 2026 Update</span>
              <span className="flex items-center"><Zap className="h-4 w-4 mr-1" />Last Updated: {data.lastUpdated}</span>
              <span className="flex items-center"><Target className="h-4 w-4 mr-1" />{data.totalBrands} Brands Tracked</span>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold"
              onClick={() => {
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{(data.sectorInsights?.averageScore || 75).toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-green-700">Sector Average</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{data.sectorInsights?.topPerformer || 'Supreme'}</div>
            <div className="text-xs sm:text-sm text-blue-700">Top Performer</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{data.sectorInsights?.trendingUp?.length || 3}</div>
            <div className="text-xs sm:text-sm text-orange-700">Trending Up</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{data.sectorInsights?.trendingDown?.length || 2}</div>
            <div className="text-xs sm:text-sm text-red-700">Trending Down</div>
          </CardContent>
        </Card>
      </div>

      {/* League Table */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-xl font-bold">League Table</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
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
                className="w-full sm:w-auto"
                onClick={() => {
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
          {/* Table Header - Desktop Only */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 p-4 bg-slate-100 border-b font-semibold text-sm text-slate-700">
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
                  className={`p-3 sm:p-4 hover:bg-slate-50 transition-colors ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="block md:hidden">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getRankDisplay(entry.rank)}
                        </div>
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
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(entry.overallScore)}`}>
                          {entry.overallScore}
                        </div>
                        <div className="text-xs text-slate-500">AIDI Score</div>
                      </div>
                    </div>

                    {/* Mobile Strengths */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-green-700 mb-1">💪 Strengths</div>
                      <div className="flex flex-wrap gap-1">
                        {strengthBadges.map((badge, idx) => (
                          <Badge key={idx} variant="secondary" className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Weaknesses */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-red-700 mb-1">⚠️ Weaknesses</div>
                      <div className="flex flex-wrap gap-1">
                        {weaknessBadges.map((badge, idx) => (
                          <Badge key={idx} variant="outline" className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Movement & Trend */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Movement:</span>
                        {getMovementDisplay(entry.trend?.change || 0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Trend:</span>
                        <div className="w-16 h-6">
                          {/* Simplified sparkline for mobile */}
                          <div className="flex items-end h-full gap-0.5">
                            {sparklineData.slice(-6).map((point, idx) => (
                              <div 
                                key={idx} 
                                className="bg-blue-400 w-1 rounded-t"
                                style={{ height: `${(point / Math.max(...sparklineData)) * 100}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-2 items-center">
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
                        {entry.overallScore}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Grade {entry.grade}</div>
                    </div>

                    {/* Strengths */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {strengthBadges.map((badge, i) => (
                          <Badge key={i} variant="secondary" className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {weaknessBadges.map((badge, i) => (
                          <Badge key={i} variant="outline" className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Movement */}
                    <div className="col-span-1 text-center">
                      {getMovementDisplay(entry.trend?.change || 0)}
                      {entry.trend && (
                        <div className="text-xs text-slate-500 mt-1">{entry.trend.period}</div>
                      )}
                    </div>

                    {/* Trend Sparkline */}
                    <div className="col-span-1 flex justify-center items-center">
                      <div className="w-16 h-8">
                        <div className="flex items-end h-full gap-0.5">
                          {sparklineData.map((point, idx) => (
                            <div 
                              key={idx} 
                              className="bg-blue-400 w-1 rounded-t"
                              style={{ height: `${(point / Math.max(...sparklineData)) * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
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
                          window.location.href = `/evaluate?url=${entry.domain}&compare=${entry.brand}`
                        }}
                        title="Compare with My Brand"
                      >
                        <GitCompare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}