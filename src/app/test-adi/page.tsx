'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Crown,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

// Import all ADI components for testing
import { ScoreGauge } from '../../components/adi/executive/ScoreGauge';
import { PillarBreakdown } from '../../components/adi/executive/PillarBreakdown';
import { QuickStats } from '../../components/adi/executive/QuickStats';
import { VerdictLine } from '../../components/adi/executive/VerdictLine';
import { RadarChart } from '../../components/adi/analysis/RadarChart';
import { StarRating } from '../../components/adi/analysis/StarRating';
import { DimensionScoreCard } from '../../components/adi/analysis/DimensionScoreCard';
import { LeaderboardTable } from '../../components/adi/benchmarking/LeaderboardTable';
import { PercentileIndicator } from '../../components/adi/benchmarking/PercentileIndicator';
import { FilterControls } from '../../components/adi/benchmarking/FilterControls';
import { ActionCard } from '../../components/adi/actions/ActionCard';
import { TrendChart } from '../../components/adi/trends/TrendChart';
import { AlertCard } from '../../components/adi/trends/AlertCard';

// Mock data for comprehensive testing
const mockData = {
  score: 78,
  grade: 'B+',
  pillars: [
    { name: 'infrastructure' as const, score: 82, weight: 40, trend: 'up' as const, change: 3 },
    { name: 'perception' as const, score: 75, weight: 40, trend: 'down' as const, change: -2 },
    { name: 'commerce' as const, score: 77, weight: 20, trend: 'stable' as const, change: 0 }
  ],
  quickStats: {
    industryRank: 12,
    totalBrands: 47,
    percentile: 67,
    category: 'Streetwear & Fashion',
    trend: { direction: 'up' as const, change: 2, period: '30-day' },
    nextReview: 'Jan 15, 2025'
  },
  dimensions: [
    { dimension: 'Schema & Structured Data', score: 85, maxScore: 100, categoryAverage: 72, trend: 'up' as const },
    { dimension: 'AI Answer Quality & Presence', score: 82, maxScore: 100, categoryAverage: 69, trend: 'up' as const },
    { dimension: 'LLM Readability & Conversational Copy', score: 79, maxScore: 100, categoryAverage: 74, trend: 'up' as const },
    { dimension: 'Hero Products & Use-Case Retrieval', score: 77, maxScore: 100, categoryAverage: 65, trend: 'up' as const },
    { dimension: 'Reputation Signals', score: 75, maxScore: 100, categoryAverage: 70, trend: 'up' as const },
    { dimension: 'Policies & Logistics Clarity', score: 74, maxScore: 100, categoryAverage: 67, trend: 'stable' as const },
    { dimension: 'Semantic Clarity & Ontology', score: 72, maxScore: 100, categoryAverage: 68, trend: 'stable' as const },
    { dimension: 'Citation Authority & Freshness', score: 71, maxScore: 100, categoryAverage: 73, trend: 'stable' as const },
    { dimension: 'Knowledge Graphs & Entity Linking', score: 68, maxScore: 100, categoryAverage: 71, trend: 'down' as const }
  ],
  leaderboard: [
    { rank: 1, brand: 'Supreme', score: 94, infrastructure: 96, perception: 93, commerce: 92, strength: 'AI Answers', gap: '', badge: '🏆', isCurrentBrand: false, trend: { direction: 'up' as const, change: 2 } },
    { rank: 12, brand: 'Your Brand', score: 78, infrastructure: 82, perception: 75, commerce: 77, strength: 'Schema', gap: 'Reviews', badge: '', isCurrentBrand: true, trend: { direction: 'up' as const, change: 2 } }
  ],
  actions: [
    {
      id: '1',
      priority: 'immediate' as const,
      title: 'Add Review Schema to Product Pages',
      description: 'Missing on 68% of PDPs, hurting AI answer quality',
      why: 'Competitors with reviews score 15+ points higher',
      steps: ['Audit schema', 'Implement markup', 'Test validation'],
      expectedLift: { overall: 8, dimension: 'AI Answer Quality', dimensionLift: 15 },
      revenueImpact: '+$180K ARR',
      effort: 'low' as const,
      timeline: '2 weeks',
      status: 'not-started' as const
    }
  ],
  trendData: [
    { date: 'Jan', score: 65, infrastructure: 68, perception: 62, commerce: 64 },
    { date: 'Dec', score: 78, infrastructure: 82, perception: 75, commerce: 77 }
  ],
  alerts: [
    {
      id: '1',
      type: 'critical' as const,
      title: 'Answer Quality dropped -8pts',
      description: 'Likely cause: Gemini algorithm update',
      timestamp: '2024-12-15T10:00:00Z',
      actionRequired: true,
      dismissed: false
    }
  ]
};

/**
 * ADI Component Testing Page
 * Comprehensive testing environment for all ADI components
 */
export default function ADITestPage() {
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('executive');

  const tabs = [
    { id: 'executive', label: 'Executive Components', icon: Crown },
    { id: 'analysis', label: 'Analysis Components', icon: BarChart3 },
    { id: 'benchmarking', label: 'Benchmarking Components', icon: Users },
    { id: 'actions', label: 'Actions & Trends', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ADI Component Testing</h1>
              <p className="text-gray-600">Comprehensive manual testing environment</p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
              Test Environment
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Executive Components */}
        {activeTab === 'executive' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Score Gauge Component</CardTitle>
                <CardDescription>Animated gauge with grade display</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ScoreGauge score={mockData.score} grade={mockData.grade} size="lg" animated={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pillar Breakdown Component</CardTitle>
                <CardDescription>Three-pillar visualization with trends</CardDescription>
              </CardHeader>
              <CardContent>
                <PillarBreakdown pillars={mockData.pillars} showTrends={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats Component</CardTitle>
                <CardDescription>Performance metrics and context</CardDescription>
              </CardHeader>
              <CardContent>
                <QuickStats {...mockData.quickStats} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verdict Line Component</CardTitle>
                <CardDescription>Dynamic verdict messaging</CardDescription>
              </CardHeader>
              <CardContent>
                <VerdictLine score={mockData.score} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Components */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Radar Chart Component</CardTitle>
                <CardDescription>9-dimension interactive visualization</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <RadarChart 
                  data={mockData.dimensions} 
                  categoryAverage={mockData.dimensions.map(d => ({ ...d, score: d.categoryAverage || 0 }))}
                  size={400} 
                  interactive={true} 
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {mockData.dimensions.slice(0, 4).map((dimension, index) => (
                <DimensionScoreCard
                  key={index}
                  dimension={dimension}
                  categoryAverage={dimension.categoryAverage}
                  expanded={index === 0}
                  showEvidence={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Benchmarking Components */}
        {activeTab === 'benchmarking' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Percentile Indicator Component</CardTitle>
                <CardDescription>Market positioning visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <PercentileIndicator
                  percentile={mockData.quickStats.percentile}
                  totalBrands={mockData.quickStats.totalBrands}
                  industryRank={mockData.quickStats.industryRank}
                  category={mockData.quickStats.category}
                  showDetails={true}
                  size="lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter Controls Component</CardTitle>
                <CardDescription>Advanced filtering interface</CardDescription>
              </CardHeader>
              <CardContent>
                <FilterControls
                  filters={filters}
                  onFilterChange={setFilters}
                  onClearFilters={() => setFilters({})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard Table Component</CardTitle>
                <CardDescription>Industry rankings with sorting</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <LeaderboardTable
                  data={mockData.leaderboard}
                  currentBrand="Your Brand"
                  filters={filters}
                  onFilterChange={setFilters}
                  pageSize={10}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions & Trends Components */}
        {activeTab === 'actions' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Action Card Component</CardTitle>
                <CardDescription>Traffic light prioritization system</CardDescription>
              </CardHeader>
              <CardContent>
                <ActionCard action={mockData.actions[0]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Chart Component</CardTitle>
                <CardDescription>Performance trends with event markers</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendChart
                  data={mockData.trendData}
                  timeRange="12m"
                  showEvents={true}
                  events={[]}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Card Component</CardTitle>
                <CardDescription>Notification system with severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertCard
                  alert={mockData.alerts[0]}
                  showActions={true}
                  compact={false}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}