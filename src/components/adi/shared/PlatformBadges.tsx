import { Check, Clock } from 'lucide-react';
import Image from 'next/image';

export interface Platform {
  id: string;
  name: string;
  icon: string; // URL or path to logo
  tested: boolean;
  score?: number;
  model?: string; // e.g., "GPT-4", "Claude-3-Opus"
}

interface PlatformBadgesProps {
  platforms: Platform[];
  className?: string;
  showScores?: boolean;
  compact?: boolean;
}

export function PlatformBadges({ 
  platforms, 
  className = '', 
  showScores = false,
  compact = false 
}: PlatformBadgesProps) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">Tested with:</span>
        <div className="flex -space-x-2">
          {platforms.filter(p => p.tested).map((platform) => (
            <div
              key={platform.id}
              className="relative w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:z-10 transition-all"
              title={platform.name}
            >
              <Image
                src={platform.icon}
                alt={platform.name}
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {platforms.map((platform) => (
        <div
          key={platform.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
            platform.tested
              ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              : 'bg-gray-50 border-gray-100 opacity-50'
          }`}
        >
          <div className="relative w-5 h-5">
            <Image
              src={platform.icon}
              alt={platform.name}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="text-sm font-medium">{platform.name}</span>
          {platform.model && (
            <span className="text-xs text-gray-500">({platform.model})</span>
          )}
          {platform.tested ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              {showScores && platform.score !== undefined && (
                <span className="text-xs font-semibold text-gray-700">
                  {platform.score}/100
                </span>
              )}
            </>
          ) : (
            <Clock className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );
}

// Header version - shows which platforms were tested
export function PlatformHeader({ platforms }: { platforms: Platform[] }) {
  const testedCount = platforms.filter(p => p.tested).length;
  const totalCount = platforms.length;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Multi-Platform Evaluation</h3>
          <p className="text-xs text-gray-600">
            Tested across {testedCount} of {totalCount} frontier AI models
          </p>
        </div>
      </div>
      <PlatformBadges platforms={platforms} showScores={false} />
    </div>
  );
}

// Compact inline version for cards
export function PlatformIndicators({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex items-center gap-1">
      {platforms.filter(p => p.tested).map((platform) => (
        <div
          key={platform.id}
          className="relative w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center"
          title={`${platform.name} - ${platform.score || 'N/A'}/100`}
        >
          <Image
            src={platform.icon}
            alt={platform.name}
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}

