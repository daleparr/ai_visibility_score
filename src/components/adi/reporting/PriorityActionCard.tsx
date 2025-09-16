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
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    
    // Colors
    const primaryBlue: [number, number, number] = [37, 99, 235]
    const lightGray: [number, number, number] = [243, 244, 246]
    const darkGray: [number, number, number] = [75, 85, 99]
    const green: [number, number, number] = [34, 197, 94]
    
    // Header Section
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    pdf.rect(0, 0, 210, 40, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.text('Implementation Guide', 20, 25)
    
    // Dimension name (clean text without emojis for better PDF compatibility)
    pdf.setFontSize(16)
    pdf.text(recommendation.title, 20, 35)
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    
    // Snapshot Box (4 columns)
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.rect(15, 50, 180, 25, 'F')
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(15, 50, 180, 25, 'S')
    
    // Column headers
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Current Score', 25, 60)
    pdf.text('Priority', 70, 60)
    pdf.text('Effort Level', 115, 60)
    pdf.text('Timeline', 160, 60)
    
    // Column values
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    pdf.text(`${recommendation.score}/100`, 25, 68)
    pdf.text(recommendation.priority.toUpperCase(), 70, 68)
    pdf.text(`${effort} (Easy)`, 115, 68)
    pdf.text(timeline, 160, 68)
    
    // Business Impact Box
    pdf.setFillColor(255, 251, 235) // Light yellow
    pdf.rect(15, 85, 180, 25, 'F')
    pdf.setDrawColor(251, 191, 36)
    pdf.rect(15, 85, 180, 25, 'S')
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Business Impact:', 20, 95)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const impactText = pdf.splitTextToSize(businessImpact, 160)
    pdf.text(impactText, 20, 102)
    
    // Visual Gauge Section (Left Column)
    let currentY = 125
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Score Improvement Potential', 20, currentY)
    
    // Simple gauge representation
    currentY += 15
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.rect(20, currentY, 80, 8, 'F')
    
    // Current score bar
    const currentScoreWidth = (recommendation.score / 100) * 80
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
    pdf.rect(20, currentY, currentScoreWidth, 8, 'F')
    
    // Expected improvement bar
    const expectedImprovement = Math.min(15, 100 - recommendation.score)
    const improvementWidth = (expectedImprovement / 100) * 80
    pdf.setFillColor(green[0], green[1], green[2])
    pdf.rect(20 + currentScoreWidth, currentY, improvementWidth, 8, 'F')
    
    currentY += 15
    pdf.setFontSize(10)
    pdf.text(`Current: ${recommendation.score}/100`, 20, currentY)
    pdf.text(`Expected: +${expectedImprovement} points`, 20, currentY + 8)
    pdf.text(`Max Potential: +${Math.min(25, 100 - recommendation.score)} points`, 20, currentY + 16)
    
    // Implementation Steps (Right Column)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Step-by-Step Implementation', 110, 140)
    
    currentY = 150
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    implementationSteps.forEach((step, index) => {
      const stepText = `${index + 1}. ${step}`
      const wrappedStep = pdf.splitTextToSize(stepText, 80)
      pdf.text(wrappedStep, 110, currentY)
      currentY += wrappedStep.length * 4 + 5
    })
    
    // Technical Specs Box (Bottom Left)
    currentY = Math.max(currentY, 200)
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.rect(15, currentY, 85, 30, 'F')
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(15, currentY, 85, 30, 'S')
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Technical Specifications', 20, currentY + 10)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text(`Implementation complexity: ${effort}`, 20, currentY + 18)
    pdf.text(`Timeline: ${timeline}`, 20, currentY + 23)
    pdf.text(`Score improvement potential: +${Math.min(25, 100 - recommendation.score)} points`, 20, currentY + 28)
    
    // Next Steps Box (Bottom Right)
    pdf.setFillColor(239, 246, 255) // Light blue
    pdf.rect(110, currentY, 85, 30, 'F')
    pdf.setDrawColor(59, 130, 246)
    pdf.rect(110, currentY, 85, 30, 'S')
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Next Steps', 115, currentY + 10)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.text('1. Review current implementation status', 115, currentY + 18)
    pdf.text('2. Allocate development resources', 115, currentY + 23)
    pdf.text('3. Monitor score improvements', 115, currentY + 28)
    
    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280)
    pdf.text('AI Discoverability Terminal', 150, 280)
    
    // Download PDF
    pdf.save(`${recommendation.title.replace(/[^a-zA-Z0-9]/g, '_')}_Implementation_Guide.pdf`)
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