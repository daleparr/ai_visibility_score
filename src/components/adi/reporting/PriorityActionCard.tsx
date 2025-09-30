'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, Wrench, TrendingUp, Target, ChevronRight } from 'lucide-react'

interface PriorityActionCardProps {
  recommendation: {
    priority: string
    title: string
    score: number
    description: string
  }
  businessImpact: string
  timeline: string
  effort: 'easy' | 'medium' | 'hard'
  expectedIncrease: string
  implementationSteps?: string[]
  onGetGuide?: () => void
  websiteUrl?: string
  dimensionName?: string
}

export function PriorityActionCard({
  recommendation,
  businessImpact,
  timeline,
  effort,
  expectedIncrease,
  implementationSteps = [],
  onGetGuide,
  websiteUrl,
  dimensionName
}: PriorityActionCardProps) {

  const handleGetGuide = () => {
    if (onGetGuide) {
      onGetGuide()
    } else {
      // Generate and download technical implementation guide
      generateTechnicalGuide()
    }
  }

  const getDimensionEmoji = (dimensionName: string): string => {
    const emojiMap: Record<string, string> = {
      'Geographic Visibility': '🌍',
      'Citation Strength': '📰',
      'AI Response Quality': '💬',
      'Schema & Structured Data': '🤖',
      'Brand Heritage': '📖',
      'Product Identification': '🏆',
      'Transaction Clarity': '📦',
      'Knowledge Graph Presence': '🔗',
      'LLM Readability': '🧠',
      'Competitive Positioning': '🎯',
      'Semantic Clarity': '📝',
      'Recommendation Accuracy': '🎯'
    }
    return emojiMap[dimensionName] || '📊'
  }

  const generateTechnicalGuide = async () => {
    try {
      console.log('Starting implementation guide generation...', { recommendation, dimensionName })

      const guideContent = `
# Technical Implementation Guide
## ${recommendation.title}

**Website:** ${websiteUrl || 'N/A'}
**Dimension:** ${dimensionName || 'General'}
**Current Score:** ${recommendation.score}/100
**Priority:** ${recommendation.priority}

## Business Impact
${businessImpact}

## Implementation Timeline
${timeline}

## Effort Level
${effort} - ${getEffortDescription(effort)}

## Expected Results
${expectedIncrease}

## Step-by-Step Implementation
${implementationSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Technical Specifications
- Implementation complexity: ${effort}
- Expected timeline: ${timeline}
- Business impact: ${businessImpact}
- Score improvement potential: +${Math.min(25, 100 - recommendation.score)} points

## Next Steps
1. Review current implementation status
2. Allocate development resources
3. Follow implementation steps in order
4. Monitor score improvements
5. Validate with AI testing

Generated on: ${new Date().toLocaleString()}
    `.trim()

      // Create and download the enhanced guide as PDF
      console.log('Importing jsPDF for implementation guide...')
      const { jsPDF } = await import('jspdf')
      console.log('jsPDF imported successfully for implementation guide')
      
      const pdf = new jsPDF()
      console.log('PDF instance created for implementation guide')
      
      // Simple header without complex graphics
      pdf.setFontSize(20)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Implementation Guide', 20, 30)
    
      // Basic content without complex graphics
      pdf.setFontSize(16)
      pdf.text(recommendation.title, 20, 50)
      
      // Summary information
      pdf.setFontSize(12)
      pdf.text(`Current Score: ${recommendation.score}/100`, 20, 70)
      pdf.text(`Priority: ${recommendation.priority.toUpperCase()}`, 20, 80)
      pdf.text(`Effort Level: ${effort}`, 20, 90)
      pdf.text(`Timeline: ${timeline}`, 20, 100)
    
      // Business Impact
      pdf.setFontSize(14)
      pdf.text('Business Impact:', 20, 120)
      pdf.setFontSize(10)
      const impactText = pdf.splitTextToSize(businessImpact, 160)
      pdf.text(impactText, 20, 130)
    
      // Implementation Steps
      let currentY = 150
      pdf.setFontSize(14)
      pdf.text('Implementation Steps:', 20, currentY)
      
      currentY += 10
      pdf.setFontSize(10)
      implementationSteps.forEach((step, index) => {
        const stepText = `${index + 1}. ${step}`
        const wrappedStep = pdf.splitTextToSize(stepText, 160)
        pdf.text(wrappedStep, 20, currentY)
        currentY += wrappedStep.length * 5 + 5
      })
      
      // Expected Results
      currentY += 10
      pdf.setFontSize(12)
      pdf.text('Expected Results:', 20, currentY)
      currentY += 10
      pdf.setFontSize(10)
      pdf.text(expectedIncrease, 20, currentY)
      
      // Footer
      currentY += 20
      pdf.setFontSize(8)
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, currentY)
      pdf.text('AI Discoverability Index', 20, currentY + 10)
    
      // Download PDF
      const filename = `${recommendation.title.replace(/[^a-zA-Z0-9]/g, '_')}_Implementation_Guide.pdf`
      console.log('Downloading implementation guide PDF:', filename)
      pdf.save(filename)
      console.log('Implementation guide PDF download initiated successfully')
      
      // Show success message
      alert('Implementation guide downloaded successfully!')
      
    } catch (error) {
      console.error('Error generating implementation guide:', error)
      alert(`Failed to generate implementation guide: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getEffortDescription = (effort: string) => {
    switch (effort) {
      case 'easy': return 'Quick implementation, minimal technical complexity'
      case 'medium': return 'Moderate implementation, some technical expertise required'
      case 'hard': return 'Complex implementation, significant technical resources needed'
      default: return 'Implementation complexity varies'
    }
  }
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className={`${getPriorityColor(recommendation.priority)} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getPriorityBadgeVariant(recommendation.priority)} className="text-xs">
                {recommendation.priority.toUpperCase()} PRIORITY
              </Badge>
              <span className="text-xs text-gray-500">Current Score:</span>
              <span className={`text-sm font-bold ${getScoreColor(recommendation.score)}`}>
                {recommendation.score}/100
              </span>
            </div>
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          </div>
          <Target className="h-5 w-5 text-gray-400 mt-1" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Business Impact */}
        <div className="bg-white rounded-lg p-3 border">
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
            Business Impact
          </h4>
          <p className="text-sm text-gray-700">{businessImpact}</p>
        </div>

        {/* Implementation Details */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
            </div>
            <p className="text-xs font-medium">Timeline</p>
            <p className="text-xs text-gray-600">{timeline}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-sm">{getEffortIcon(effort)}</span>
            </div>
            <p className="text-xs font-medium">Effort</p>
            <p className={`text-xs ${getEffortColor(effort)}`}>{effort}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            </div>
            <p className="text-xs font-medium">Expected Gain</p>
            <p className="text-xs text-green-600">{expectedIncrease}</p>
          </div>
        </div>

        {/* Progress Potential */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Current Score</span>
            <span>Potential Score</span>
          </div>
          <div className="relative">
            <Progress value={recommendation.score} className="h-2" />
            <div 
              className="absolute top-0 h-2 bg-green-200 rounded-full opacity-50"
              style={{ 
                left: `${recommendation.score}%`, 
                width: `${Math.min(100 - recommendation.score, 25)}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-gray-500">
            <span>{recommendation.score}</span>
            <span>+{Math.min(25, 100 - recommendation.score)}</span>
          </div>
        </div>

        {/* Implementation Steps */}
        {implementationSteps.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-semibold mb-2 text-blue-800">
              📋 Implementation Steps
            </h4>
            <ol className="space-y-1">
              {implementationSteps.map((step, index) => (
                <li key={index} className="text-xs text-blue-700 flex items-start">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Button */}
        <Button className="w-full" size="sm" onClick={handleGetGuide}>
          Get Implementation Guide
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}