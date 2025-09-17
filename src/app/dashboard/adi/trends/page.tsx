'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { 
  TrendingUp,
  Bell,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Info,
  CheckCircle,
  ArrowLeft,
  Settings,
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../../../lib/utils';

// Import trend components
import { TrendChart } from '../../../../components/adi/trends/TrendChart';
import { AlertCard } from '../../../../components/adi/trends/AlertCard';
import type { TrendDataPoint, ChartEvent, Alert } from '../../../../lib/adi/ui-types';

// Mock trend data
const mockTrendData: TrendDataPoint[] = [
  { date: 'Jan', score: 65, infrastructure: 68, perception: 62, commerce: 64 },
  { date: 'Feb', score: 67, infrastructure: 70, perception: 64, commerce: 66 },
  { date: 'Mar', score: 72, infrastructure: 75, perception: 69, commerce: 71 },
  { date: 'Apr', score: 74, infrastructure: 76, perception: 72, commerce: 73 },
  { date: 'May', score: 76, infrastructure: 78, perception: 74, commerce: 75 },
  { date: 'Jun', score: 78, infrastructure: 80, perception: 76, commerce: 77 },
  { date: 'Jul', score: 80, infrastructure: 82, perception: 78, commerce: 79 },
  { date: 'Aug', score: 79, infrastructure: 81, perception: 77, commerce: 78 },
  { date: 'Sep', score: 77, infrastructure: 80, perception: 74, commerce: 77 },
  { date: 'Oct', score: 75, infrastructure: 79, perception: 71, commerce: 76 },
  { date: 'Nov', score: 76, infrastructure: 80, perception: 72, commerce: 77 },
  { date: 'Dec', score: 78, infrastructure: 82, perception: 75, commerce: 77 }
];

const mockEvents: ChartEvent[] = [
  {
    date: 'Mar',
    type: 'positive',
    title: 'Schema Update',
    description: 'Implemented product schema markup'
  },
  {
    date: 'Oct',
    type: 'negative',
    title: 'Algorithm Change',
    description: 'Gemini algorithm update affected rankings'
  },
  {
    date: 'Dec',
    type: 'positive',
    title: 'Review Launch',
    description: 'Customer review system launched'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Answer Quality dropped -8pts in 7 days',
    description: 'Detected on Dec 15, 2024. Likely cause: Gemini algorithm update on Dec 12. Impact: Affecting 23% of brand queries.',
    timestamp: '2024-12-15T10:00:00Z',
    actionRequired: true,
    dismissed: false
  },
  {
    id: '2',
    type: 'success',
    title: 'Quick Win Identified: Review Schema Implementation',
    description: 'Potential gain: +8 points overall score. Effort required: Low (2 weeks development). Success rate: 94% based on similar implementations.',
    timestamp: '2024-12-14T15:30:00Z',
    actionRequired: false,
    dismissed: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Competitor "Brand X" gained +12pts this month',
    description: 'Previous score: 74 → Current score: 86. Key improvements: Schema (+8), Authority (+4). Threat level: Medium (now ranks #8 vs your #12).',
    timestamp: '2024-12-13T09:15:00Z',
    actionRequired: false,
    dismissed: false
  },
  {
    id: '4',
    type: 'info',
    title: 'Industry benchmark update available',
    description: 'Q4 2024 benchmarks now include 15 new brands in your category. Your relative position may have changed.',
    timestamp: '2024-12-12T14:20:00Z',
    actionRequired: false,
    dismissed: false
  }
];

/**
 * ADI Trends & Alerts Dashboard
 * Performance monitoring and alert management
 */
export default function ADITrendsDashboard() {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '12m'>('12m');
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'success'>('all');

  // Filter alerts
  const filteredAlerts = mockAlerts.filter(alert => {
    if (alertFilter === 'all') return !alert.dismissed;
    return alert.type === alertFilter && !alert.dismissed;
  });

  // Alert counts
  const alertCounts = {
    critical: mockAlerts.filter(a => a.type === 'critical' && !a.dismissed).length,
    warning: mockAlerts.filter(a => a.type === 'warning' && !a.dismissed).length,
    info: mockAlerts.filter(a => a.type === 'info' && !a.dismissed).length,
    success: mockAlerts.filter(a => a.type === 'success' && !a.dismissed).length
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
    // In real implementation, this would update the alert status
  };

  const handleAlertAction = (alertId: string) => {
    console.log('Taking action on alert:', alertId);
    // In real implementation, this would navigate to relevant action or analysis
  };

  const handleSnoozeAlert = (alertId: string, duration: string) => {
    console.log('Snoozing alert:', alertId, 'for', duration);
    // In real implementation, this would schedule the alert to reappear
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
                <h1 className="text-2xl font-bold text-gray-900">Trends & Alerts</h1>
                <p className="text-gray-600">Performance monitoring and notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700">
                {filteredAlerts.length} Active Alerts
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Alert Settings
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Alert Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-red-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{alertCounts.critical}</div>
                  <div className="text-sm text-gray-600">Critical Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{alertCounts.warning}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{alertCounts.success}</div>
                  <div className="text-sm text-gray-600">Opportunities</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{alertCounts.info}</div>
                  <div className="text-sm text-gray-600">Information</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              AIDI score evolution over time with key events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={mockTrendData}
              timeRange={timeRange}
              showEvents={true}
              events={mockEvents}
              height={400}
              onTimeRangeChange={setTimeRange}
            />
          </CardContent>
        </Card>

        {/* Alert Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter alerts:</span>
          </div>
          
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Alerts', count: filteredAlerts.length },
              { key: 'critical', label: '🚨 Critical', count: alertCounts.critical },
              { key: 'warning', label: '⚠️ Warning', count: alertCounts.warning },
              { key: 'success', label: '💡 Opportunities', count: alertCounts.success },
              { key: 'info', label: 'ℹ️ Info', count: alertCounts.info }
            ].map(filter => (
              <Button
                key={filter.key}
                variant={alertFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlertFilter(filter.key as any)}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Important updates and actionable insights requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, index) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismissAlert}
                    onAction={handleAlertAction}
                    onSnooze={handleSnoozeAlert}
                    showActions={true}
                    compact={false}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Active Alerts
                  </h3>
                  <p className="text-gray-600">
                    Your AIDI performance is stable with no immediate issues requiring attention.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Email Alerts</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm">Critical drops (over 10 points)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm">Opportunity alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span className="text-sm">Competitor movements</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm">Weekly digest</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Push Notifications</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="push" defaultChecked className="border-gray-300" />
                    <span className="text-sm">Urgent only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="push" className="border-gray-300" />
                    <span className="text-sm">All alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="push" className="border-gray-300" />
                    <span className="text-sm">Disabled</span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Real-time</option>
                    <option>Daily digest</option>
                    <option>Weekly summary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Recipients</div>
                  <div className="text-xs text-gray-600">admin@yourbrand.com, team@yourbrand.com</div>
                </div>
                <Button variant="outline" size="sm">
                  Manage Recipients
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}