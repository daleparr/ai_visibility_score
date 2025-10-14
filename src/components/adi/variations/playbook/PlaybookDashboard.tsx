'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { CoreAEOPractices } from './CoreAEOPractices';
import { QuickWinsPanel } from './QuickWinsPanel';
import { StepByStepPlaybook } from './StepByStepPlaybook';
import { CitationTracker } from './CitationTracker';
import { CompactScoreCard } from './CompactScoreCard';
import { transformForPlaybookUX } from '@/lib/adi/ux-adapters';
import type { PlaybookUXData, AEOPractice, QuickWinItem } from '@/lib/adi/ux-adapters';

interface PlaybookDashboardProps {
  evaluationData?: any; // Would be typed Evaluation from schema
}

export function PlaybookDashboard({ evaluationData }: PlaybookDashboardProps) {
  const [data, setData] = useState<PlaybookUXData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Transform evaluation data for playbook UX
    if (evaluationData) {
      const transformed = transformForPlaybookUX(evaluationData);
      setData(transformed);
      setLoading(false);
    } else {
      // Fetch evaluation data if not provided
      loadEvaluationData();
    }
  }, [evaluationData]);

  const loadEvaluationData = async () => {
    try {
      // This would fetch from your API
      // For now, using mock data
      const mockEvaluation = {
        overallScore: 78,
        grade: 'B+',
        dimensionScores: [
          { dimension: 'schema_structured_data', score: 72 },
          { dimension: 'semantic_clarity', score: 68 },
          { dimension: 'llm_readability', score: 65 },
          { dimension: 'citation_authority', score: 82 },
          { dimension: 'reputation_signals', score: 85 },
          { dimension: 'ai_answer_quality', score: 75 }
        ]
      };

      const transformed = transformForPlaybookUX(mockEvaluation as any);
      setData(transformed);
    } catch (error) {
      console.error('Failed to load evaluation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeClick = (practice: AEOPractice) => {
    console.log('Practice clicked:', practice);
    // Navigate to detailed view or show modal
  };

  const handleCompleteWin = (winId: string) => {
    console.log('Complete quick win:', winId);
    // Mark as complete and track analytics
  };

  const handleLearnMore = (winId: string) => {
    console.log('Learn more about:', winId);
    // Navigate to documentation or tutorial
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No evaluation data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Hero Message */}
      <div className="mb-8 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-6 w-6" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            AEO Playbook
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">{data.heroMessage.title}</h1>
        <p className="text-xl text-blue-100 mb-4">{data.heroMessage.subtitle}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-blue-100">Optimize for:</span>
          {data.heroMessage.engines.map((engine) => (
            <Badge key={engine} variant="secondary" className="bg-white/10 text-white border-white/20">
              {engine}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Core Practices */}
        <div className="lg:col-span-2 space-y-6">
          <CoreAEOPractices
            practices={data.coreAEOPractices}
            onPracticeClick={handlePracticeClick}
          />

          <StepByStepPlaybook steps={data.stepByStepGuide} />
        </div>

        {/* Right Column - Quick Wins & Score */}
        <div className="space-y-6">
          <QuickWinsPanel
            quickWins={data.quickWins}
            onCompleteWin={handleCompleteWin}
            onLearnMore={handleLearnMore}
          />

          <CompactScoreCard
            score={data.compactScore.score}
            grade={data.compactScore.grade}
            rank={data.compactScore.rank}
            percentile={data.compactScore.percentile}
          />

          <CitationTracker data={data.citationTracking} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 p-6 bg-white rounded-xl border-2 border-blue-100 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Start your AEO audit this week
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Audit content → Add schema → Track citations
        </p>
        <div className="flex justify-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Get Implementation Guide
          </button>
          <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-300 transition-colors">
            Schedule Consultation
          </button>
        </div>
      </div>
    </div>
  );
}

