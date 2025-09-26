'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Brain, TrendingUp, BarChart3, Globe, Building, Factory, Target, Sparkles,
  Zap, Bell, Download, GitCompare, Shield, ExternalLink, ArrowRight, Lock
} from 'lucide-react'
import Link from 'next/link'
import { BloombergLeaderboardTable } from '@/components/adi/leaderboards/BloombergLeaderboardTable'
import { LeaderboardData, LEADERBOARD_CATEGORIES } from '@/types/leaderboards'
import { getUniqueSectors, getCategoriesBySector, getAllCategories } from '@/lib/brand-taxonomy'
import { createCheckoutSession } from '@/lib/stripe-client'
import BurgerMenu from '@/components/navigation/BurgerMenu'

export default function LeaderboardsPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'global' | 'sector' | 'industry' | 'niche'>('niche')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [availableCategories, setAvailableCategories] = useState<any>({
    sectors: [],
    industries: [],
    niches: []
  })
  const [currentTime, setCurrentTime] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<'free' | 'index-pro' | 'enterprise'>('free')

  // Load dynamic categories on component mount
  useEffect(() => {
    loadAvailableCategories()
    // Set current time on client side to avoid hydration mismatch
    setCurrentTime(new Date().toLocaleString())
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Update selected category when type changes
  useEffect(() => {
    const categories = getCategoriesForType(selectedType)
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0])
    }
  }, [selectedType, availableCategories])

  useEffect(() => {
    if (selectedCategory) {
      fetchLeaderboardData()
    }
  }, [selectedType, selectedCategory])

  const loadAvailableCategories = async () => {
    try {
      setError(null)
      const response = await fetch('/api/brand-categorization?action=categories')
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.availableFilters) {
        setAvailableCategories(data.availableFilters)
        
        // Set initial category based on type
        const initialCategories = {
          global: ['All Brands'],
          sector: data.availableFilters.sectors,
          industry: data.availableFilters.industries,
          niche: data.availableFilters.niches
        }
        
        const typeCategories = initialCategories[selectedType] || []
        if (typeCategories.length > 0) {
          setSelectedCategory(typeCategories[0])
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      setError('Failed to load categories. Using fallback data.')
      
      // Fallback to static categories
      const fallbackCategories = {
        sectors: getUniqueSectors(),
        industries: [...new Set(getAllCategories().map(c => c.industry))],
        niches: getAllCategories().map(c => c.niche)
      }
      setAvailableCategories(fallbackCategories)
      
      // Set initial category for fallback
      const typeCategories = {
        global: ['All Brands'],
        sector: fallbackCategories.sectors,
        industry: fallbackCategories.industries,
        niche: fallbackCategories.niches
      }[selectedType] || []
      
      if (typeCategories.length > 0) {
        setSelectedCategory(typeCategories[0])
      }
    }
  }

  const fetchLeaderboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        type: selectedType,
        ...(selectedCategory && { category: selectedCategory })
      })
      
      const response = await fetch(`/api/leaderboards?${params}`)
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      setLeaderboardData(data)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
      setError('Failed to load leaderboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoriesForType = (type: string) => {
    switch (type) {
      case 'global': return ['All Brands']
      case 'sector': return availableCategories.sectors || getUniqueSectors()
      case 'industry': return availableCategories.industries || [...new Set(getAllCategories().map(c => c.industry))]
      case 'niche': return availableCategories.niches || getAllCategories().map(c => c.niche)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'global': return <Globe className="h-4 w-4" />
      case 'sector': return <Building className="h-4 w-4" />
      case 'industry': return <Factory className="h-4 w-4" />
      case 'niche': return <Target className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <>
      <BurgerMenu />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Bloomberg-Style Terminal Header */}
          <div className="bg-black text-green-400 p-4 rounded-t-lg border border-green-500 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center text-green-400 hover:text-green-300">
                  <Brain className="h-5 w-5 mr-2" />
                  <span className="font-bold">AI DISCOVERABILITY TERMINAL</span>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">LIVE DATA FEED</span>
                </div>
              </div>
              <div className="text-xs text-green-300">
                {currentTime} UTC
              </div>
            </div>
          </div>

          {/* Category Selection Terminal */}
          <div className="bg-slate-800 text-white p-6 border-x border-green-500">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Button
                variant={selectedType === 'global' ? 'default' : 'outline'}
                onClick={() => setSelectedType('global')}
                className={`${selectedType === 'global' ? 'bg-green-600 text-white' : 'border-green-500 text-green-400 hover:bg-green-900'}`}
              >
                <Globe className="h-4 w-4 mr-2" />
                GLOBAL
              </Button>
              <Button
                variant={selectedType === 'sector' ? 'default' : 'outline'}
                onClick={() => setSelectedType('sector')}
                className={`${selectedType === 'sector' ? 'bg-green-600 text-white' : 'border-green-500 text-green-400 hover:bg-green-900'}`}
              >
                <Building className="h-4 w-4 mr-2" />
                SECTOR
              </Button>
              <Button
                variant={selectedType === 'industry' ? 'default' : 'outline'}
                onClick={() => setSelectedType('industry')}
                className={`${selectedType === 'industry' ? 'bg-green-600 text-white' : 'border-green-500 text-green-400 hover:bg-green-900'}`}
              >
                <Factory className="h-4 w-4 mr-2" />
                INDUSTRY
              </Button>
              <Button
                variant={selectedType === 'niche' ? 'default' : 'outline'}
                onClick={() => setSelectedType('niche')}
                className={`${selectedType === 'niche' ? 'bg-green-600 text-white' : 'border-green-500 text-green-400 hover:bg-green-900'}`}
              >
                <Target className="h-4 w-4 mr-2" />
                NICHE
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-700 border-green-500 text-white">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-green-500">
                    {getCategoriesForType(selectedType).map((category: string) => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedType === 'niche' && selectedCategory && (
                <div className="text-sm text-green-300 font-mono">
                  {getCategoryDescription(selectedType, selectedCategory)}
                </div>
              )}
            </div>
          </div>

          {/* FOMO Alert Bar */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 border-x border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                <span className="font-bold">MARKET ALERT:</span>
                <span>3 brands moved up this week • Rankings updated daily • Don't fall behind</span>
              </div>
              <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50 font-bold">
                Track My Brand
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Main Leaderboard */}
          <div className="bg-white border-x border-b border-green-500 rounded-b-lg">
            {userTier === 'free' ? (
              <div className="py-16 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <Lock className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-2xl font-bold mb-4">Premium Leaderboards</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Access competitive intelligence and industry rankings with Index Pro or Enterprise.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          await createCheckoutSession('index-pro')
                        } catch (error) {
                          console.error('Error starting checkout:', error)
                          alert('Unable to start checkout. Please try again.')
                        }
                      }}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Upgrade to Index Pro - £119/month
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => window.location.href = '/demo'}
                    >
                      View Demo
                    </Button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-mono">LOADING MARKET DATA...</p>
              </div>
            ) : leaderboardData ? (
              <BloombergLeaderboardTable data={leaderboardData} />
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 font-mono">NO DATA AVAILABLE</p>
                {error && (
                  <p className="text-red-600 font-mono text-sm mt-2">Check console for details</p>
                )}
              </div>
            )}
          </div>

          {/* Competitive Intelligence Dashboard */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white border-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-100 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Sector Average:</span>
                    <span className="font-bold text-blue-100">{leaderboardData?.sectorInsights?.averageScore || 75}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Top Performer:</span>
                    <span className="font-bold text-blue-100">{leaderboardData?.sectorInsights?.topPerformer || 'Supreme'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Your Opportunity:</span>
                    <span className="font-bold text-yellow-300">+{Math.floor(Math.random() * 15) + 5} points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900 to-green-800 text-white border-green-600">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-green-200 text-sm">Rising Stars:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(leaderboardData?.sectorInsights?.trendingUp || ['Supreme', 'Palace']).map(brand => (
                        <Badge key={brand} className="bg-green-700 text-green-100 text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-200 text-sm">Falling Behind:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(leaderboardData?.sectorInsights?.trendingDown || ['Brand X']).map(brand => (
                        <Badge key={brand} className="bg-red-700 text-red-100 text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 text-white border-purple-600">
              <CardHeader>
                <CardTitle className="text-purple-100 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Certification Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-300 mb-1">Top 10%</div>
                    <div className="text-purple-200 text-sm">AIDI Certification Available</div>
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                    <Shield className="h-4 w-4 mr-2" />
                    Claim Your Badge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            <Button
              className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              onClick={() => {
                // Generate sample report download
                const reportData = {
                  category: selectedCategory,
                  type: selectedType,
                  timestamp: new Date().toISOString(),
                  data: leaderboardData
                }
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${selectedCategory}_leaderboard_report.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <div className="text-center">
                <Download className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-bold">Download Report</div>
              </div>
            </Button>
            
            <Button
              className="h-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              onClick={() => window.location.href = '/evaluate?mode=comparison'}
            >
              <div className="text-center">
                <GitCompare className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-bold">Compare Brands</div>
              </div>
            </Button>
            
            <Button
              className="h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              onClick={() => {
                // Navigate to AIDI trends dashboard with alerts
                window.location.href = '/dashboard/adi/trends'
              }}
            >
              <div className="text-center">
                <Bell className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-bold">Set Alerts</div>
              </div>
            </Button>
            
            {userTier === 'index-pro' ? (
              <Button
                className="h-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                onClick={() => window.location.href = '/pricing'}
              >
                <div className="text-center">
                  <Shield className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-bold">Upgrade to Enterprise</div>
                  <div className="text-xs opacity-90">£319</div>
                </div>
              </Button>
            ) : (
              <Button
                className="h-16 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
                onClick={() => window.location.href = '/evaluate'}
              >
                <div className="text-center">
                  <Zap className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm font-bold">Analyze My Brand</div>
                </div>
              </Button>
            )}
          </div>

          {/* Market Overview */}
          <div className="mt-8 bg-slate-100 rounded-lg p-6 border border-slate-300">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-orange-500" />
              AI Discoverability Market Overview
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded p-3 border border-slate-200">
                <div className="font-semibold text-slate-700 mb-1">👕 Fashion & Apparel</div>
                <div className="text-slate-600">5 niches • Avg: 78/100</div>
                <div className="text-xs text-green-600 mt-1">↗ +2.3 this quarter</div>
              </div>
              <div className="bg-white rounded p-3 border border-slate-200">
                <div className="font-semibold text-slate-700 mb-1">💄 Beauty & Personal Care</div>
                <div className="text-slate-600">4 niches • Avg: 82/100</div>
                <div className="text-xs text-green-600 mt-1">↗ +1.8 this quarter</div>
              </div>
              <div className="bg-white rounded p-3 border border-slate-200">
                <div className="font-semibold text-slate-700 mb-1">🛍️ Multi-Brand Retail</div>
                <div className="text-slate-600">4 niches • Avg: 85/100</div>
                <div className="text-xs text-red-600 mt-1">↘ -0.5 this quarter</div>
              </div>
              <div className="bg-white rounded p-3 border border-slate-200">
                <div className="font-semibold text-slate-700 mb-1">📱 Consumer Electronics</div>
                <div className="text-slate-600">3 niches • Avg: 88/100</div>
                <div className="text-xs text-green-600 mt-1">↗ +3.1 this quarter</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-lg border border-slate-600">
            <h3 className="text-xl font-bold mb-4">📈 Executive Summary</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">Market Leaders</h4>
                <p className="text-sm text-slate-300">
                  Top performers excel in schema implementation and knowledge graph presence. 
                  Average score gap between #1 and #10: 15 points.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">Opportunity Areas</h4>
                <p className="text-sm text-slate-300">
                  Conversational copy optimization shows biggest ROI potential. 
                  Brands improving this dimension see +8 point average gains.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">Market Dynamics</h4>
                <p className="text-sm text-slate-300">
                  AI visibility directly correlates with revenue growth. 
                  Top quartile brands show 23% higher customer acquisition.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Don't Get Left Behind</h2>
              <p className="text-xl mb-6 opacity-90">
                Your competitors are already optimizing for AI. See where you rank.
              </p>
              <div className="flex justify-center gap-4">
                {userTier === 'index-pro' ? (
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50 font-bold"
                    onClick={async () => {
                      try {
                        await createCheckoutSession('enterprise')
                      } catch (error) {
                        console.error('Error starting checkout:', error)
                        alert('Unable to start checkout. Please try again.')
                      }
                    }}
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Upgrade to Enterprise - £319
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold"
                    onClick={() => window.location.href = '/evaluate'}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Get My AIDI Score
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-orange-600 font-bold"
                  onClick={() => window.location.href = '/demo'}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  View Sample Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}