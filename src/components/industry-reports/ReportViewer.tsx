'use client';

// Report Viewer Component - displays industry report with proper gating

import { IndustryReport, Sector } from '@/lib/industry-reports/types';
import { useState } from 'react';
import { BarChart, TrendingUp, AlertTriangle, Target, Download } from 'lucide-react';

interface ReportViewerProps {
  report: IndustryReport;
  sector: Sector;
  accessLevel: 'free' | 'pro' | 'enterprise';
}

export function ReportViewer({ report, sector, accessLevel }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'trends' | 'recommendations'>('overview');
  
  const monthName = new Date(report.reportMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  
  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-8 border border-slate-600">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-emerald-400 text-sm font-medium mb-2">
              {monthName}
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              {report.reportTitle}
            </h2>
            <div className="flex gap-4 text-sm text-slate-400">
              <span>📊 {report.leaderboard?.length || 0} brands tracked</span>
              <span>👁️ {report.viewCount} views</span>
              {report.downloadCount > 0 && (
                <span>⬇️ {report.downloadCount} downloads</span>
              )}
            </div>
          </div>
          
          {accessLevel !== 'free' && report.pdfUrl && (
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
              <Download size={16} />
              Download PDF
            </button>
          )}
        </div>
        
        {/* Executive Summary */}
        <div className="mt-6 prose prose-invert max-w-none">
          <p className="text-slate-200 leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700">
        <div className="flex gap-4">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart size={16} />}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
            icon={<TrendingUp size={16} />}
            label="Leaderboard"
          />
          <TabButton
            active={activeTab === 'trends'}
            onClick={() => setActiveTab('trends')}
            icon={<AlertTriangle size={16} />}
            label="Trends & Threats"
          />
          <TabButton
            active={activeTab === 'recommendations'}
            onClick={() => setActiveTab('recommendations')}
            icon={<Target size={16} />}
            label="Recommendations"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab report={report} accessLevel={accessLevel} />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab report={report} accessLevel={accessLevel} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab report={report} accessLevel={accessLevel} />
        )}
        {activeTab === 'recommendations' && (
          <RecommendationsTab report={report} accessLevel={accessLevel} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
        active
          ? 'border-emerald-500 text-emerald-400'
          : 'border-transparent text-slate-400 hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function OverviewTab({ report, accessLevel }: { report: IndustryReport; accessLevel: string }) {
  return (
    <div className="space-y-8">
      {/* Key Findings */}
      <section>
        <h3 className="text-2xl font-bold text-white mb-4">Key Findings</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.keyFindings?.map((finding, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
            >
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                finding.impact === 'high'
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : finding.impact === 'medium'
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
              }`}>
                {finding.impact.toUpperCase()} IMPACT
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {finding.title}
              </h4>
              <p className="text-slate-400 text-sm">
                {finding.description}
              </p>
            </div>
          ))}
        </div>
        
        {accessLevel === 'free' && report.keyFindings && report.keyFindings.length > 3 && (
          <div className="mt-4 text-center text-slate-400 text-sm">
            🔒 Upgrade to see {report.keyFindings.length - 3} more key findings
          </div>
        )}
      </section>

      {/* Top Movers */}
      {report.topMovers && report.topMovers.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Top Movers</h3>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg divide-y divide-slate-700">
            {report.topMovers.map((mover, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{mover.brand}</div>
                  <div className="text-sm text-slate-400">
                    #{mover.previousRank} → #{mover.currentRank}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">
                    +{mover.change} ranks
                  </div>
                  {mover.reason && (
                    <div className="text-xs text-slate-500">{mover.reason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Market Trends */}
      {report.trendsAnalysis && (
        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Market Trends</h3>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <MetricCard
                label="Overall Trend"
                value={report.trendsAnalysis.overallTrend}
                color={report.trendsAnalysis.overallTrend === 'growing' ? 'emerald' : 'yellow'}
              />
              <MetricCard
                label="Market Concentration"
                value={report.trendsAnalysis.marketConcentration}
                unit=" HHI"
                color="blue"
              />
              <MetricCard
                label="Avg Brands/Response"
                value={report.trendsAnalysis.avgBrandsPerResponse}
                color="purple"
              />
            </div>
            <div className="space-y-2">
              {report.trendsAnalysis.insights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function LeaderboardTab({ report, accessLevel }: { report: IndustryReport; accessLevel: string }) {
  const visibleCount = accessLevel === 'free' ? 10 : report.leaderboard?.length || 0;
  const leaderboard = report.leaderboard?.slice(0, visibleCount) || [];
  
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Brand Rankings</h3>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Brand</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Score</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Change</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Share %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {leaderboard.map((entry) => (
              <tr key={entry.rank} className="hover:bg-slate-700/30 transition">
                <td className="px-6 py-4">
                  <span className={`font-bold ${
                    entry.rank <= 3 ? 'text-yellow-400 text-lg' : 'text-slate-400'
                  }`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  {entry.brand}
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {entry.score.toFixed(1)}
                </td>
                <td className="px-6 py-4 text-right">
                  {entry.change > 0 && (
                    <span className="text-emerald-400">+{entry.change}</span>
                  )}
                  {entry.change < 0 && (
                    <span className="text-red-400">{entry.change}</span>
                  )}
                  {entry.change === 0 && (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-slate-300">
                  {entry.metrics.mentionShare?.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {accessLevel === 'free' && report.leaderboard && report.leaderboard.length > 10 && (
        <div className="mt-6 text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-slate-300 mb-4">
            🔒 <strong>{report.leaderboard.length - 10} more brands</strong> in full leaderboard
          </p>
          <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition">
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}

function TrendsTab({ report, accessLevel }: { report: IndustryReport; accessLevel: string }) {
  return (
    <div className="space-y-8">
      {/* Emerging Threats */}
      {report.emergingThreats && report.emergingThreats.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Emerging Threats</h3>
          <div className="space-y-4">
            {report.emergingThreats.map((threat, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{threat.brand}</h4>
                    <div className="text-sm text-slate-400 mt-1">{threat.threat}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    threat.watchLevel === 'high'
                      ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                      : threat.watchLevel === 'medium'
                      ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                      : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  }`}>
                    {threat.watchLevel.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{threat.evidence}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competitive Landscape */}
      {report.competitiveLandscape && (
        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Competitive Landscape</h3>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <LandscapeCard
              title="Market Leaders"
              brands={report.competitiveLandscape.marketLeaders}
              color="emerald"
            />
            <LandscapeCard
              title="Challengers"
              brands={report.competitiveLandscape.challengers}
              color="yellow"
            />
            <LandscapeCard
              title="Niche Players"
              brands={report.competitiveLandscape.niche}
              color="blue"
            />
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h4 className="font-semibold text-white mb-3">Insights</h4>
            <div className="space-y-2">
              {report.competitiveLandscape.insights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function RecommendationsTab({ report, accessLevel }: { report: IndustryReport; accessLevel: string }) {
  const visibleRecs = accessLevel === 'enterprise'
    ? report.recommendations
    : accessLevel === 'pro'
    ? report.recommendations?.filter(r => ['top10', 'mid-tier'].includes(r.forBrandTier))
    : report.recommendations?.slice(0, 1);
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Strategic Recommendations</h3>
      {visibleRecs?.map((rec, idx) => (
        <div
          key={idx}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-emerald-400 uppercase">
                For {rec.forBrandTier.replace('-', ' ')} Brands
              </span>
              <h4 className="text-xl font-semibold text-white mt-1">{rec.title}</h4>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                rec.priority === 'high'
                  ? 'bg-red-600/20 text-red-400'
                  : rec.priority === 'medium'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-blue-600/20 text-blue-400'
              }`}>
                {rec.priority} priority
              </span>
              <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                {rec.effort} effort
              </span>
            </div>
          </div>
          <p className="text-slate-300 mb-4">{rec.description}</p>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-sm font-medium text-emerald-400 mb-2">Action Items:</div>
            <ul className="space-y-2">
              {rec.tactics?.map((tactic, tidx) => (
                <li key={tidx} className="flex items-start gap-2 text-slate-300 text-sm">
                  <span className="text-emerald-400 mt-0.5">→</span>
                  <span>{tactic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
      
      {accessLevel !== 'enterprise' && (
        <div className="mt-6 text-center p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <p className="text-slate-300 mb-4">
            🔒 Unlock all recommendations and brand-tier specific strategies
          </p>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
            Upgrade to Enterprise
          </button>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit = '', color = 'blue' }: {
  label: string;
  value: any;
  unit?: string;
  color?: string;
}) {
  const colors = {
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };
  
  return (
    <div className="text-center">
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colors[color as keyof typeof colors]}`}>
        {typeof value === 'string' ? value : value.toFixed(1)}{unit}
      </div>
    </div>
  );
}

function LandscapeCard({ title, brands, color }: {
  title: string;
  brands: string[];
  color: string;
}) {
  const colors = {
    emerald: 'border-emerald-600/30 bg-emerald-600/10',
    yellow: 'border-yellow-600/30 bg-yellow-600/10',
    blue: 'border-blue-600/30 bg-blue-600/10',
  };
  
  return (
    <div className={`border rounded-lg p-4 ${colors[color as keyof typeof colors]}`}>
      <h4 className="font-semibold text-white mb-3">{title}</h4>
      <div className="space-y-1">
        {brands?.slice(0, 5).map((brand, idx) => (
          <div key={idx} className="text-sm text-slate-300">
            • {brand}
          </div>
        ))}
        {brands && brands.length > 5 && (
          <div className="text-xs text-slate-500">+{brands.length - 5} more</div>
        )}
      </div>
    </div>
  );
}

