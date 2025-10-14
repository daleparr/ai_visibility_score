'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Circle } from 'lucide-react';
import type { AEOPractice } from '@/lib/adi/ux-adapters';

interface CoreAEOPracticesProps {
  practices: AEOPractice[];
  onPracticeClick?: (practice: AEOPractice) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'good':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'in-progress':
    case 'partial':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    case 'not-started':
    case 'needs-attention':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'completed': 'Good',
    'good': 'Good',
    'in-progress': 'Partial',
    'partial': 'Partial',
    'needs-attention': 'Needs work',
    'not-started': 'Not implemented'
  };
  return statusMap[status] || status;
};

export function CoreAEOPractices({ practices, onPracticeClick }: CoreAEOPracticesProps) {
  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Core AEO Practices</CardTitle>
        <p className="text-sm text-gray-600">
          Answer Engine Optimisation = SEO reimagined for AI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {practices.map((practice, index) => (
          <button
            key={practice.id || index}
            onClick={() => onPracticeClick?.(practice)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{practice.icon}</span>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {practice.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(practice.status)}
                    <Badge
                      variant={
                        practice.status === 'completed' || practice.status === 'good'
                          ? 'default'
                          : practice.status === 'partial' || practice.status === 'in-progress'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        practice.status === 'partial' || practice.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ''
                      }
                    >
                      {getStatusText(practice.status)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{practice.description}</p>
                
                {/* Progress bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      practice.score >= 80
                        ? 'bg-green-600'
                        : practice.score >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${practice.score}%` }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

