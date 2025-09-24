'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Shield, TrendingUp, BarChart3, Lock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { BloombergLeaderboardTable } from '@/components/adi/leaderboards/BloombergLeaderboardTable'
import { LeaderboardData } from '@/types/leaderboards'

// Sample demo data to showcase the leaderboard interface
const demoLeaderboardData: LeaderboardData = {
  leaderboardType: 'niche',
  category: "Luxury Fashion Houses",
  title: "Luxury Fashion Houses - AI Discoverability Rankings",
  description: "How top luxury fashion brands rank in AI model recommendations and discoverability",
  totalBrands: 5,
  lastUpdated: new Date().toISOString(),
  entries: [
    {
      rank: 1,
      brand: "Supreme",
      domain: "supremenewyork.com",
      overallScore: 94,
      grade: "A+",
      pillarScores: {
        infrastructure: 92,
        perception: 96,
        commerce: 94
      },
      dimensionScores: [
        { name: 'Citation Strength', score: 98, pillar: 'perception' },
        { name: 'Brand Heritage', score: 97, pillar: 'perception' },
        { name: 'Product Identification', score: 92, pillar: 'commerce' },
        { name: 'Schema & Structured Data', score: 90, pillar: 'infrastructure' }
      ],
      strengthHighlight: {
        dimension: 'Citation Strength',
        score: 98,
        description: 'Exceptional media mentions and authority citations'
      },
      gapHighlight: {
        dimension: 'Geographic Visibility',
        score: 85,
        description: 'Limited regional store presence in AI responses'
      },
      lastUpdated: new Date().toISOString(),
      trend: { direction: 'up', change: 3, period: 'Q4 2024' }
    },
    {
      rank: 2,
      brand: "Palace",
      domain: "palaceskateboards.com",
      overallScore: 91,
      grade: "A",
      pillarScores: {
        infrastructure: 89,
        perception: 93,
        commerce: 91
      },
      dimensionScores: [
        { name: 'Brand Heritage', score: 95, pillar: 'perception' },
        { name: 'LLM Readability', score: 91, pillar: 'infrastructure' },
        { name: 'Product Identification', score: 89, pillar: 'commerce' }
      ],
      strengthHighlight: {
        dimension: 'Brand Heritage',
        score: 95,
        description: 'Strong skateboarding culture recognition'
      },
      gapHighlight: {
        dimension: 'Transaction Clarity',
        score: 82,
        description: 'Drop system complexity affects recommendations'
      },
      lastUpdated: new Date().toISOString(),
      trend: { direction: 'up', change: 2, period: 'Q4 2024' }
    },
    {
      rank: 3,
      brand: "Stone Island",
      domain: "stoneisland.com",
      overallScore: 88,
      grade: "A-",
      pillarScores: {
        infrastructure: 90,
        perception: 85,
        commerce: 89
      },
      dimensionScores: [
        { name: 'Schema & Structured Data', score: 93, pillar: 'infrastructure' },
        { name: 'Product Identification', score: 91, pillar: 'commerce' },
        { name: 'Citation Strength', score: 83, pillar: 'perception' }
      ],
      strengthHighlight: {
        dimension: 'Schema & Structured Data',
        score: 93,
        description: 'Excellent technical infrastructure'
      },
      gapHighlight: {
        dimension: 'Geographic Visibility',
        score: 78,
        description: 'Limited presence in non-European markets'
      },
      lastUpdated: new Date().toISOString(),
      trend: { direction: 'stable', change: 0, period: 'Q4 2024' }
    },
    {
      rank: 4,
      brand: "Off-White",
      domain: "off---white.com",
      overallScore: 85,
      grade: "B+",
      pillarScores: {
        infrastructure: 82,
        perception: 88,
        commerce: 85
      },
      dimensionScores: [
        { name: 'Brand Heritage', score: 90, pillar: 'perception' },
        { name: 'Citation Strength', score: 86, pillar: 'perception' },
        { name: 'Product Identification', score: 83, pillar: 'commerce' }
      ],
      strengthHighlight: {
        dimension: 'Brand Heritage',
        score: 90,
        description: 'Strong Virgil Abloh legacy recognition'
      },
      gapHighlight: {
        dimension: 'Transaction Clarity',
        score: 75,
        description: 'Complex pricing and availability information'
      },
      lastUpdated: new Date().toISOString(),
      trend: { direction: 'down', change: -2, period: 'Q4 2024' }
    },
    {
      rank: 5,
      brand: "Fear of God",
      domain: "fearofgod.com",
      overallScore: 82,
      grade: "B",
      pillarScores: {
        infrastructure: 80,
        perception: 84,
        commerce: 82
      },
      dimensionScores: [
        { name: 'Brand Heritage', score: 87, pillar: 'perception' },
        { name: 'Product Identification', score: 85, pillar: 'commerce' },
        { name: 'LLM Readability', score: 78, pillar: 'infrastructure' }
      ],
      strengthHighlight: {
        dimension: 'Brand Heritage',
        score: 87,
        description: 'Jerry Lorenzo influence well-recognized'
      },
      gapHighlight: {
        dimension: 'Geographic Visibility',
        score: 72,
        description: 'Limited international market presence'
      },
      lastUpdated: new Date().toISOString(),
      trend: { direction: 'stable', change: 1, period: 'Q4 2024' }
    }
  ],
  sectorInsights: {
    averageScore: 88,
    topPerformer: "Supreme",
    commonStrengths: ["Brand Heritage", "Citation Strength"],
    commonWeaknesses: ["Geographic Visibility", "Transaction Clarity"],
    trendingUp: ["Supreme", "Palace"],
    trendingDown: ["Off-White"]
  }
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors">
              <Brain className="h-8 w-8" />
              <span className="text-2xl font-bold">AI Discoverability Index</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                DEMO MODE
              </Badge>
              <Button asChild>
                <Link href="/evaluate">Get Your Score</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Demo Banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    🎯 Interactive Demo: Luxury Fashion Houses Leaderboard
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg">
                    Explore how top luxury fashion brands rank in AI discoverability. This demo shows real AIDI scoring methodology.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">94/100</div>
                  <div className="text-sm text-blue-200">Avg. AIDI Score</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Bloomberg-Style Terminal Header */}
          <div className="bg-black text-green-400 p-4 rounded-t-lg border border-green-500 font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-green-400">
                  <Brain className="h-5 w-5 mr-2" />
                  <span className="font-bold">AI DISCOVERABILITY TERMINAL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">DEMO DATA FEED</span>
                </div>
              </div>
              <div className="text-xs text-green-300">
                {new Date().toLocaleString()} UTC
              </div>
            </div>
          </div>

          {/* Category Selection - Demo */}
          <div className="bg-slate-800 text-white p-6 border-x border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className="bg-green-600 text-white">
                  NICHE SELECTED
                </Badge>
                <span className="text-green-300">Luxury Fashion Houses</span>
              </div>
              <div className="text-sm text-green-300 font-mono">
                👑 Fashion {'&'} Apparel {'>'} Luxury Fashion
              </div>
            </div>
          </div>

          {/* FOMO Alert Bar */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 border-x border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 animate-pulse" />
                <span className="font-bold">MARKET ALERT:</span>
                <span>Supreme and Palace both gained +3 points this week • Rankings updated daily</span>
              </div>
              <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50 font-bold">
                Track My Brand
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Demo Leaderboard */}
          <div className="bg-white border-x border-b border-green-500 rounded-b-lg">
            <BloombergLeaderboardTable data={demoLeaderboardData} />
          </div>

          {/* Demo Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white border-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-100 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Live Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Sector Average:</span>
                    <span className="font-bold text-blue-100">88/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Top Performer:</span>
                    <span className="font-bold text-blue-100">Supreme</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Your Opportunity:</span>
                    <span className="font-bold text-yellow-300">+12 points</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900 to-green-800 text-white border-green-600">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-green-200 text-sm">Rising Stars:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {["Supreme", "Palace"].map(brand => (
                        <Badge key={brand} className="bg-green-700 text-green-100 text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-200 text-sm">Needs Attention:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge className="bg-red-700 text-red-100 text-xs">
                        Off-White
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 text-white border-purple-600">
              <CardHeader>
                <CardTitle className="text-purple-100 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-purple-200 text-sm">
                    Ready to see your brand's AIDI score?
                  </p>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/evaluate">
                      <Shield className="h-4 w-4 mr-2" />
                      Analyze My Brand
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Explanation */}
          <Card className="mt-8 bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-6 w-6 mr-2 text-blue-600" />
                How This Demo Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Real AIDI Methodology</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    This demo uses the actual AI Discoverability Index scoring system. Each brand is evaluated across:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• <span className="font-medium">Infrastructure:</span> Technical readability</li>
                    <li>• <span className="font-medium">Perception:</span> Brand understanding</li>
                    <li>• <span className="font-medium">Commerce:</span> Purchase recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-slate-800">Professional Features</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Upgrade to access the full leaderboard experience:
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Live competitive intelligence</li>
                    <li>• Historical trend tracking</li>
                    <li>• Export capabilities (PDF/Excel)</li>
                    <li>• Custom alerts and monitoring</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center mt-6 gap-4">
                <Button asChild>
                  <Link href="/evaluate">
                    Start Your Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pricing">
                    View Pricing
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}