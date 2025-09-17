'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Lightbulb, TrendingUp, Clock, Wrench } from 'lucide-react'
import { 
  getDimensionExplanation, 
  getLetterGrade, 
  getBusinessImpact, 
  getAIInteractionExample,
  getImprovementPriority,
  analyzeConversationalCopy
} from '@/lib/report-utils'

interface UserFriendlyDimensionCardProps {
  dimension: {
    name: string
    score: number
    description: string
    pillar: string
  }
  isConversationalCopy?: boolean
  evidence?: any
}

export function UserFriendlyDimensionCard({ 
  dimension, 
  isConversationalCopy = false,
  evidence 
}: UserFriendlyDimensionCardProps) {
  const [showTechnical, setShowTechnical] = useState(false)
  const [showExample, setShowExample] = useState(false)
  
  const explanation = getDimensionExplanation(dimension.name)
  const grade = getLetterGrade(dimension.score)
  const impact = getBusinessImpact(dimension.score)
  const priority = getImprovementPriority(dimension.score, impact.description)
  const aiExample = getAIInteractionExample(dimension.name, dimension.score)
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'hard': return '🔴'
      default: return '⚪'
    }
  }

  // Special handling for Conversational Copy dimension
  const conversationalCopyRubric = isConversationalCopy 
    ? analyzeConversationalCopy(dimension.score, evidence)
    : null

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {explanation?.emoji || '📊'} {explanation?.friendlyName || dimension.name}
          </CardTitle>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(dimension.score)}`}>
              {dimension.score}
            </div>
            <Badge variant={dimension.score >= 80 ? 'default' : dimension.score >= 60 ? 'secondary' : 'destructive'}>
              Grade {grade}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <Progress value={dimension.score} className="h-3" />
        
        {/* Business Question */}
        {explanation && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-1">
              {explanation.businessQuestion}
            </p>
            <p className="text-xs text-blue-600">
              {explanation.businessImpact}
            </p>
          </div>
        )}

        {/* Current Status */}
        <div className="flex items-start space-x-2">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            impact.level === 'high' ? 'bg-green-500' : 
            impact.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <div>
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-xs text-gray-600">{impact.description}</p>
          </div>
        </div>

        {/* Quick Win */}
        {explanation && dimension.score < 90 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center mb-1">
              <Lightbulb className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-sm font-medium text-green-800">Quick Win</span>
              <Badge variant={getPriorityColor(priority.priority)} className="ml-2 text-xs">
                {priority.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-green-700 mb-2">{explanation.quickWinDescription}</p>
            <div className="flex items-center gap-4 text-xs text-green-600">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {priority.timeline}
              </span>
              <span className="flex items-center">
                <Wrench className="h-3 w-3 mr-1" />
                {priority.effort} effort
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {priority.expectedIncrease}
              </span>
            </div>
          </div>
        )}

        {/* Conversational Copy Rubric */}
        {isConversationalCopy && conversationalCopyRubric && (
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-3">
              💬 Conversational Copy Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Coverage:</span>
                <span className={`ml-1 ${getScoreColor(conversationalCopyRubric.coverage.score * 4)}`}>
                  {conversationalCopyRubric.coverage.score}/25
                </span>
                <p className="text-purple-600 mt-1">{conversationalCopyRubric.coverage.description}</p>
              </div>
              <div>
                <span className="font-medium">Quality:</span>
                <span className={`ml-1 ${getScoreColor(conversationalCopyRubric.quality.score * 4)}`}>
                  {conversationalCopyRubric.quality.score}/25
                </span>
                <p className="text-purple-600 mt-1">{conversationalCopyRubric.quality.description}</p>
              </div>
              <div>
                <span className="font-medium">Query Alignment:</span>
                <span className={`ml-1 ${getScoreColor(conversationalCopyRubric.queryAlignment.score * 4)}`}>
                  {conversationalCopyRubric.queryAlignment.score}/25
                </span>
                <p className="text-purple-600 mt-1">{conversationalCopyRubric.queryAlignment.description}</p>
              </div>
              <div>
                <span className="font-medium">Semantic Enrichment:</span>
                <span className={`ml-1 ${getScoreColor(conversationalCopyRubric.semanticEnrichment.score * 4)}`}>
                  {conversationalCopyRubric.semanticEnrichment.score}/25
                </span>
                <p className="text-purple-600 mt-1">{conversationalCopyRubric.semanticEnrichment.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Interaction Example */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExample(!showExample)}
            className="w-full justify-between text-xs"
          >
            💬 See how this affects AI conversations
            {showExample ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          
          {showExample && (
            <div className="bg-gray-50 rounded-lg p-3 border space-y-3">
              <div>
                <p className="text-xs font-medium text-red-700 mb-1">❌ Current AI Response:</p>
                <p className="text-xs text-gray-700 italic">"{aiExample.before}"</p>
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">✅ After Improvements:</p>
                <p className="text-xs text-gray-700 italic">"{aiExample.after}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details Toggle */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full justify-between text-xs"
          >
            🔧 Technical details
            {showTechnical ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          
          {showTechnical && (
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Technical name:</span> {dimension.name}
              </p>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Pillar:</span> {dimension.pillar}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Technical description:</span> {dimension.description}
              </p>
              {evidence && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Analysis Evidence:</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}