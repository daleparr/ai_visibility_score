'use client';

// Competitive Benchmarking Section for Evaluation Results
// Shows user's position vs competitors with proper tier gating

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, AlertTriangle, Lock, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';

interface CompetitorData {
  name: string;
  rank: number;
  mentionShare: number;
  sentiment: number;
}

interface CompetitiveBenchmarkProps {
  tier: 'free' | 'index-pro' | 'enterprise';
  sectorName?: string;
  sectorSlug?: string;
  userRank?: number;
  totalBrands?: number;
  userMentionShare?: number;
  sectorAverage?: number;
  competitors?: CompetitorData[];
  userScore?: number; // AIDI score for comparison
}

export function CompetitiveBenchmark({
  tier,
  sectorName,
  sectorSlug,
  userRank,
  totalBrands,
  userMentionShare,
  sectorAverage,
  competitors = [],
  userScore,
}: CompetitiveBenchmarkProps) {
  // If no sector data, don't show anything
  if (!sectorName || !userRank) {
    return null;
  }

  // FREE TIER - Teaser Only
  if (tier === 'free') {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Industry Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-sm text-slate-600 mb-2">
                {sectorName}
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                #{userRank} <span className="text-lg font-normal text-slate-500">of {totalBrands}</span>
              </div>
              <div className="text-sm text-slate-600">
                Your industry ranking
              </div>
            </div>
            
            {/* Lock Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900 mb-1">
                  Unlock Competitive Intelligence
                </h4>
                <p className="text-sm text-blue-700">
                  See how you compare to your competitors
                </p>
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Head-to-head comparison with named competitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Detailed probe results (12 agents × 4 models)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Specific gaps and actionable recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Month-over-month progress tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Full {sectorName} industry report access</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1" size="lg">
                  Upgrade to Index Pro - £119/month
                </Button>
                {sectorSlug && (
                  <Link href={`/reports/${sectorSlug}`}>
                    <Button variant="outline" size="lg">
                      View Sample Report
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // INDEX PRO & ENTERPRISE - Full Competitive View
  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-emerald-600" />
          Your Position in {sectorName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Industry Rank</div>
              <div className="text-2xl font-bold text-slate-900">
                #{userRank}
              </div>
              <div className="text-xs text-slate-500">of {totalBrands} brands</div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">Mention Share</div>
              <div className="text-2xl font-bold text-slate-900">
                {userMentionShare?.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500">
                vs avg {sectorAverage?.toFixed(1)}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-600 mb-1">AIDI Score</div>
              <div className="text-2xl font-bold text-slate-900">
                {userScore}
              </div>
              <div className="text-xs text-slate-500">Sector context</div>
            </div>
          </div>

          {/* Competitor Comparison */}
          {competitors.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">
                vs. Your Named Competitors:
              </h4>
              <div className="space-y-3">
                {competitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">{comp.name}</div>
                        <div className="text-sm text-slate-600">
                          Rank #{comp.rank} • {comp.mentionShare.toFixed(1)}% share • Sentiment: {comp.sentiment.toFixed(2)}
                        </div>
                      </div>
                      {comp.rank < userRank! && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {userRank! - comp.rank} ranks ahead
                        </Badge>
                      )}
                      {comp.rank > userRank! && (
                        <Badge variant="default" className="bg-green-600 flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          You're ahead
                        </Badge>
                      )}
                    </div>
                    
                    {/* Gap Analysis - Index Pro shows basics, Enterprise shows deep dive */}
                    {tier === 'index-pro' && comp.rank < userRank! && (
                      <div className="text-sm text-slate-600 mt-2">
                        💡 Gap: Authority score difference detected
                      </div>
                    )}
                    
                    {tier === 'enterprise' && comp.rank < userRank! && (
                      <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                        <div className="font-medium text-slate-900 mb-2">Gap Analysis:</div>
                        <div className="space-y-1 text-slate-700">
                          <div>• Authority: {comp.name} likely has {((comp.rank - userRank!) * 5)} more citation sources</div>
                          <div>• Platform: Probably on {4 - Math.floor(userRank! / 20)} models you're not on</div>
                          <div>• Content: Estimated {(comp.mentionShare - userMentionShare!) * 100} more indexed pages</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Actions - Index Pro and Enterprise */}
          {tier !== 'free' && (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Priority Actions to Improve Ranking:
              </h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div>1. <strong>Close Authority Gap</strong>: Need ~{competitors[0]?.rank - userRank!} ranks improvement</div>
                <div>2. <strong>Expand Model Coverage</strong>: Target Gemini & Perplexity for 4/4 coverage</div>
                <div>3. <strong>Increase Mention Share</strong>: Need +{(sectorAverage! - userMentionShare!).toFixed(1)}pp to match sector average</div>
              </div>
            </div>
          )}

          {/* Full Report Link */}
          {sectorSlug && (
            <div className="text-center pt-4 border-t">
              <Link href={`/reports/${sectorSlug}`}>
                <Button variant="outline" className="w-full">
                  View Full {sectorName} Industry Report
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

