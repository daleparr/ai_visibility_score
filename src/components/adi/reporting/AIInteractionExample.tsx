'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, ArrowRight } from 'lucide-react'

interface AIInteractionExampleProps {
  dimensionName: string
  currentExample: string
  improvedExample: string
  improvementDescription: string
}

export function AIInteractionExample({
  dimensionName,
  currentExample,
  improvedExample,
  improvementDescription
}: AIInteractionExampleProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
          How AI Talks About You
        </CardTitle>
        <p className="text-sm text-gray-600">Real examples of how improvements change AI responses</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center mb-2">
            <Badge variant="destructive" className="text-xs mr-2">CURRENT</Badge>
            <span className="text-sm font-medium text-gray-700">What AI says now</span>
          </div>
          <div className="bg-red-50 rounded p-3 border-l-4 border-red-400">
            <p className="text-sm text-gray-700 italic">
              "🤖 {currentExample}"
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-2">
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Improved State */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-2">
            <Badge variant="default" className="text-xs mr-2 bg-green-600">AFTER IMPROVEMENTS</Badge>
            <span className="text-sm font-medium text-gray-700">What AI will say</span>
          </div>
          <div className="bg-green-50 rounded p-3 border-l-4 border-green-400">
            <p className="text-sm text-gray-700 italic">
              "🤖 {improvedExample}"
            </p>
          </div>
        </div>

        {/* Improvement Description */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">
            💡 What makes the difference
          </h4>
          <p className="text-sm text-blue-700">{improvementDescription}</p>
        </div>
      </CardContent>
    </Card>
  )
}