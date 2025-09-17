'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { 
  Target,
  Clock,
  TrendingUp,
  DollarSign,
  Play,
  CheckCircle,
  ArrowLeft,
  Filter,
  Download,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';

// Import action components
import { ActionCard } from '../../../../components/adi/actions/ActionCard';
import type { ActionItem } from '../../../../lib/adi/ui-types';

// Mock action data
const mockActions: ActionItem[] = [
  {
    id: '1',
    priority: 'immediate',
    title: 'Add Review Schema to Product Pages',
    description: 'Missing on 68% of PDPs, hurting AI answer quality and trust signals',
    why: 'Competitors with reviews score 15+ points higher in AI Answer Quality. Missing review markup prevents AI systems from understanding customer sentiment and product quality.',
    steps: [
      'Audit current schema implementation (2 days)',
      'Implement Review markup on top 50 products (1 week)',
      'Test with Google Rich Results and validate (3 days)',
      'Roll out to full catalog (2 days)'
    ],
    expectedLift: {
      overall: 8,
      dimension: 'AI Answer Quality',
      dimensionLift: 15
    },
    revenueImpact: '+$180K ARR',
    effort: 'low',
    timeline: '2 weeks',
    status: 'not-started'
  },
  {
    id: '2',
    priority: 'short-term',
    title: 'Optimize Hero Product Descriptions for AI',
    description: 'AI systems struggle to identify your key products and use cases',
    why: 'Current descriptions are SEO-focused, not AI conversation-optimized. Natural language descriptions help AI systems better understand and recommend your products.',
    steps: [
      'Identify top 10 hero products by revenue and traffic (3 days)',
      'Rewrite descriptions with natural language and use cases (2 weeks)',
      'A/B test new descriptions vs current (1 week)',
      'Roll out to full catalog based on results (1 week)'
    ],
    expectedLift: {
      overall: 5,
      dimension: 'Hero Products',
      dimensionLift: 12
    },
    revenueImpact: '+$120K ARR',
    effort: 'medium',
    timeline: '30 days',
    status: 'not-started'
  },
  {
    id: '3',
    priority: 'strategic',
    title: 'Build Knowledge Graph Presence',
    description: 'Competitors have 3x more entity connections in knowledge graphs',
    why: 'Missing from Wikipedia, Wikidata, and industry databases limits AI systems\' ability to understand your brand context and authority.',
    steps: [
      'Create comprehensive Wikipedia presence (4 weeks)',
      'Add structured data to Wikidata (2 weeks)',
      'Register with industry databases and directories (4 weeks)',
      'Build relationships with fashion/streetwear entities (ongoing)'
    ],
    expectedLift: {
      overall: 12,
      dimension: 'Knowledge Graphs',
      dimensionLift: 25
    },
    revenueImpact: '+$300K ARR',
    effort: 'high',
    timeline: '90 days',
    status: 'not-started'
  }
];

/**
 * ADI Actions Dashboard
 * Priority action planning with traffic light system
 */
export default function ADIActionsDashboard() {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'immediate' | 'short-term' | 'strategic'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');

  // Filter actions
  const filteredActions = mockActions.filter(action => {
    const priorityMatch = selectedPriority === 'all' || action.priority === selectedPriority;
    const statusMatch = selectedStatus === 'all' || (action.status || 'not-started') === selectedStatus;
    return priorityMatch && statusMatch;
  });

  // Calculate summary stats
  const totalImpact = mockActions.reduce((sum, action) => sum + action.expectedLift.overall, 0);
  const totalRevenue = mockActions.reduce((sum, action) => {
    const revenue = parseInt(action.revenueImpact?.replace(/[^\d]/g, '') || '0');
    return sum + revenue;
  }, 0);

  const handleStartAction = (actionId: string) => {
    console.log('Starting action:', actionId);
    // In real implementation, this would update the action status
  };

  const handleLearnMore = (actionId: string) => {
    console.log('Learn more about action:', actionId);
    // In real implementation, this would show detailed implementation guide
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
                <h1 className="text-2xl font-bold text-gray-900">Action Plan</h1>
                <p className="text-gray-600">Prioritized roadmap to AIDI excellence</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-green-100 text-gray-700">
                Traffic Light System
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Plan
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Impact Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">+{totalImpact}</div>
                  <div className="text-sm text-gray-600">Total Point Potential</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">${totalRevenue}K</div>
                  <div className="text-sm text-gray-600">Revenue Impact</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {mockActions.filter(a => a.priority === 'immediate').length}
                  </div>
                  <div className="text-sm text-gray-600">Immediate Actions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {mockActions.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex space-x-2">
            <span className="text-sm text-gray-600">Priority:</span>
            {[
              { key: 'all', label: 'All', count: mockActions.length },
              { key: 'immediate', label: '🔴 Immediate', count: mockActions.filter(a => a.priority === 'immediate').length },
              { key: 'short-term', label: '🟡 Short-term', count: mockActions.filter(a => a.priority === 'short-term').length },
              { key: 'strategic', label: '🟢 Strategic', count: mockActions.filter(a => a.priority === 'strategic').length }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={selectedPriority === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(filter.key as any)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Projected Impact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Projected Impact
            </CardTitle>
            <CardDescription>
              Expected results from implementing all actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">Current Score</div>
                <div className="text-2xl font-bold text-blue-600">78/100</div>
                <div className="text-xs text-blue-700">Grade B+</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">Potential Score</div>
                <div className="text-2xl font-bold text-green-600">95/100</div>
                <div className="text-xs text-green-700">Grade A (capped by competition)</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm font-medium text-purple-800 mb-1">Industry Ranking</div>
                <div className="text-2xl font-bold text-purple-600">#3-5</div>
                <div className="text-xs text-purple-700">Top 10% territory</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm font-medium text-yellow-800 mb-1">
                Total Revenue Impact: +${totalRevenue}K ARR over 12 months
              </div>
              <div className="text-xs text-yellow-700">
                Based on improved AI shelf share and conversion optimization
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="space-y-6">
          {filteredActions.map((action, index) => (
            <ActionCard
              key={action.id}
              action={action}
              onStartAction={handleStartAction}
              onLearnMore={handleLearnMore}
            />
          ))}
        </div>

        {/* Implementation Timeline */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Timeline</CardTitle>
            <CardDescription>
              Recommended sequence for maximum impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Weeks 1-2: Review Schema Implementation</div>
                  <div className="text-sm text-gray-600">Quick win with high impact, low effort</div>
                </div>
                <Badge className="bg-red-100 text-red-700">🔴 Immediate</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">2</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Weeks 3-6: Hero Product Optimization</div>
                  <div className="text-sm text-gray-600">Build on schema foundation with content improvements</div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700">🟡 Short-term</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Weeks 7-18: Knowledge Graph Development</div>
                  <div className="text-sm text-gray-600">Long-term foundation building for sustained advantage</div>
                </div>
                <Badge className="bg-green-100 text-green-700">🟢 Strategic</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">
                Success Metrics & Milestones
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-xs text-blue-700">
                <div>
                  <div className="font-medium">Week 2 Milestone</div>
                  <div>+8 points overall score</div>
                  <div>Review schema on 100% PDPs</div>
                </div>
                <div>
                  <div className="font-medium">Week 6 Milestone</div>
                  <div>+13 points cumulative</div>
                  <div>Hero products optimized</div>
                </div>
                <div>
                  <div className="font-medium">Week 18 Milestone</div>
                  <div>+25 points cumulative</div>
                  <div>Top 5 industry ranking</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}