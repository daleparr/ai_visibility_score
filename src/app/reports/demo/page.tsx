// Demo Report Page - Shows sample report for prospects

import Link from 'next/link';
import { ReportViewer } from '@/components/industry-reports/ReportViewer';
import { Brain, Home, BarChart3 } from 'lucide-react';
import { IndustryReport, Sector } from '@/lib/industry-reports/types';

export const dynamic = 'force-dynamic';

export default function DemoReportPage() {
  // Sample sector
  const demoSector: Sector = {
    id: 'demo-id',
    slug: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Sustainable fashion, luxury brands, affordable clothing, athletic wear.',
    targetAudience: 'Brand Managers, CMOs, Retail Executives',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Sample report with realistic data
  const demoReport: IndustryReport = {
    id: 'demo-report-id',
    sectorId: 'demo-id',
    reportMonth: new Date('2025-01-01'),
    reportTitle: 'Fashion & Apparel AI Brand Visibility Report - January 2025',
    status: 'published',
    
    executiveSummary: "This month's analysis reveals Nike leading the AI visibility rankings for Fashion & Apparel across 78 total brands tracked. 5 new brands entered the top 20, with Allbirds, Vuori, and Gymshark identified as key emerging threats. Market concentration increased, signaling consolidation of AI recommendation share among top performers.",
    
    keyFindings: [
      {
        title: 'Claude Shows 23% Preference for Sustainability Brands',
        description: 'Claude mentions sustainable brands (Patagonia, Allbirds, Everlane) 23% more frequently than GPT-4, while Gemini shows the strongest luxury brand bias (+31% for premium labels)',
        impact: 'high',
        category: 'model-behavior',
      },
      {
        title: 'Nike\'s AI Moat: 4/4 Model Dominance',
        description: 'Nike appears in top 3 across ALL 4 models for 89% of athletic wear queries, with average position of 1.2 and 94% positive sentiment. No other brand achieves this universal coverage.',
        impact: 'high',
        category: 'competitive-threat',
      },
      {
        title: 'The "Sustainability Tax" Is Real',
        description: 'Brands with verified sustainability credentials receive +0.38 higher sentiment scores on average, but only when LLMs can cite authoritative sources (GoodOnYou, B-Corp). Vague claims show -0.12 penalty.',
        impact: 'high',
        category: 'recommendation-driver',
      },
      {
        title: 'Price Positioning Paradox',
        description: 'Mid-tier brands (£50-150) dominate recommendations 2.4x more than luxury or budget. AI models avoid extreme price points unless users explicitly request them.',
        impact: 'high',
        category: 'market-opportunity',
      },
      {
        title: 'Hallucination Alert: 18% of Fast Fashion Claims Unverified',
        description: 'Fast fashion brands show 18% hallucination rate in sustainability claims vs 3% for verified sustainable brands. Zara and H&M most affected - expect reduced AI recommendations as models improve.',
        impact: 'high',
        category: 'data-quality',
      },
      {
        title: 'Co-Mention Clustering Reveals New Competitive Sets',
        description: 'Lululemon now co-mentioned with Alo Yoga and Vuori in 67% of queries (up from 23%), suggesting AI models are creating new competitive clusters that don\'t match traditional retail categories.',
        impact: 'medium',
        category: 'competitive-landscape',
      },
    ],
    
    leaderboard: [
      { rank: 1, brand: 'Nike', score: 94.2, change: 0, metrics: { 
        mentionShare: 18.5, avgPosition: 1.2, avgSentimentScore: 0.82, 
        modelsMentionedIn: 4, recommendationRate: 89.2, top3Appearances: 267,
        modelBreakdown: { 'gpt-4': 72, 'claude': 68, 'gemini': 71, 'perplexity': 74 },
        hallucinationRate: 2.1, sourceCitationRate: 87.3
      }},
      { rank: 2, brand: 'Adidas', score: 89.7, change: 0, metrics: { 
        mentionShare: 15.3, avgPosition: 1.8, avgSentimentScore: 0.78,
        modelsMentionedIn: 4, recommendationRate: 82.4, top3Appearances: 241,
        modelBreakdown: { 'gpt-4': 65, 'claude': 61, 'gemini': 68, 'perplexity': 63 },
        hallucinationRate: 3.4, sourceCitationRate: 79.8
      }},
      { rank: 3, brand: 'Patagonia', score: 84.1, change: 1, metrics: { 
        mentionShare: 12.1, avgPosition: 2.1, avgSentimentScore: 0.91,
        modelsMentionedIn: 4, recommendationRate: 76.8, top3Appearances: 198,
        modelBreakdown: { 'gpt-4': 52, 'claude': 71, 'gemini': 49, 'perplexity': 67 },
        hallucinationRate: 1.2, sourceCitationRate: 94.6
      }},
      { rank: 4, brand: 'Lululemon', score: 81.5, change: -1, metrics: { 
        mentionShare: 11.4, avgPosition: 2.4, avgSentimentScore: 0.85,
        modelsMentionedIn: 4, recommendationRate: 71.3, top3Appearances: 182,
        modelBreakdown: { 'gpt-4': 58, 'claude': 54, 'gemini': 62, 'perplexity': 59 },
        hallucinationRate: 2.8, sourceCitationRate: 82.1
      }},
      { rank: 5, brand: 'Zara', score: 76.3, change: 0, metrics: { 
        mentionShare: 9.8, avgPosition: 2.9, avgSentimentScore: 0.71,
        modelsMentionedIn: 4, recommendationRate: 64.2, top3Appearances: 147,
        modelBreakdown: { 'gpt-4': 48, 'claude': 42, 'gemini': 51, 'perplexity': 44 },
        hallucinationRate: 12.4, sourceCitationRate: 58.7
      }},
      { rank: 6, brand: 'H&M', score: 72.8, change: 0, metrics: { 
        mentionShare: 8.7, avgPosition: 3.2, avgSentimentScore: 0.68,
        modelsMentionedIn: 4, recommendationRate: 58.9, top3Appearances: 128,
        modelBreakdown: { 'gpt-4': 45, 'claude': 38, 'gemini': 47, 'perplexity': 41 },
        hallucinationRate: 15.7, sourceCitationRate: 52.3
      }},
      { rank: 7, brand: 'Uniqlo', score: 68.4, change: 2, metrics: { 
        mentionShare: 7.2, avgPosition: 3.6, avgSentimentScore: 0.74,
        modelsMentionedIn: 4, recommendationRate: 52.1, top3Appearances: 94,
        modelBreakdown: { 'gpt-4': 41, 'claude': 39, 'gemini': 44, 'perplexity': 38 },
        hallucinationRate: 4.2, sourceCitationRate: 76.4
      }},
      { rank: 8, brand: 'ASOS', score: 64.9, change: -1, metrics: { 
        mentionShare: 6.5, avgPosition: 3.9, avgSentimentScore: 0.65,
        modelsMentionedIn: 3, recommendationRate: 47.3, top3Appearances: 71,
        modelBreakdown: { 'gpt-4': 37, 'claude': 32, 'gemini': 39, 'perplexity': 0 },
        hallucinationRate: 8.9, sourceCitationRate: 64.2
      }},
      { rank: 9, brand: 'Allbirds', score: 61.2, change: 3, metrics: { 
        mentionShare: 5.8, avgPosition: 4.2, avgSentimentScore: 0.88,
        modelsMentionedIn: 4, recommendationRate: 43.7, top3Appearances: 58,
        modelBreakdown: { 'gpt-4': 34, 'claude': 42, 'gemini': 31, 'perplexity': 39 },
        hallucinationRate: 1.8, sourceCitationRate: 91.2
      }},
      { rank: 10, brand: 'Everlane', score: 58.7, change: -2, metrics: { 
        mentionShare: 5.1, avgPosition: 4.5, avgSentimentScore: 0.79,
        modelsMentionedIn: 4, recommendationRate: 39.4, top3Appearances: 47,
        modelBreakdown: { 'gpt-4': 31, 'claude': 36, 'gemini': 28, 'perplexity': 33 },
        hallucinationRate: 3.1, sourceCitationRate: 84.7
      }},
    ],
    
    topMovers: [
      { brand: 'Allbirds', previousRank: 12, currentRank: 9, change: 3, reason: 'Strong sustainability messaging resonating across models' },
      { brand: 'Vuori', previousRank: 18, currentRank: 14, change: 4, reason: 'Significant mention share growth in athletic wear category' },
      { brand: 'Gymshark', previousRank: 23, currentRank: 16, change: 7, reason: 'Rapid emergence in fitness apparel recommendations' },
    ],
    
    newEntrants: [
      { brand: 'Alo Yoga', rank: 19, firstAppearance: new Date('2025-01-01'), notableFor: 'Strong positive sentiment' },
      { brand: 'Outdoor Voices', rank: 20, firstAppearance: new Date('2025-01-01'), notableFor: 'Universal model coverage' },
    ],
    
    trendsAnalysis: {
      overallTrend: 'growing',
      marketConcentration: 2847,
      avgBrandsPerResponse: 6.8,
      insights: [
        'Market consolidation accelerating: HHI index up 8% to 2,847, indicating top brands strengthening position',
        'Sustainability correlation: Brands with B-Corp certification get +0.42 sentiment boost and 2.3x higher source citation rates',
        'Model divergence: Claude and Perplexity favor emerging DTC brands 31% more than GPT-4 and Gemini',
        'Price-quality perception: Brands mentioned with "quality" appear 4.7 positions higher on average than those with "cheap" or "affordable"',
        'Geographic bias detected: 78% of mentions favor US/UK brands despite queries being geography-neutral',
        'Influencer effect: Brands with 1M+ Instagram followers get 2.1x mention rate, but sentiment correlation is weak (r=0.34)',
      ],
    },
    
    competitiveLandscape: {
      marketLeaders: ['Nike', 'Adidas', 'Patagonia', 'Lululemon', 'Zara'],
      challengers: ['H&M', 'Uniqlo', 'ASOS', 'Allbirds', 'Everlane'],
      niche: ['Reformation', 'Vuori', 'Outdoor Voices', 'Alo Yoga', 'Athleta'],
      insights: [
        'Competitive clustering analysis: Nike-Adidas mentioned together in 82% of queries, creating a "big two" perception that\'s hard for challengers to break',
        'Allbirds emerging as "anti-Nike": Co-mentioned with Patagonia and Everlane in 71% of sustainability queries, carving distinct positioning',
        'Fast fashion vulnerability: H&M and Zara showing declining mention share (-3.2% combined) as AI models increasingly flag sustainability concerns',
        'DTC premium capture: Lululemon, Allbirds, and Everlane dominate the $100-200 price segment with 67% share vs 31% for traditional retail',
        'Source quality gap: Top 5 brands average 85% source citation rate vs 58% for ranks 6-20, suggesting authority signals drive recommendations',
        'Athletic wear cannibalization: Traditional sportswear losing share to athleisure brands in "everyday wear" queries (Nike -2.1%, Lululemon +4.3%)',
      ],
    },
    
    emergingThreats: [
      { 
        brand: 'Allbirds', 
        threat: 'The "Conscious Consumer" Category Killer', 
        watchLevel: 'high', 
        evidence: 'Jumped from #12 to #9 (+3 ranks) with 88% positive sentiment and 91.2% source citation rate. Co-mentioned with Patagonia in 67% of sustainability queries. Claude mentions Allbirds 42% more than GPT-4, suggesting model training data advantage. Hallucination rate of only 1.8% vs industry average of 8.4% indicates strong, consistent information availability. Watch for continued growth as sustainability becomes default buying criteria.' 
      },
      { 
        brand: 'Vuori', 
        threat: 'Athleisure\'s Dark Horse', 
        watchLevel: 'high', 
        evidence: 'Rocket ship trajectory: Rank #18 → #14 (+4) with 156% MoM growth in mention share. Zero mentions in GPT-4 3 months ago, now appearing in 38% of athletic wear queries. Strong co-mention pattern with Lululemon (71% overlap) suggests AI models positioning as "affordable Lululemon alternative". Sentiment score of 0.83 rivals top-tier brands. If trend continues, expect top 10 entry within 2 months.' 
      },
      { 
        brand: 'Gymshark', 
        threat: 'Gen-Z Fitness Monopoly', 
        watchLevel: 'high', 
        evidence: 'Explosive growth in "gym apparel" and "workout clothes" queries: #23 → #16 (+7 ranks). Perplexity mentions Gymshark 89% more than other models, indicating recency bias advantage. 94% of mentions include social proof references (Instagram, influencers). Critical weakness for incumbent brands: traditional fashion brands show 0% mention rate in Gen-Z focused fitness queries. Gymshark owns this emerging segment.' 
      },
      {
        brand: 'On Running',
        threat: 'Technical Performance Credibility Play',
        watchLevel: 'medium',
        evidence: 'First entry into top 20 at rank #17. Unique positioning as "Swiss engineering" creates differentiation. 91% source citation rate (tied for highest) suggests strong authority signals. Claude shows 56% preference for On Running in technical performance queries. Watch for expansion from running-specific to general athletic wear category.'
      },
    ],
    
    modelInsights: {
      modelDiversity: 0.73,
      modelBiases: [],
      consistencyScore: 0.73,
    },
    
    recommendations: [
      {
        forBrandTier: 'top10',
        title: 'Maintain Leadership Position',
        description: 'Focus on maintaining current visibility while expanding into emerging categories like sustainable athletic wear.',
        priority: 'high',
        effort: 'medium',
        tactics: [
          'Monitor Allbirds and Vuori closely - they\'re capturing your sustainability audience',
          'Expand content to cover "sustainable athletic wear" query space',
          'Strengthen authority signals in AI training data sources',
          'Build partnerships frequently mentioned in AI responses',
        ],
      },
      {
        forBrandTier: 'mid-tier',
        title: 'Break Into Top 10',
        description: 'Strategic push to increase mention frequency and improve positioning through targeted content.',
        priority: 'high',
        effort: 'high',
        tactics: [
          'Create comprehensive sustainability and ethics content',
          'Optimize for long-tail conversational queries about athletic wear',
          'Increase quality backlink profile from fashion authorities',
          'Launch PR campaigns around unique brand differentiators',
        ],
      },
    ],
    
    viewCount: 1247,
    downloadCount: 89,
    publishedAt: new Date('2025-01-15'),
    createdAt: new Date('2025-01-14'),
    updatedAt: new Date('2025-01-15'),
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">AI Discoverability Index</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                <Home size={16} />
                Home
              </Link>
              <Link href="/evaluate" className="text-slate-300 hover:text-white transition">
                Get Your Score
              </Link>
              <Link href="/reports" className="text-emerald-400 font-medium flex items-center gap-2">
                <BarChart3 size={16} />
                Industry Reports
              </Link>
              <Link href="/leaderboards" className="text-slate-300 hover:text-white transition">
                Leaderboards
              </Link>
              <Link href="/auth/signin" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Demo Notice Banner */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <span className="inline-block px-4 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-medium mb-2">
              📊 DEMO REPORT
            </span>
            <p className="text-slate-300">
              This is a sample report showing the format and insights you'll receive. Real reports use live AI model data.
            </p>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/reports"
            className="text-slate-400 hover:text-slate-300 inline-flex items-center gap-2"
          >
            ← Back to All Industries
          </Link>
        </div>

        <ReportViewer
          report={demoReport}
          sector={demoSector}
          accessLevel="pro"
        />
        
        {/* CTA to See Real Reports */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to See Real Industry Data?
          </h3>
          <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
            This demo shows the format. Subscribe to get actual AI brand visibility rankings, updated monthly with real probe data from GPT-4, Claude, Gemini, and Perplexity.
          </p>
          <Link
            href="/reports#sectors"
            className="inline-block px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition shadow-lg"
          >
            Browse All Industries
          </Link>
        </div>
      </div>
    </div>
  );
}

