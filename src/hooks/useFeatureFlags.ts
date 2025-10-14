'use client';

/**
 * Client-side React hook for feature flags
 * Separated from utility functions to maintain Server Component compatibility
 */

import { useState, useEffect } from 'react';
import { getFeatureFlags, type FeatureFlags } from '@/lib/feature-flags';

export function useFeatureFlags(userId?: string): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(() => getFeatureFlags(userId));

  useEffect(() => {
    // Listen for localStorage changes (e.g., from QA toggle)
    const handleStorageChange = () => {
      setFlags(getFeatureFlags(userId));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('ux-variation-changed', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('ux-variation-changed', handleStorageChange);
      }
    };
  }, [userId]);

  return flags;
}

