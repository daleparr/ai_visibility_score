'use client';

import { useSession } from 'next-auth/react';
import { UXVariation, trackVariationView } from '@/lib/feature-flags';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useEffect } from 'react';
import { UXVariationToggle } from '@/components/adi/shared/UXVariationToggle';
import { PlaybookDashboard } from '@/components/adi/variations/playbook/PlaybookDashboard';

// Import your existing ADI dashboard pages
// For now, we'll use a placeholder for Executive dashboard
// You can replace this with your actual executive dashboard component
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, LayoutDashboard, ListChecks } from 'lucide-react';

/**
 * ADI Dashboard Router
 * Routes to appropriate UX variation based on feature flags
 */
export default function AIDIDashboardRouter() {
  const { data: session } = useSession();
  const userId = session?.user?.email || undefined;
  const { uxVariation, showVariationToggle } = useFeatureFlags(userId);

  // Track variation view for analytics
  useEffect(() => {
    if (userId) {
      trackVariationView(uxVariation, userId);
    }
  }, [uxVariation, userId]);

  return (
    <div className="relative min-h-screen">
      {/* QA Toggle - Only shown in development or for specific users */}
      {showVariationToggle && (
        <UXVariationToggle 
          currentVariation={uxVariation}
          userId={userId}
        />
      )}

      {/* Render appropriate variation */}
      {uxVariation === UXVariation.EXECUTIVE_FIRST ? (
        <ExecutiveFirstDashboard />
      ) : (
        <PlaybookDashboard />
      )}
    </div>
  );
}

/**
 * Executive-First Dashboard (Variation A)
 * This is a placeholder that routes to your existing executive components
 * Replace with your actual implementation
 */
function ExecutiveFirstDashboard() {
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
                  <p className="text-gray-600">Executive Dashboard</p>
                </div>
              </div>
            </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
              Executive View
              </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Placeholder - Replace with your existing executive components */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Executive-First Dashboard (Variation A)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This is the <strong>Executive-First</strong> variation. Replace this placeholder with your existing
              executive dashboard components:
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Integration Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Import your existing ScoreGauge component</li>
                <li>Import PillarBreakdown component</li>
                <li>Import RadarChart (DimensionAnalysis)</li>
                <li>Import LeaderboardTable (Benchmarking)</li>
                <li>Import ActionCard components</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <Link href="/dashboard/adi/executive">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Executive Snapshot</h4>
                    <p className="text-sm text-gray-600">View your existing executive dashboard</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/adi/analysis">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Dimension Analysis</h4>
                    <p className="text-sm text-gray-600">Deep dive into 9 dimensions</p>
            </CardContent>
          </Card>
              </Link>

              <Link href="/dashboard/adi/benchmarks">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Industry Benchmarking</h4>
                    <p className="text-sm text-gray-600">Compare against competitors</p>
            </CardContent>
          </Card>
              </Link>

              <Link href="/dashboard/adi/actions">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Priority Actions</h4>
                    <p className="text-sm text-gray-600">Traffic light system</p>
            </CardContent>
          </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Helpful note */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">🎯 Quick Setup</h3>
          <p className="mb-4">
            This is a router that shows the appropriate UX based on feature flags.
            The Playbook-First view is complete. For Executive-First, you can either:
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-left">
              <p className="font-semibold mb-1">Option 1 (Quick)</p>
              <p className="text-sm">Keep existing /dashboard/adi/executive route</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-left">
              <p className="font-semibold mb-1">Option 2 (Full)</p>
              <p className="text-sm">Move executive components here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
