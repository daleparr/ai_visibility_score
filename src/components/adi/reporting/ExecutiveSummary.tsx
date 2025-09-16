'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getLetterGrade, getBusinessImpact } from '@/lib/report-utils'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

interface ExecutiveSummaryProps {
  overallScore: number
  url: string
  tier: string
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
}

export function ExecutiveSummary({ overallScore, url, tier, pillarScores }: ExecutiveSummaryProps) {
  const grade = getLetterGrade(overallScore)
  const impact = getBusinessImpact(overallScore)
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeDescription = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellent AI visibility - you\'re likely a top recommendation'
      case 'B': return 'Good AI visibility - you\'re often recommended with room to excel'
      case 'C': return 'Average AI visibility - significant opportunity for improvement'
      case 'D': return 'Below average AI visibility - urgent improvements needed'
      case 'F': return 'Poor AI visibility - major overhaul required'
      default: return 'AI visibility assessment'
    }
  }

  const getOpportunityMessage = (score: number) => {
    if (score >= 80) {
      return "You're in great shape! Focus on maintaining your position and monitoring competitors."
    }
    if (score >= 60) {
      return "With some focused improvements, you could move from 'sometimes recommended' to 'frequently recommended' by AI assistants."
    }
    return "There's significant opportunity to improve how AI discovers and recommends your brand."
  }

  return (
    <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">
              🎯 Your AIDI Score: {overallScore}/100 (Grade {grade})
            </CardTitle>
            <p className="text-gray-600">Analysis for <span className="font-semibold">{url}</span></p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {grade}
            </div>
            <Badge variant={impact.level === 'high' ? 'default' : impact.level === 'medium' ? 'secondary' : 'destructive'}>
              {impact.level.toUpperCase()} IMPACT
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plain English Explanation */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
              In Plain English
            </h3>
            <p className="text-gray-700 mb-3">{getGradeDescription(grade)}</p>
            <p className="text-gray-600 text-sm">{getOpportunityMessage(overallScore)}</p>
          </div>

          {/* Business Impact */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-semibold">Current Status</span>
              </div>
              <p className="text-sm text-gray-600">{impact.description}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                <span className="font-semibold">Opportunity</span>
              </div>
              <p className="text-sm text-gray-600">{impact.opportunity}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center mb-2">
                <Badge variant="outline" className="text-xs">
                  {tier === 'professional' ? 'PROFESSIONAL ANALYSIS' : 'FREE ANALYSIS'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {tier === 'professional' 
                  ? 'Multi-model analysis with detailed insights'
                  : 'GPT-4 analysis with basic recommendations'
                }
              </p>
            </div>
          </div>

          {/* Pillar Scores with Business Context */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-4">How AI Sees Your Brand (3 Key Areas)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">🤖 Technical Foundation</span>
                  <span className={`font-bold ${getScoreColor(pillarScores.infrastructure)}`}>
                    {pillarScores.infrastructure}/100
                  </span>
                </div>
                <Progress value={pillarScores.infrastructure} className="mb-1" />
                <p className="text-xs text-gray-500">How easily AI can read your website</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">🎭 Brand Perception</span>
                  <span className={`font-bold ${getScoreColor(pillarScores.perception)}`}>
                    {pillarScores.perception}/100
                  </span>
                </div>
                <Progress value={pillarScores.perception} className="mb-1" />
                <p className="text-xs text-gray-500">How well AI understands your brand</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">🛒 Shopping Experience</span>
                  <span className={`font-bold ${getScoreColor(pillarScores.commerce)}`}>
                    {pillarScores.commerce}/100
                  </span>
                </div>
                <Progress value={pillarScores.commerce} className="mb-1" />
                <p className="text-xs text-gray-500">How AI helps customers buy from you</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}