'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award, ExternalLink } from 'lucide-react'
import { LeaderboardEntry, LeaderboardData } from '@/types/leaderboards'

interface LeaderboardTableProps {
  data: LeaderboardData
  onFilterChange?: (filters: any) => void
  showFilters?: boolean
}

export function LeaderboardTable({ data, onFilterChange, showFilters = true }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<string>('rank')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getTrendIcon = (trend?: { direction: 'up' | 'down' | 'stable'; change: number }) => {
    if (!trend) return <Minus className="h-4 w-4 text-gray-400" />
    
    switch (trend.direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{data.title}</CardTitle>
            <p className="text-gray-600 mt-1">{data.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              {data.totalBrands} brands • Last updated {data.lastUpdated}
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {data.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="flex gap-4 mb-6">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="score">Overall Score</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="perception">Perception</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="trending-up">Trending Up</SelectItem>
                <SelectItem value="trending-down">Trending Down</SelectItem>
                <SelectItem value="top-performers">Top Performers (80+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sector Insights */}
        {data.sectorInsights && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">📊 Sector Insights</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Average Score:</span>
                <span className="ml-2 font-bold">{data.sectorInsights.averageScore}/100</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Top Performer:</span>
                <span className="ml-2 font-bold">{data.sectorInsights.topPerformer}</span>
              </div>
              <div>
                <span className="text-green-600 font-medium">Trending Up:</span>
                <span className="ml-2">{data.sectorInsights.trendingUp.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">Common Weakness:</span>
                <span className="ml-2">{data.sectorInsights.commonWeaknesses[0] || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="space-y-3">
          {data.entries.map((entry, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Brand Info */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{entry.brand}</h3>
                    <Button variant="ghost" size="sm" className="p-1">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">{entry.domain}</p>
                </div>

                {/* Overall Score */}
                <div className="col-span-2 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(entry.overallScore)}`}>
                    {entry.overallScore}
                  </div>
                  <Badge className={`text-xs ${getGradeColor(entry.grade)}`}>
                    Grade {entry.grade}
                  </Badge>
                </div>

                {/* Pillar Scores */}
                <div className="col-span-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{entry.pillarScores.infrastructure}</div>
                      <div className="text-gray-500">Tech</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{entry.pillarScores.perception}</div>
                      <div className="text-gray-500">Brand</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">{entry.pillarScores.commerce}</div>
                      <div className="text-gray-500">Commerce</div>
                    </div>
                  </div>
                </div>

                {/* Strength/Gap */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <span className="text-green-600 font-medium">💪 Strength:</span>
                      <span className="ml-1 text-gray-700">{entry.strengthHighlight.dimension}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-red-600 font-medium">⚠️ Gap:</span>
                      <span className="ml-1 text-gray-700">{entry.gapHighlight.dimension}</span>
                    </div>
                  </div>
                </div>

                {/* Trend */}
                <div className="col-span-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(entry.trend)}
                    {entry.trend && (
                      <span className={`text-xs font-medium ${
                        entry.trend.direction === 'up' ? 'text-green-600' : 
                        entry.trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {entry.trend.change > 0 ? '+' : ''}{entry.trend.change}
                      </span>
                    )}
                  </div>
                  {entry.trend && (
                    <div className="text-xs text-gray-500 mt-1">{entry.trend.period}</div>
                  )}
                </div>
              </div>

              {/* Expandable Details */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 rounded p-2 border border-green-200">
                    <span className="font-medium text-green-800">✅ {entry.strengthHighlight.dimension}:</span>
                    <span className="ml-1 text-green-700">{entry.strengthHighlight.description}</span>
                  </div>
                  <div className="bg-red-50 rounded p-2 border border-red-200">
                    <span className="font-medium text-red-800">❌ {entry.gapHighlight.dimension}:</span>
                    <span className="ml-1 text-red-700">{entry.gapHighlight.description}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {data.entries.length >= 10 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Load More Brands
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}