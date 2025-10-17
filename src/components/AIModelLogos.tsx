'use client';

import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

interface AIModel {
  logo_slug: string;
  logo_name: string;
  file_url: string;
  model_version: string;
  is_displayed: boolean;
  badge_text?: string;
}

interface AIModelLogosProps {
  userTier?: 'free' | 'index-pro' | 'enterprise';
  showUpgradePrompt?: boolean;
  variant?: 'homepage' | 'report';
  className?: string;
}

export function AIModelLogos({ 
  userTier = 'free',
  showUpgradePrompt = true,
  variant = 'homepage',
  className = ''
}: AIModelLogosProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, [userTier]);

  const loadModels = async () => {
    try {
      const response = await fetch(`/api/ai-models?tier=${userTier}`);
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('Failed to load AI models:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedModels = models.filter(m => m.is_displayed);
  const lockedModels = models.filter(m => !m.is_displayed);
  const hasLockedModels = lockedModels.length > 0;

  if (loading) {
    return null;
  }

  return (
    <div className={className}>
      {/* Headline */}
      {variant === 'homepage' && (
        <div className="text-center mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            AI Models Analyzed
          </h3>
          <p className="text-xs text-gray-600">
            {userTier === 'free' 
              ? 'Free tier uses GPT-3.5. Upgrade for frontier model access.'
              : 'Testing across all major frontier models for comprehensive insights'
            }
          </p>
        </div>
      )}

      {variant === 'report' && (
        <h3 className="text-lg font-semibold mb-4">🤖 AI Models Analyzed</h3>
      )}

      {/* Model Logos Grid */}
      <div className="grid grid-cols-5 gap-4">
        {/* Displayed Models (Available to this tier) */}
        {displayedModels.map((model) => (
          <div key={model.logo_slug} className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center p-2 group hover:border-blue-500 transition-all">
              <img
                src={model.file_url}
                alt={model.logo_name}
                className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
              />
              {model.badge_text && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  ✓
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-gray-700">{model.logo_name}</div>
              {model.model_version && (
                <div className="text-xs text-gray-500">{model.model_version}</div>
              )}
            </div>
          </div>
        ))}

        {/* Locked Models (Not available to this tier) */}
        {lockedModels.map((model) => (
          <div key={model.logo_slug} className="flex flex-col items-center opacity-40">
            <div className="relative w-20 h-20 rounded-lg bg-gray-100 border-2 border-gray-300 border-dashed flex items-center justify-center p-2">
              <img
                src={model.file_url}
                alt={`${model.logo_name} - Locked`}
                className="max-w-full max-h-full object-contain grayscale blur-sm"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-gray-500">{model.logo_name}</div>
              <div className="text-xs text-gray-400">Locked</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade Prompt for Free Users */}
      {hasLockedModels && showUpgradePrompt && userTier === 'free' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">
                🔓 Unlock All {lockedModels.length} Frontier Models
              </div>
              <div className="text-xs text-gray-700">
                Index Pro tests across GPT-4, Claude 3.5 Sonnet, Gemini Pro, Perplexity & Mistral for comprehensive AI visibility analysis
              </div>
            </div>
            <Link 
              href="/pricing?highlight=index-pro"
              className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Model Count Badge for Reports */}
      {variant === 'report' && (
        <div className="mt-4 text-xs text-gray-600">
          <span className="font-semibold">{displayedModels.length} AI models tested</span>
          {hasLockedModels && userTier === 'free' && (
            <span className="ml-2 text-orange-600">
              • {lockedModels.length} additional models available with Index Pro
            </span>
          )}
        </div>
      )}
    </div>
  );
}

