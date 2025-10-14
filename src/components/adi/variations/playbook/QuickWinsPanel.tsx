'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import type { QuickWinItem } from '@/lib/adi/ux-adapters';

interface QuickWinsPanelProps {
  quickWins: QuickWinItem[];
  onCompleteWin?: (winId: string) => void;
  onLearnMore?: (winId: string) => void;
}

export function QuickWinsPanel({ quickWins, onCompleteWin, onLearnMore }: QuickWinsPanelProps) {
  const completedCount = quickWins.filter(w => w.completed).length;
  
  return (
    <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Quick Wins
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {completedCount} of {quickWins.length} completed
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Fast Results
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickWins.map((win) => (
          <div
            key={win.id}
            className={`p-3 rounded-lg border-2 ${
              win.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-2">
              {win.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="h-5 w-5 border-2 border-gray-300 rounded flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-grow">
                <h5 className={`font-medium ${win.completed ? 'text-green-900' : 'text-gray-900'}`}>
                  {win.title}
                </h5>
                <p className="text-sm text-gray-600 mt-1">{win.description}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {win.estimatedMinutes}min
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +{win.impactScore} points
                  </Badge>
                </div>

                {!win.completed && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onCompleteWin?.(win.id)}
                      className="text-xs"
                    >
                      Start Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLearnMore?.(win.id)}
                      className="text-xs"
                    >
                      Learn More
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

