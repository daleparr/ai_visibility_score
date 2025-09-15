'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, TrendingUp, BarChart3, Globe, Building, Factory, Target, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LeaderboardTable } from '@/components/adi/leaderboards/LeaderboardTable'
import { LeaderboardData, LEADERBOARD_CATEGORIES } from '@/types/leaderboards'
import { getUniqueSectors, getCategoriesBySector, getAllCategories } from '@/lib/brand-taxonomy'

export default function LeaderboardsPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'global' | 'sector' | 'industry' | 'niche'>('niche')
  const [selectedCategory, setSelectedCategory] = useState<string>('Luxury Fashion Houses')
  const [availableCategories, setAvailableCategories] = useState<any>({
    sectors: [],
    industries: [],
    niches: []
  })

  // Load dynamic categories on component mount
  useEffect(() => {
    loadAvailableCategories()
  }, [])

  useEffect(() => {
    fetchLeaderboardData()
  }, [selectedType, selectedCategory])

  const fetchLeaderboardData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: selectedType,
        ...(selectedCategory && { category: selectedCategory })
      })
      
      const response = await fetch(`/api/leaderboards?${params}`)
      const data = await response.json()
      setLeaderboardData(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'global': return <Globe className="h-4 w-4" />
      case 'sector': return <Building className="h-4 w-4" />
      case 'industry': return <Factory className="h-4 w-4" />
      case 'niche': return <Target className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const loadAvailableCategories = async () => {
    try {
      const response = await fetch('/api/brand-categorization?action=categories')
      const data = await response.json()
      
      if (data.availableFilters) {
        setAvailableCategories(data.availableFilters)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      // Fallback to static categories
      setAvailableCategories({
        sectors: getUniqueSectors(),
        industries: [...new Set(getAllCategories().map(c => c.industry))],
        niches: getAllCategories().map(c => c.niche)
      })
    }
  }

  const getCategoriesForType = (type: string) => {
    switch (type) {
      case 'global': return ['All Brands']
      case 'sector': return availableCategories.sectors || []
      case 'industry': return availableCategories.industries || []
      case 'niche': return availableCategories.niches || []
      default: return []
    }
  }

  const getCategoryDescription = (type: string, category: string) => {
    if (type === 'niche') {
      const allCategories = getAllCategories()
      const categoryData = allCategories.find(c => c.niche === category)
      return categoryData ? `${categoryData.emoji} ${categoryData.sector} > ${categoryData.industry}` : ''
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 mb-4">
              <Brain className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">AI Visibility Score</span>
            </Link>
            <h1 className="text-4xl font-bold mb-4">🏆 AI Discoverability Leaderboards</h1>
            <p className="text-xl text-gray-600 mb-6">
              See how top brands rank in AI visibility across different sectors and niches
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Professional Feature
            </Badge>
          </div>

          {/* Leaderboard Type Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Choose Your Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="global" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Global
                  </TabsTrigger>
                  <TabsTrigger value="sector" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Sector
                  </TabsTrigger>
                  <TabsTrigger value="industry" className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    Industry
                  </TabsTrigger>
                  <TabsTrigger value="niche" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Niche
                  </TabsTrigger>
                </TabsList>

                <div className="mt-4 space-y-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoriesForType(selectedType).map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Category Description */}
                  {selectedType === 'niche' && selectedCategory && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 border">
                      <span className="font-medium">Category Path:</span> {getCategoryDescription(selectedType, selectedCategory)}
                    </div>
                  )}
                </div>

                <TabsContent value="global" className="mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">🌍 Global Leaderboard</h3>
                    <p className="text-blue-700 text-sm">
                      Top brands across all sectors ranked by overall AI discoverability. 
                      See who's winning the AI recommendation game globally.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="sector" className="mt-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">🏢 Sector Leaderboards</h3>
                    <p className="text-green-700 text-sm">
                      Compare brands within broad sectors like Retail, Beauty, Electronics, and Travel. 
                      Perfect for understanding sector-wide AI visibility trends.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="industry" className="mt-6">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">🏭 Industry Leaderboards</h3>
                    <p className="text-purple-700 text-sm">
                      Dive deeper into specific industries like Fashion Retail, Grocery, or Luxury. 
                      See direct competitors and industry leaders.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="niche" className="mt-6">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2" />
                      🎯 Dynamic Niche Leaderboards
                    </h3>
                    <p className="text-orange-700 text-sm mb-3">
                      Ultra-specific categories with intelligent brand categorization across 7 sectors and 35+ niches.
                      Our AI automatically detects brand peer groups for accurate competitive analysis.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white rounded px-2 py-1 border border-orange-200">
                        <span className="font-medium">👕 Fashion:</span> 5 niches
                      </div>
                      <div className="bg-white rounded px-2 py-1 border border-orange-200">
                        <span className="font-medium">💄 Beauty:</span> 4 niches
                      </div>
                      <div className="bg-white rounded px-2 py-1 border border-orange-200">
                        <span className="font-medium">🛍️ Retail:</span> 4 niches
                      </div>
                      <div className="bg-white rounded px-2 py-1 border border-orange-200">
                        <span className="font-medium">🏠 Home:</span> 3 niches
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Leaderboard Data */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leaderboard data...</p>
              </CardContent>
            </Card>
          ) : leaderboardData ? (
            <LeaderboardTable data={leaderboardData} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No leaderboard data available</p>
              </CardContent>
            </Card>
          )}

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600">
                  Track how brands move up and down the rankings over time. 
                  See who's gaining AI visibility and who's falling behind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Competitive Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">
                  Understand your competitive position and identify gaps. 
                  See what top performers do differently.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-purple-700 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-600">
                  Discover sector-wide strengths and weaknesses. 
                  Find opportunities where entire industries are underperforming.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Want to see your brand on the leaderboard?</h2>
            <p className="text-gray-600 mb-6">
              Get your AI Visibility Score and see how you compare to industry leaders
            </p>
            <Button size="lg" asChild>
              <Link href="/">
                Analyze Your Brand
                <TrendingUp className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}