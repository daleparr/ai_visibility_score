'use client';

import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

/**
 * Embeddable comparison table: Audit-Grade vs Monitoring-Grade AEO Tools
 * Based on locked brand positioning
 */

interface ComparisonRow {
  category?: string;
  feature: string;
  searchable: 'yes' | 'no' | 'limited';
  aidi: 'yes' | 'no' | 'limited';
  whyItMatters: string;
  searchableNote?: string;
  aidiNote?: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  // METHODOLOGY & RIGOR
  {
    category: 'Methodology & Rigor',
    feature: 'Standardized test framework',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Reproducible results, fair comparison across brands',
    searchableNote: 'User-defined prompts (inconsistent)',
    aidiNote: 'Locked framework (same every time)'
  },
  {
    feature: 'Industry benchmarking',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Know where you stand vs competitors',
    searchableNote: 'Isolated scores (no context)',
    aidiNote: 'Industry percentiles (1st-99th)'
  },
  {
    feature: 'Bias-free testing',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Reflects real buyer behavior, not branded queries',
    searchableNote: 'Branded queries common (false positives)',
    aidiNote: 'Unbranded, generic queries only'
  },
  {
    feature: 'Statistical validation',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Prove improvements with confidence',
    searchableNote: 'Single runs (variance unknown)',
    aidiNote: '3+ run average with 95% CI'
  },
  {
    feature: 'Peer-reviewable methodology',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Third-party validation, regulatory compliance',
    searchableNote: 'Proprietary black box',
    aidiNote: 'Published, open framework'
  },
  
  // SITE ACCESS & COVERAGE
  {
    category: 'Site Access & Coverage',
    feature: 'Public site crawling',
    searchable: 'yes',
    aidi: 'yes',
    whyItMatters: 'Basic coverage',
    searchableNote: 'Automated',
    aidiNote: 'Automated'
  },
  {
    feature: 'Password-protected sites',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Pre-launch evaluation, M&A due diligence',
    searchableNote: 'Cannot access',
    aidiNote: 'Human-assisted deep audit with credentials'
  },
  {
    feature: 'Staging environments',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Test before production launch',
    searchableNote: 'Public pages only',
    aidiNote: 'Full access with credentials'
  },
  {
    feature: 'Member/gated content',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Complete user experience analysis',
    searchableNote: 'Cannot access',
    aidiNote: 'Full site with credentials'
  },
  
  // ENTERPRISE READINESS
  {
    category: 'Enterprise Readiness',
    feature: 'Board-ready reporting',
    searchable: 'limited',
    aidi: 'yes',
    whyItMatters: 'Strategic decision-making',
    searchableNote: 'Practitioner dashboards',
    aidiNote: 'C-suite formatted reports'
  },
  {
    feature: 'Audit trail documentation',
    searchable: 'limited',
    aidi: 'yes',
    whyItMatters: 'Compliance, governance',
    searchableNote: 'Limited trail',
    aidiNote: 'Complete audit trail (all prompts/responses)'
  },
  {
    feature: 'API access',
    searchable: 'limited',
    aidi: 'yes',
    whyItMatters: 'BI integration, data scientist workflows',
    searchableNote: 'Unknown availability',
    aidiNote: 'Full REST API (developer tier)'
  },
  {
    feature: 'SLA guarantees',
    searchable: 'limited',
    aidi: 'yes',
    whyItMatters: 'Mission-critical operations',
    searchableNote: 'SaaS standard',
    aidiNote: 'Enterprise tier available'
  },
  
  // USE CASE FIT
  {
    category: 'Use Case Fit',
    feature: 'Daily monitoring',
    searchable: 'yes',
    aidi: 'limited',
    whyItMatters: 'Ongoing tactical optimization',
    searchableNote: 'Excellent',
    aidiNote: 'Overkill (use Searchable)'
  },
  {
    feature: 'Quarterly strategic planning',
    searchable: 'limited',
    aidi: 'yes',
    whyItMatters: 'Board presentations, budgets',
    searchableNote: 'Not rigorous enough',
    aidiNote: 'Built for this'
  },
  {
    feature: 'M&A due diligence',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Investment decisions',
    searchableNote: 'Cannot access protected targets',
    aidiNote: 'Full pre-acquisition analysis'
  },
  {
    feature: 'Performance attribution',
    searchable: 'no',
    aidi: 'yes',
    whyItMatters: 'Prove ROI, justify budget',
    searchableNote: 'Cannot prove causation (methodology changes)',
    aidiNote: 'Statistical significance testing'
  }
];

export function BenchmarkComparisonTable() {
  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          Monitoring-Grade vs Audit-Grade: Which Do You Need?
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Both are valuable for mature AEO programs. Here's how they differ and when to use each.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                Capability
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/4">
                <div className="flex flex-col items-center">
                  <span className="text-lg">Searchable</span>
                  <span className="text-xs font-normal text-gray-500 mt-1">Monitoring-Grade</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/4">
                <div className="flex flex-col items-center">
                  <span className="text-lg">AIDI</span>
                  <span className="text-xs font-normal text-gray-500 mt-1">Audit-Grade</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/4">
                Why It Matters
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, idx) => (
              <React.Fragment key={idx}>
                {row.category && (
                  <tr className="bg-blue-50 border-b">
                    <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-blue-900">
                      {row.category}
                    </td>
                  </tr>
                )}
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  <td className="px-6 py-4">
                    <StatusCell 
                      status={row.searchable} 
                      note={row.searchableNote}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <StatusCell 
                      status={row.aidi} 
                      note={row.aidiNote}
                      highlight
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.whyItMatters}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold mb-2">Use Searchable When:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Daily practitioner monitoring</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Quick tactical feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Trending alerts</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Budget: $100-1,000/month</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold mb-2">Use AIDI When:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Board presentations & strategic planning</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>M&A due diligence & pre-launch evaluation</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Competitive intelligence & benchmarking</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Budget: $2,500-10,000 per audit</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="flex items-start gap-3">
          <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Use Both for Mature AEO Programs</h3>
            <p className="text-sm text-gray-700">
              Many enterprises use Searchable for daily monitoring and AIDI for quarterly validation.
              Complementary tools serving different needs: tactical optimization (Searchable) and 
              strategic intelligence (AIDI).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCell({ 
  status, 
  note, 
  highlight = false 
}: { 
  status: 'yes' | 'no' | 'limited'; 
  note?: string;
  highlight?: boolean;
}) {
  const config = {
    yes: {
      icon: Check,
      color: highlight ? 'text-green-600' : 'text-green-500',
      bg: highlight ? 'bg-green-100' : 'bg-green-50',
      label: 'Yes'
    },
    no: {
      icon: X,
      color: 'text-red-500',
      bg: 'bg-red-50',
      label: 'No'
    },
    limited: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      label: 'Limited'
    }
  };

  const { icon: Icon, color, bg, label } = config[status];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
      {note && (
        <div className="text-xs text-gray-500 text-center max-w-xs">
          {note}
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar/smaller spaces
export function BenchmarkComparisonCompact() {
  const keyDifferences = [
    { feature: 'Methodology', searchable: 'User-defined', aidi: 'Systematic' },
    { feature: 'Benchmarking', searchable: 'None', aidi: 'Industry percentiles' },
    { feature: 'Protected sites', searchable: 'No access', aidi: 'Full audit' },
    { feature: 'Statistical rigor', searchable: 'Single runs', aidi: '95% CI, p-values' },
    { feature: 'Use case', searchable: 'Daily monitoring', aidi: 'Strategic planning' }
  ];

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Monitoring vs Benchmark</h3>
      <div className="space-y-3">
        {keyDifferences.map((diff, idx) => (
          <div key={idx} className="text-sm">
            <div className="font-medium text-gray-900 mb-1">{diff.feature}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-600">
                Searchable: {diff.searchable}
              </div>
              <div className="text-purple-700 font-medium">
                AIDI: {diff.aidi}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-600">
          Both valuable, different purposes.
          Use Searchable for tactics, AIDI for strategy.
        </p>
      </div>
    </div>
  );
}

// Hero comparison for landing pages
export function BenchmarkVsMonitoringHero() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
      {/* Monitoring-Grade */}
      <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
        <div className="text-sm font-semibold text-blue-600 mb-2">MONITORING-GRADE</div>
        <h3 className="text-2xl font-bold mb-4">Tools like Searchable</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-blue-600" />
            <span>Daily practitioner monitoring</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-blue-600" />
            <span>Quick tactical feedback</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-blue-600" />
            <span>User-customizable tests</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-blue-600" />
            <span>Trending alerts</span>
          </div>
        </div>
        <div className="pt-4 border-t border-blue-200">
          <div className="text-xs text-blue-700 mb-2">Perfect for:</div>
          <div className="text-sm font-medium text-blue-900">
            Day-to-day optimization
          </div>
          <div className="text-xs text-blue-600 mt-2">
            Pricing: $99-999/month
          </div>
        </div>
      </div>

      {/* Audit-Grade */}
      <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
            BENCHMARK STANDARD
          </span>
        </div>
        <div className="text-sm font-semibold text-purple-600 mb-2">AUDIT-GRADE</div>
        <h3 className="text-2xl font-bold mb-4">AIDI Platform</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Systematic benchmarking</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Statistical validation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Industry percentiles</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-purple-600" />
            <span>Protected site access</span>
          </div>
        </div>
        <div className="pt-4 border-t border-purple-200">
          <div className="text-xs text-purple-700 mb-2">Perfect for:</div>
          <div className="text-sm font-medium text-purple-900">
            Board presentations, M&A, strategic planning
          </div>
          <div className="text-xs text-purple-600 mt-2">
            Pricing: $2,500-10,000 per audit
          </div>
        </div>
      </div>
    </div>
  );
}

export default BenchmarkComparisonTable;

