'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { PlaybookStep } from '@/lib/adi/ux-adapters';

interface StepByStepPlaybookProps {
  steps: PlaybookStep[];
}

export function StepByStepPlaybook({ steps }: StepByStepPlaybookProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Step-by-Step Playbook</CardTitle>
        <p className="text-sm text-gray-600">
          Follow these steps to improve your AI discoverability
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {step.number}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {step.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs text-gray-500 mr-1">Tools:</span>
                    {step.tools.map((tool, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {step.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={idx === 0 ? 'default' : 'outline'}
                      onClick={action.onClick}
                    >
                      {action.href ? (
                        <a href={action.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          {action.label}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <>
                          {action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

