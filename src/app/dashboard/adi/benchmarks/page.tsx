'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { 
  BarChart3,
  Users,
  TrendingUp,
  Award,
  Target,
  Download,
  Share,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Eye
} from 'lucide-react';
import Link from 'next/link';

// Import benchmarking components
import { LeaderboardTable } from '../../../../components/adi/benchmarking/LeaderboardTable';
import { PercentileIndicator } from '../../../../components/adi/benchmarking/PercentileIndicator';
import { FilterControls } from '../../../../components/adi/benchmarking/FilterControls';
import type { BenchmarkFilters } from '../../../../lib/adi/ui-types';

// Mock leaderboard data
const mockLeaderboardData = [
  {
    rank: 1,
    brand: 'Supreme',
    score: 94,
    infrastructure: 96,
    perception: 93,
    commerce: 92,
    strength: 'AI Answers',
    gap: '',
    badge: '🏆',
    isCurrentBrand: false,
    trend: { direction: 'up' as const, change: 2 }
  },
  {
    rank: 2,
    brand: 'Nike',
    score: 91,
    infrastructure: 89,
    perception: 94,
    commerce: 90,
    strength: 'Authority',
    gap: '',
    badge: '🥇',
    isCurrentBrand: false,
    trend: { direction: 'stable' as const, change: 0 }
  },
  {
    rank: 3,
    brand: 'Adidas',
    score: 88,
    infrastructure: 92,
    perception: 86,
    commerce: 87,
    strength: 'Schema',
    gap: '',
    badge: '🥈',
    isCurrentBrand: false,
    trend: { direction: 'up' as const, change: 3 }
  },
  {
    rank: 12,
    brand: 'Your Brand',
    score: 78,
    infrastructure: 82,
    perception: 75,
    commerce: 77,
    strength: 'Schema',
    gap: 'Reviews',
    badge: '',
    isCurrentBrand: true,
    trend: { direction: 'up' as const, change: 2 }
  },
  {
    rank: 13,
    brand: 'Competitor A',
    score: 76,
    infrastructure: 74,
    perception: 79,
    commerce: 75,
    strength: 'Authority',
    gap: 'Schema',
    badge: '',
    isCurrentBrand: false,
    trend: { direction: 'down' as const, change: -1 }
  },
  {
    rank: 14,
    brand: 'Competitor B',
    score: 74,
    infrastructure: 71,
    perception: 78,
    commerce: 73,
    strength: 'Reputation',
    gap: 'Commerce',
    badge: '',
    isCurrentBrand: false,
    trend: { direction: 'up' as const, change: 5 }
  }
];

/**
 * ADI Benchmarks Dashboard
 * Comprehensive competitive intelligence and industry positioning
 */
export default function ADIBenchmarksDashboard() {
  const [filters, setFilters] = useState<BenchmarkFilters>({
    industry: 'Streetwear & Fashion',
    region: undefined,
    companySize: undefined,
    timePeriod: undefined
  });

  const currentBrandData = mockLeaderboardData.find(entry => entry.isCurrentBrand);
  const directCompetitors = mockLeaderboardData.filter(entry => 
    !entry.isCurrentBrand && Math.abs(entry.rank - (currentBrandData?.rank || 0)) <= 3
  );

  const handleFilterChange = (newFilters: BenchmarkFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleBrandClick = (brand: string) => {
    console.log('Analyze brand:', brand);
    // In real implementation, this would navigate to competitor analysis
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
                <h1 className="text-2xl font-bold text-gray-900">Industry Benchmarking</h1>
                <p className="text-gray-600">Competitive intelligence and market positioning</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700">
                Live Data
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
        {/* Your Position Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Percentile Indicator */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Your Market Position
              </CardTitle>
              <CardDescription>
                Where you stand in the {filters.industry || 'industry'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PercentileIndicator
                percentile={67}
                totalBrands={47}
                industryRank={12}
                category={filters.industry || 'Streetwear & Fashion'}
                showDetails={true}
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Competitive Insights */}
          <Card className="border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Competitive Insights
              </CardTitle>
              <CardDescription>
                Analysis vs direct competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800">Ahead of</div>
                    <div className="text-lg font-bold text-green-600">
                      {mockLeaderboardData.filter(b => b.rank > (currentBrandData?.rank || 0)).length} brands
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-sm font-medium text-orange-800">Behind</div>
                    <div className="text-lg font-bold text-orange-600">
                      {(currentBrandData?.rank || 1) - 1} brands
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">vs Direct Competitors</span>
                    <span className="text-sm text-blue-600">+2 pts ahead of average</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">Biggest Opportunity</span>
                    <span className="text-sm text-green-600">Reviews schema (+8 pts)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-800">Threat Alert</span>
                    <span className="text-sm text-red-600">Competitor A gained +12 pts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Industry Leaderboard
            </CardTitle>
            <CardDescription>
              Rankings for {filters.industry || 'all industries'} 
              {filters.region && ` in ${filters.region}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <LeaderboardTable
              data={mockLeaderboardData}
              currentBrand="Your Brand"
              filters={filters}
              onFilterChange={handleFilterChange}
              onBrandClick={handleBrandClick}
              pageSize={20}
            />
          </CardContent>
        </Card>

        {/* Competitive Intelligence */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Market Trends
              </CardTitle>
              <CardDescription>
                Industry movement and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Rising Stars</span>
                  </div>
                  <div className="text-sm text-green-700">
                    3 brands gained 10+ points this quarter through schema optimization
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Opportunity</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Knowledge Graph presence is the biggest differentiator this quarter
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Algorithm Impact</span>
                  </div>
                  <div className="text-sm text-orange-700">
                    Recent Gemini update affected 23% of brands negatively
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Competitors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Direct Competitors
              </CardTitle>
              <CardDescription>
                Brands within 5 ranks of your position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {directCompetitors.map((competitor, index) => (
                  <div 
                    key={competitor.brand}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleBrandClick(competitor.brand)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">
                        #{competitor.rank} {competitor.brand}
                      </div>
                      {competitor.trend && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            competitor.trend.direction === 'up' ? 'bg-green-100 text-green-700' :
                            competitor.trend.direction === 'down' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          )}
                        >
                          {competitor.trend.direction === 'up' ? '+' : competitor.trend.direction === 'down' ? '' : '±'}{competitor.trend.change}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">
                        {competitor.score}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Competitive Gap Analysis
                </div>
                <div className="text-xs text-blue-700">
                  You're <span className="font-semibold">+2 points</span> ahead of the average competitor in your range.
                  Focus on <span className="font-semibold">review schema</span> to match top performers.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Competitive Actions</CardTitle>
            <CardDescription>
              Strategic moves to improve your market position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-red-800">Immediate (2 weeks)</span>
                </div>
                <div className="text-sm text-red-700 mb-2">
                  Close the review schema gap to match top 3 performers
                </div>
                <div className="text-xs text-red-600">
                  Expected gain: +8 points, Move to rank #8-9
                </div>
              </div>

              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-yellow-800">Short-term (30 days)</span>
                </div>
                <div className="text-sm text-yellow-700 mb-2">
                  Optimize hero products to match Nike's approach
                </div>
                <div className="text-xs text-yellow-600">
                  Expected gain: +5 points, Strengthen commerce pillar
                </div>
              </div>

              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">Strategic (90 days)</span>
                </div>
                <div className="text-sm text-green-700 mb-2">
                  Build knowledge graph presence like Supreme
                </div>
                <div className="text-xs text-green-600">
                  Expected gain: +12 points, Enter top 5
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}