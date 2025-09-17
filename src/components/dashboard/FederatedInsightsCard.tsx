'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Lightbulb,
  Shield,
  BarChart3,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { federatedLearning } from '@/lib/federated-learning/engine'
import type { PersonalizedInsights } from '@/lib/federated-learning/types'

interface FederatedInsightsCardProps {
  userId: string
  userIndustry: string
  subscriptionTier: 'free' | 'professional' | 'enterprise'
  className?: string
}

export function FederatedInsightsCard({ 
  userId, 
  userIndustry, 
  subscriptionTier, 
  className 
}: FederatedInsightsCardProps) {
  const [insights, setInsights] = useState<PersonalizedInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recommendations' | 'benchmarks' | 'predictions'>('recommendations')

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const personalizedInsights = await federatedLearning.generatePersonalizedInsights(
          userId,
          userIndustry,
          subscriptionTier
        )
        setInsights(personalizedInsights)
      } catch (error) {
        console.error('Error loading federated insights:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInsights()
  }, [userId, userIndustry, subscriptionTier])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Complete an evaluation to unlock personalized insights</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getMaxRecommendations = () => {
    switch (subscriptionTier) {
      case 'free': return 3
      case 'professional': return 8
      case 'enterprise': return insights.recommendations.length
      default: return 3
    }
  }

  const getMaxSimilarCompanies = () => {
    switch (subscriptionTier) {
      case 'free': return 2
      case 'professional': return 5
      case 'enterprise': return insights.benchmarkComparisons.similarCompanies.length
      default: return 2
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          AI-Powered Insights
          <Badge variant="secondary" className="ml-auto">
            Powered by Federated Learning
          </Badge>
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on industry patterns and peer analysis
        </CardDescription>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('recommendations')}
            className="flex-1"
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Recommendations
          </Button>
          <Button
            variant={activeTab === 'benchmarks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('benchmarks')}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Benchmarks
          </Button>
          <Button
            variant={activeTab === 'predictions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('predictions')}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Predictions
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Priority Recommendations</h4>
              <Badge variant="outline">
                {insights.recommendations.slice(0, getMaxRecommendations()).length} of {insights.recommendations.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {insights.recommendations.slice(0, getMaxRecommendations()).map((rec) => (
                <div key={rec.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                        <span className="font-medium text-sm">{rec.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Expected Impact: +{rec.expectedImpact} points</span>
                    <span>Effort: {rec.implementationEffort}</span>
                    <span>Evidence: {Math.round(rec.evidenceStrength * 100)}%</span>
                  </div>
                  
                  <Progress value={rec.industryRelevance * 100} className="h-1" />
                </div>
              ))}
            </div>

            {subscriptionTier === 'free' && insights.recommendations.length > 3 && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Upgrade to Professional to see {insights.recommendations.length - 3} more recommendations
                </p>
                <Button size="sm" className="mt-2">Upgrade Now</Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(insights.benchmarkComparisons.industryPosition)}%
                </div>
                <div className="text-sm text-blue-700">Industry Percentile</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {insights.benchmarkComparisons.similarCompanies.length}
                </div>
                <div className="text-sm text-green-700">Similar Companies</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Similar Companies (Anonymized)</h4>
              <div className="space-y-2">
                {insights.benchmarkComparisons.similarCompanies.slice(0, getMaxSimilarCompanies()).map((company, index) => (
                  <div key={company.anonymizedId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Company {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{company.score}</Badge>
                      <span className="text-xs text-gray-500">
                        {company.improvements.length} improvements
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Gap Analysis</h4>
              <div className="space-y-2">
                {insights.benchmarkComparisons.gapAnalysis.slice(0, 5).map((gap) => (
                  <div key={gap.dimension} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{gap.dimension}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-600">-{Math.round(gap.gap)} pts</span>
                      <Badge variant="outline" className="text-xs">
                        {gap.closureStrategy}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {Math.round(insights.predictiveInsights.futureScore)}
              </div>
              <div className="text-sm text-purple-700 mb-2">Predicted Score (3 months)</div>
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-purple-600">
                  {insights.predictiveInsights.confidenceLevel}% confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Key Drivers
                </h4>
                <div className="space-y-2">
                  {insights.predictiveInsights.keyDrivers.map((driver, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {driver}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Risk Factors
                </h4>
                <div className="space-y-2">
                  {insights.predictiveInsights.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <TrendingDown className="h-3 w-3 text-orange-500" />
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {subscriptionTier === 'free' && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  Upgrade for advanced predictive analytics and custom forecasting
                </p>
                <Button size="sm" className="mt-2">Upgrade to Professional</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}