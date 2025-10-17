'use client';

import { TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, ExternalLink, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Citation {
  id: string;
  platform: string;
  platformIcon?: string;
  query: string;
  position: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  snippet: string;
  date: Date;
  url?: string;
  category?: string;
}

interface CitationTrackerProps {
  citations: Citation[];
  className?: string;
}

export function CitationTracker({ citations, className = '' }: CitationTrackerProps) {
  const stats = {
    total: citations.length,
    positive: citations.filter(c => c.sentiment === 'positive').length,
    neutral: citations.filter(c => c.sentiment === 'neutral').length,
    negative: citations.filter(c => c.sentiment === 'negative').length,
    avgPosition: citations.length > 0 
      ? Math.round(citations.reduce((acc, c) => acc + c.position, 0) / citations.length)
      : 0
  };

  const positiveRate = citations.length > 0 
    ? Math.round((stats.positive / stats.total) * 100)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Mentions</div>
          <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
            <TrendingUp className="h-4 w-4" />
            <span>+12% vs last week</span>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600">{stats.positive}</div>
          <div className="text-sm text-gray-600 mt-1">Positive Sentiment</div>
          <div className="text-sm text-gray-500 mt-2">
            {positiveRate}% positive rate
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-purple-600">#{stats.avgPosition}</div>
          <div className="text-sm text-gray-600 mt-1">Avg Position</div>
          <div className="text-sm text-gray-500 mt-2">
            In AI responses
          </div>
        </div>
      </div>

      {/* Citation List */}
      {citations.length > 0 ? (
        <div className="space-y-3">
          {citations.map((citation) => (
            <div 
              key={citation.id} 
              className="p-4 bg-white rounded-lg border hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{citation.platform}</span>
                  <span className="text-sm text-gray-500">• Position #{citation.position}</span>
                  {citation.category && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {citation.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {citation.sentiment === 'positive' ? (
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                  ) : citation.sentiment === 'negative' ? (
                    <ThumbsDown className="h-5 w-5 text-orange-600" />
                  ) : (
                    <div className="h-5 w-5" /> // Neutral - no icon
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                <span className="font-medium">Query:</span> "{citation.query}"
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-2 border-blue-400 mb-3">
                "{citation.snippet}"
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(citation.date), { addSuffix: true })}</span>
                </div>
                {citation.url && (
                  <a 
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    View source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No citations found yet</p>
          <p className="text-sm text-gray-500 mt-1">
            We're tracking AI platforms for mentions of your brand.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Check back in 24-48 hours for results.
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboard preview
export function CitationPreview({ citations }: { citations: Citation[] }) {
  const recentCitations = citations.slice(0, 3);
  
  if (recentCitations.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No citations yet
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {recentCitations.map((citation) => (
        <div key={citation.id} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
          <div className="flex-shrink-0 mt-1">
            {citation.sentiment === 'positive' ? (
              <ThumbsUp className="h-4 w-4 text-green-600" />
            ) : (
              <ThumbsDown className="h-4 w-4 text-orange-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">
              {citation.platform} • Position #{citation.position}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {citation.query}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


