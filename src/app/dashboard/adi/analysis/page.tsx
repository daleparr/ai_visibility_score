'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { 
  BarChart3,
  Target,
  TrendingUp,
  Filter,
  Download,
  Share,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Import our new analysis components
import { RadarChart } from '../../../../components/adi/analysis/RadarChart';
import { DimensionScoreCard } from '../../../../components/adi/analysis/DimensionScoreCard';

// Mock data for the 9 ADI dimensions
const mockDimensionData = [
  {
    dimension: 'Schema & Structured Data',
    score: 85,
    maxScore: 100,
    categoryAverage: 72,
    trend: 'up' as const,
    evidence: ['JSON-LD implementation: 94%', 'Product schema coverage: 89%']
  },
  {
    dimension: 'Semantic Clarity & Ontology',
    score: 72,
    maxScore: 100,
    categoryAverage: 68,
    trend: 'stable' as const,
    evidence: ['Vocabulary consistency: 78%', 'Taxonomy alignment: 65%']
  },
  {
    dimension: 'Knowledge Graphs & Entity Linking',
    score: 68,
    maxScore: 100,
    categoryAverage: 71,
    trend: 'down' as const,
    evidence: ['Wikipedia presence: 45%', 'Wikidata connections: 23%']
  },
  {
    dimension: 'LLM Readability & Conversational Copy',
    score: 79,
    maxScore: 100,
    categoryAverage: 74,
    trend: 'up' as const,
    evidence: ['Natural language quality: 82%', 'Use-case clarity: 76%']
  },
  {
    dimension: 'AI Answer Quality & Presence',
    score: 82,
    maxScore: 100,
    categoryAverage: 69,
    trend: 'up' as const,
    evidence: ['Answer accuracy: 92%', 'Query coverage: 68%']
  },
  {
    dimension: 'Citation Authority & Freshness',
    score: 71,
    maxScore: 100,
    categoryAverage: 73,
    trend: 'stable' as const,
    evidence: ['Media mentions: 156', 'Authority domains: 23']
  },
  {
    dimension: 'Reputation Signals',
    score: 75,
    maxScore: 100,
    categoryAverage: 70,
    trend: 'up' as const,
    evidence: ['Review sentiment: 4.2/5', 'Trust indicators: 67%']
  },
  {
    dimension: 'Hero Products & Use-Case Retrieval',
    score: 77,
    maxScore: 100,
    categoryAverage: 65,
    trend: 'up' as const,
    evidence: ['Product discoverability: 73%', 'Use-case alignment: 81%']
  },
  {
    dimension: 'Policies & Logistics Clarity',
    score: 74,
    maxScore: 100,
    categoryAverage: 67,
    trend: 'stable' as const,
    evidence: ['Policy clarity: 78%', 'Shipping transparency: 70%']
  }
];

/**
 * ADI Analysis Dashboard
 * Detailed dimension-by-dimension analysis for analysts
 */
export default function ADIAnalysisDashboard() {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'strong' | 'weak'>('all');

  // Filter dimensions based on performance
  const filteredDimensions = mockDimensionData.filter(dim => {
    if (selectedFilter === 'strong') return dim.score >= 80;
    if (selectedFilter === 'weak') return dim.score < 70;
    return true;
  });

  // Calculate summary stats
  const averageScore = Math.round(mockDimensionData.reduce((sum, dim) => sum + dim.score, 0) / mockDimensionData.length);
  const strongDimensions = mockDimensionData.filter(dim => dim.score >= 80).length;
  const weakDimensions = mockDimensionData.filter(dim => dim.score < 70).length;

  const handleDimensionClick = (dimension: string) => {
    setExpandedDimension(expandedDimension === dimension ? null : dimension);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/adi/executive">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Executive
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dimension Analysis</h1>
                <p className="text-gray-600">Deep dive into your ADI performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                9 Dimensions
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{averageScore}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{strongDimensions}</div>
                  <div className="text-sm text-gray-600">Strong Dimensions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{weakDimensions}</div>
                  <div className="text-sm text-gray-600">Need Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">67th</div>
                  <div className="text-sm text-gray-600">Percentile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Radar Chart */}
          <Card className="border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Your performance across all 9 ADI dimensions vs category average
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RadarChart
                data={mockDimensionData}
                categoryAverage={mockDimensionData.map(dim => ({
                  ...dim,
                  score: dim.categoryAverage || 0
                }))}
                size={400}
                interactive={true}
                onDimensionClick={handleDimensionClick}
              />
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Key Insights
              </CardTitle>
              <CardDescription>
                Analysis of your strongest and weakest areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Performers */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Top Performers (80+)
                  </h4>
                  <div className="space-y-2">
                    {mockDimensionData
                      .filter(dim => dim.score >= 80)
                      .map((dim, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium text-green-800">{dim.dimension}</span>
                          <span className="text-sm text-green-600">{dim.score}/100</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Priority Areas (&lt;70)
                  </h4>
                  <div className="space-y-2">
                    {mockDimensionData
                      .filter(dim => dim.score < 70)
                      .map((dim, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                          <span className="text-sm font-medium text-orange-800">{dim.dimension}</span>
                          <span className="text-sm text-orange-600">{dim.score}/100</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Quick Recommendations */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Quick Wins</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Focus on Knowledge Graphs (+3-5 pts potential)</li>
                    <li>• Improve Citation Authority (+2-4 pts potential)</li>
                    <li>• Enhance Schema coverage (+4-6 pts potential)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dimension Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Filter dimensions:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Dimensions', count: mockDimensionData.length },
              { key: 'strong', label: 'Strong (80+)', count: strongDimensions },
              { key: 'weak', label: 'Needs Work (<70)', count: weakDimensions }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Dimension Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDimensions.map((dimension, index) => (
            <DimensionScoreCard
              key={dimension.dimension}
              dimension={dimension}
              categoryAverage={dimension.categoryAverage}
              expanded={expandedDimension === dimension.dimension}
              onToggle={() => handleDimensionClick(dimension.dimension)}
              showEvidence={true}
            />
          ))}
        </div>

        {/* Analysis Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
            <CardDescription>
              Overall assessment and strategic recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Strategic Priorities</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium">Knowledge Graph Presence</div>
                      <div className="text-gray-600">Establish Wikipedia and Wikidata presence to improve entity linking</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium">Citation Authority</div>
                      <div className="text-gray-600">Build relationships with authoritative domains and media outlets</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium">Schema Enhancement</div>
                      <div className="text-gray-600">Complete review and offer schema implementation</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Expected Impact</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-green-800">Potential Score Improvement</div>
                    <div className="text-green-700">+15-20 points overall ADI score</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-800">Timeline</div>
                    <div className="text-blue-700">3-6 months for full implementation</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800">Investment Required</div>
                    <div className="text-purple-700">Medium - primarily content and outreach</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}