'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UXVariation, trackVariationSwitch } from '@/lib/feature-flags';
import { LayoutDashboard, ListChecks, Settings } from 'lucide-react';

export function UXVariationToggle({ 
  currentVariation,
  userId 
}: { 
  currentVariation: UXVariation;
  userId?: string;
}) {
  const [variation, setVariation] = useState(currentVariation);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (newVariation: UXVariation) => {
    if (newVariation === variation) return;

    const oldVariation = variation;
    setVariation(newVariation);
    
    // Save to localStorage
    localStorage.setItem('ux_variation_override', newVariation);
    
    // Track the switch
    trackVariationSwitch(oldVariation, newVariation, 'toggle', userId);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('ux-variation-changed'));
    
    // Reload page to apply new variation
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <>
      {/* Floating QA Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-white border-2 border-blue-600 rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
        title="UX Variation Toggle (QA Mode)"
      >
        <Settings className="h-5 w-5 text-blue-600" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
      </button>

      {/* Toggle Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">QA Mode: UX Variation</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Executive-First Option */}
            <button
              onClick={() => handleToggle(UXVariation.EXECUTIVE_FIRST)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                variation === UXVariation.EXECUTIVE_FIRST
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`h-5 w-5 ${
                  variation === UXVariation.EXECUTIVE_FIRST ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900">Executive-First</div>
                  <div className="text-xs text-gray-600">Score-centric, analytics</div>
                </div>
                {variation === UXVariation.EXECUTIVE_FIRST && (
                  <Badge variant="default" className="bg-blue-600">Active</Badge>
                )}
              </div>
            </button>

            {/* Playbook-First Option */}
            <button
              onClick={() => handleToggle(UXVariation.PLAYBOOK_FIRST)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                variation === UXVariation.PLAYBOOK_FIRST
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListChecks className={`h-5 w-5 ${
                  variation === UXVariation.PLAYBOOK_FIRST ? 'text-green-600' : 'text-gray-600'
                }`} />
                <div className="flex-grow">
                  <div className="font-semibold text-gray-900">Playbook-First</div>
                  <div className="text-xs text-gray-600">Action-centric, quick wins</div>
                </div>
                {variation === UXVariation.PLAYBOOK_FIRST && (
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                )}
              </div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              This toggle is for QA testing only. Changes will reload the page.
            </p>
          </div>
        </div>
      )}

      {/* Overlay when panel is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

