'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CitationData } from '@/lib/adi/ux-adapters';

interface CitationTrackerProps {
  data: CitationData;
}

export function CitationTracker({ data }: CitationTrackerProps) {
  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const sources = [
    { name: 'Perplexity', count: data.citationSources.perplexity, color: 'bg-purple-500' },
    { name: 'ChatGPT', count: data.citationSources.chatgpt, color: 'bg-green-500' },
    { name: 'Gemini', count: data.citationSources.gemini, color: 'bg-blue-500' },
    { name: 'Bing', count: data.citationSources.bing, color: 'bg-orange-500' }
  ];

  return (
    <Card className="border-2 border-purple-100">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span>Citation Tracking</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge
              variant={data.trendDirection === 'up' ? 'default' : 'secondary'}
              className={
                data.trendDirection === 'up'
                  ? 'bg-green-100 text-green-700'
                  : data.trendDirection === 'down'
                  ? 'bg-red-100 text-red-700'
                  : ''
              }
            >
              {data.trendDirection === 'up' && '↑'} 
              {data.trendDirection === 'down' && '↓'}
              {data.trendDirection === 'stable' && '→'}
            </Badge>
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Times your brand was cited by AI engines
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-gray-900">{data.totalCitations}</div>
          <div className="text-sm text-gray-600">Total Citations</div>
        </div>

        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${source.color}`} />
              <span className="text-sm font-medium text-gray-900 w-24">{source.name}</span>
              <div className="flex-grow bg-gray-200 rounded-full h-2">
                <div
                  className={`${source.color} h-2 rounded-full transition-all`}
                  style={{
                    width: `${Math.max(5, (source.count / data.totalCitations) * 100)}%`
                  }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-8 text-right">
                {source.count}
              </span>
            </div>
          ))}
        </div>

        {data.recentCitations && data.recentCitations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h5 className="text-sm font-semibold text-gray-900 mb-2">Recent Citations</h5>
            <div className="space-y-2">
              {data.recentCitations.slice(0, 3).map((citation, idx) => (
                <div key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{citation.source}:</span> {citation.context}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

