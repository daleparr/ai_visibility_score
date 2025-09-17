'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { 
  Crown,
  Zap,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Users,
  Award
} from 'lucide-react';
import Link from 'next/link';

// Import our new ADI components
import { ScoreGauge } from '../../../../components/adi/executive/ScoreGauge';
import { PillarBreakdown } from '../../../../components/adi/executive/PillarBreakdown';
import { QuickStats } from '../../../../components/adi/executive/QuickStats';
import { VerdictLine } from '../../../../components/adi/executive/VerdictLine';

// Mock data for demonstration
const mockADIData = {
  score: 78,
  grade: 'B+',
  pillars: [
    {
      name: 'infrastructure' as const,
      score: 82,
      weight: 40,
      trend: 'up' as const,
      change: 3
    },
    {
      name: 'perception' as const,
      score: 75,
      weight: 40,
      trend: 'down' as const,
      change: -2
    },
    {
      name: 'commerce' as const,
      score: 77,
      weight: 20,
      trend: 'stable' as const,
      change: 0
    }
  ],
  benchmarks: {
    industryRank: 12,
    totalBrands: 47,
    percentile: 67,
    category: 'Streetwear & Fashion',
    trend: {
      direction: 'up' as const,
      change: 2,
      period: '30-day'
    },
    nextReview: 'Jan 15, 2025'
  }
};

const mockAlerts = [
  {
    type: 'warning' as const,
    title: 'Answer Quality dropped -8pts',
    description: 'Likely cause: Gemini algorithm update on Dec 12',
    actionRequired: true
  },
  {
    type: 'success' as const,
    title: 'Quick win opportunity',
    description: 'Add review schema (+8pts, 2 weeks effort)',
    actionRequired: false
  },
  {
    type: 'info' as const,
    title: 'Competitor movement',
    description: 'Brand X gained +12pts this month',
    actionRequired: false
  }
];

/**
 * ADI Executive Dashboard
 * Main executive view with score gauge, pillars, and key insights
 */
export default function ADIExecutiveDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Discoverability Index</h1>
                  <p className="text-gray-600">Executive Intelligence Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                AIDI v2.0
              </Badge>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                New Evaluation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Executive Snapshot */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Score Gauge Section */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Overall AIDI Score</CardTitle>
              <CardDescription>
                Your AI discoverability performance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <ScoreGauge 
                score={mockADIData.score}
                grade={mockADIData.grade}
                size="lg"
                animated={true}
                showGrade={true}
              />
              <VerdictLine score={mockADIData.score} />
            </CardContent>
          </Card>

          {/* Pillar Breakdown */}
          <Card className="border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="text-xl">Pillar Breakdown</CardTitle>
              <CardDescription>
                Performance across the three AIDI pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PillarBreakdown 
                pillars={mockADIData.pillars}
                showTrends={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators and industry positioning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickStats 
              industryRank={mockADIData.benchmarks.industryRank}
              totalBrands={mockADIData.benchmarks.totalBrands}
              percentile={mockADIData.benchmarks.percentile}
              category={mockADIData.benchmarks.category}
              trend={mockADIData.benchmarks.trend}
              nextReview={mockADIData.benchmarks.nextReview}
            />
          </CardContent>
        </Card>

        {/* Alerts & Opportunities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Alerts & Opportunities
            </CardTitle>
            <CardDescription>
              Important updates and actionable insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAlerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                    alert.type === 'success' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded ${
                        alert.type === 'warning' ? 'bg-orange-200' :
                        alert.type === 'success' ? 'bg-green-200' :
                        'bg-blue-200'
                      }`}>
                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                        {alert.type === 'success' && <Lightbulb className="h-4 w-4 text-green-600" />}
                        {alert.type === 'info' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          alert.type === 'warning' ? 'text-orange-800' :
                          alert.type === 'success' ? 'text-green-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </div>
                        <div className={`text-sm mt-1 ${
                          alert.type === 'warning' ? 'text-orange-700' :
                          alert.type === 'success' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {alert.description}
                        </div>
                      </div>
                    </div>
                    {alert.actionRequired && (
                      <Button variant="outline" size="sm">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Detailed Analysis</CardTitle>
                  <CardDescription>Dimension-by-dimension breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Explore each of the 9 ADI dimensions with evidence and recommendations.
              </p>
              <Link href="/dashboard/adi/analysis">
                <Button variant="outline" className="w-full">
                  View Analysis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Benchmarking</CardTitle>
                  <CardDescription>Compare with competitors</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                See how you rank against industry leaders and identify gaps.
              </p>
              <Link href="/dashboard/adi/benchmarks">
                <Button variant="outline" className="w-full">
                  View Benchmarks
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Action Plan</CardTitle>
                  <CardDescription>Prioritized improvements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get specific, prioritized actions to improve your ADI score.
              </p>
              <Link href="/dashboard/adi/actions">
                <Button variant="outline" className="w-full">
                  View Actions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}