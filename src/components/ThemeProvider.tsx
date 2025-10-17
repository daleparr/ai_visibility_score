'use client';

import { useEffect, useState } from 'react';
import { ThemeColors, ThemeFonts } from '@/lib/cms/cms-client';

/**
 * ThemeProvider - Applies CMS theme settings to the site
 * Load theme from CMS and apply CSS variables
 */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAndApplyTheme();
  }, []);

  const loadAndApplyTheme = async () => {
    try {
      const response = await fetch('/api/cms/theme');
      const { colors, fonts } = await response.json();

      if (colors && fonts) {
        applyTheme(colors, fonts);
      }

      setLoaded(true);
    } catch (error) {
      console.error('Failed to load theme:', error);
      setLoaded(true); // Continue with defaults
    }
  };

  const applyTheme = (colors: ThemeColors, fonts: ThemeFonts) => {
    const root = document.documentElement;

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value);
    });

    // Apply fonts
    root.style.setProperty('--font-heading', `${fonts.heading}, sans-serif`);
    root.style.setProperty('--font-body', `${fonts.body}, sans-serif`);
    root.style.setProperty('--font-mono', `${fonts.mono}, monospace`);
  };

  // Prevent flash of unstyled content
  if (!loaded) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
}

/**
 * Hook to access theme programmatically
 */
export function useTheme() {
  const [theme, setTheme] = useState<{
    colors: ThemeColors | null;
    fonts: ThemeFonts | null;
  }>({
    colors: null,
    fonts: null
  });

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await fetch('/api/cms/theme');
      const data = await response.json();
      setTheme(data);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  return theme;
}


