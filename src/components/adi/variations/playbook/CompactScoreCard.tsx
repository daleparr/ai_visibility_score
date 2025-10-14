'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface CompactScoreCardProps {
  score: number;
  grade: string;
  rank: number;
  percentile: number;
}

export function CompactScoreCard({ score, grade, rank, percentile }: CompactScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card className={`border-2 ${getScoreBgColor(score)}`}>
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Your Score</div>
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
            <span className="text-lg text-gray-500">/100</span>
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className={getScoreBgColor(score)}>
              Grade: {grade}
            </Badge>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Industry Rank</span>
            <span className="font-semibold text-gray-900">#{rank}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Percentile</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{percentile}th</span>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-center text-blue-900">
          You're in the top {100 - percentile}% 🎯
        </div>
      </CardContent>
    </Card>
  );
}

