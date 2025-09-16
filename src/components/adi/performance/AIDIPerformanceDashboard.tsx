'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  Zap, 
  Crown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Users,
  Eye,
  Shield
} from 'lucide-react'
import { AIDIPerformanceProfile, AIDI_BANDS } from '@/lib/adi/performance-framework'

interface AIDIPerformanceDashboardProps {
  profile: AIDIPerformanceProfile
  brandName: string
  niche: string
}

export function AIDIPerformanceDashboard({ profile, brandName, niche }: AIDIPerformanceDashboardProps) {
  const { score, banding, ranking, insights, commercialOutcomes, competitiveContext, trendAnalysis } = profile

  const getMovementIcon = () => {
    switch (ranking.movement) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getMovementText = () => {
    if (ranking.movement === 'stable') return 'No change'
    const direction = ranking.movement === 'up' ? 'up' : 'down'
    return `${direction} ${ranking.positionsChanged} ${ranking.positionsChanged === 1 ? 'place' : 'places'}`
  }

  const getBandingIcon = () => {
    switch (banding.band) {
      case 'leader': return <Crown className="h-5 w-5" />
      case 'contender': return <Target className="h-5 w-5" />
      case 'vulnerable': return <AlertTriangle className="h-5 w-5" />
      case 'invisible': return <Eye className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{brandName} AIDI Performance</h1>
            <p className="text-slate-300">{niche} • {ranking.timeframe} Analysis</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{score.toFixed(1)}</div>
            <div className="text-sm text-slate-300">AIDI Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Performance Band */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getBandingIcon()}
                <Badge 
                  style={{ backgroundColor: banding.color }}
                  className="text-white"
                >
                  {banding.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">{banding.description}</p>
            </CardContent>
          </Card>

          {/* Ranking Movement */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getMovementIcon()}
                <span className="font-semibold">#{ranking.currentRank}</span>
              </div>
              <p className="text-xs text-slate-300">
                {getMovementText()} this {ranking.timeframe}
              </p>
            </CardContent>
          </Card>

          {/* Gap to Leader */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="font-semibold">-{competitiveContext.gapToLeader.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-300">
                Points behind {competitiveContext.nicheLeader.name}
              </p>
            </CardContent>
          </Card>

          {/* Urgency Level */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={`h-4 w-4 ${
                  banding.urgencyLevel === 'immediate' ? 'text-red-400' :
                  banding.urgencyLevel === 'urgent' ? 'text-orange-400' :
                  banding.urgencyLevel === 'moderate' ? 'text-yellow-400' : 'text-green-400'
                }`} />
                <span className="font-semibold capitalize">{banding.urgencyLevel}</span>
              </div>
              <p className="text-xs text-slate-300">Action Required</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Impact Alert */}
      <Card className={`border-l-4 ${
        banding.urgencyLevel === 'immediate' ? 'border-l-red-500 bg-red-50' :
        banding.urgencyLevel === 'urgent' ? 'border-l-orange-500 bg-orange-50' :
        banding.urgencyLevel === 'moderate' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-green-500 bg-green-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${
              banding.urgencyLevel === 'immediate' ? 'text-red-500' :
              banding.urgencyLevel === 'urgent' ? 'text-orange-500' :
              banding.urgencyLevel === 'moderate' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
            <div>
              <h3 className="font-semibold text-gray-900">{banding.businessImplication}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {banding.band === 'vulnerable' && 
                  "Your brand is at significant risk of losing visibility in AI-powered search and recommendations. Immediate action required to prevent market share erosion."
                }
                {banding.band === 'invisible' && 
                  "Critical situation: Your brand is largely absent from AI recommendations. This poses an existential threat to digital customer acquisition."
                }
                {banding.band === 'contender' && 
                  "Strong foundation with clear optimization opportunities. Focus on quick wins to achieve Leader status."
                }
                {banding.band === 'leader' && 
                  "Excellent position! Maintain your competitive advantage and explore opportunities to extend your lead."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Action Items</TabsTrigger>
          <TabsTrigger value="commercial">Business Impact</TabsTrigger>
          <TabsTrigger value="competitive">Competition</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Action Items Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Wins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Wins ({insights.quickWins.length})
                </CardTitle>
                <CardDescription>
                  Fast-track improvements for immediate AIDI gains
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.quickWins.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        +{insight.potentialGain} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>⏱️ {insight.timeToImpact}</span>
                      <span>🔧 {insight.effort} effort</span>
                    </div>
                  </div>
                ))}
                {insights.quickWins.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No quick wins identified. Focus on addressing critical weaknesses first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Critical Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Critical Issues ({insights.weaknesses.length})
                </CardTitle>
                <CardDescription>
                  High-priority gaps costing you AIDI points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.weaknesses.slice(0, 3).map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant="destructive" className="text-xs">
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="text-xs text-gray-700">
                      <strong>Impact:</strong> {insight.businessImpact}
                    </div>
                  </div>
                ))}
                {insights.weaknesses.length === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    No critical issues identified
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Your Strengths ({insights.strengths.length})
              </CardTitle>
              <CardDescription>
                What's working well and driving your AIDI performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {insights.strengths.map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg border-green-200 bg-green-50">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600">{insight.description}</p>
                  </div>
                ))}
                {insights.strengths.length === 0 && (
                  <p className="text-sm text-gray-500 col-span-3 text-center py-4">
                    Focus on building foundational strengths across key dimensions.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commercial Impact Tab */}
        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {commercialOutcomes.map((outcome, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {outcome.metric === 'AI Recommendation Rate' && <Users className="h-5 w-5 text-blue-500" />}
                    {outcome.metric === 'Organic Traffic Growth' && <TrendingUp className="h-5 w-5 text-green-500" />}
                    {outcome.metric === 'Brand Trust Signals' && <Shield className="h-5 w-5 text-purple-500" />}
                    {outcome.metric === 'Market Share Protection' && <DollarSign className="h-5 w-5 text-orange-500" />}
                    {outcome.metric}
                  </CardTitle>
                  <CardDescription>
                    Correlation: {(outcome.correlation * 100).toFixed(0)}% confidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">{outcome.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Evidence:</strong> {outcome.evidenceBase}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Business Impact:</strong> {outcome.projectedImpact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Competitive Context Tab */}
        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Niche Leader */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Niche Leader
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{competitiveContext.nicheLeader.name}</div>
                  <div className="text-lg text-gray-600">{competitiveContext.nicheLeader.score.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">AIDI Score</div>
                  <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                    You're {competitiveContext.gapToLeader.toFixed(1)} points behind
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Niche Average */}
            <Card>
              <CardHeader>
                <CardTitle>Niche Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">{competitiveContext.nicheAverage.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Average AIDI Score</div>
                  <div className="mt-3">
                    <Progress 
                      value={(score / competitiveContext.nicheAverage) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {score > competitiveContext.nicheAverage ? 'Above' : 'Below'} average
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Threats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Competitive Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {competitiveContext.threatenedBy.length > 0 ? (
                  <div className="space-y-2">
                    {competitiveContext.threatenedBy.slice(0, 3).map((threat, index) => (
                      <div key={index} className="p-2 bg-red-50 rounded text-sm">
                        {threat}
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">
                      Brands within 5 points of your score
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    No immediate competitive threats identified
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trajectory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {trendAnalysis.trajectory === 'improving' && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {trendAnalysis.trajectory === 'declining' && <TrendingDown className="h-5 w-5 text-red-500" />}
                  {trendAnalysis.trajectory === 'stable' && <Minus className="h-5 w-5 text-gray-500" />}
                  Performance Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold capitalize mb-2">
                    {trendAnalysis.trajectory}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Momentum: {trendAnalysis.momentum} positions
                  </div>
                  
                  {/* Risk Factors */}
                  {trendAnalysis.riskFactors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Risk Factors:</h4>
                      <div className="space-y-1">
                        {trendAnalysis.riskFactors.map((risk, index) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {risk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendAnalysis.opportunities.length > 0 ? (
                  <div className="space-y-2">
                    {trendAnalysis.opportunities.map((opportunity, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded text-sm">
                        {opportunity}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    Focus on addressing critical weaknesses first
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}