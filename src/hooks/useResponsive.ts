import { useEffect, useState } from 'react';
import { ADITokens } from '../design-system/tokens';

type BreakpointKey = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  currentBreakpoint: BreakpointKey;
}

/**
 * Hook to detect current responsive breakpoint
 * Based on ADI design system breakpoints
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWide: false,
    currentBreakpoint: 'mobile'
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      let currentBreakpoint: BreakpointKey = 'mobile';
      if (width >= parseInt(ADITokens.breakpoints.wide)) {
        currentBreakpoint = 'wide';
      } else if (width >= parseInt(ADITokens.breakpoints.desktop)) {
        currentBreakpoint = 'desktop';
      } else if (width >= parseInt(ADITokens.breakpoints.tablet)) {
        currentBreakpoint = 'tablet';
      }

      setState({
        isMobile: currentBreakpoint === 'mobile',
        isTablet: currentBreakpoint === 'tablet',
        isDesktop: currentBreakpoint === 'desktop',
        isWide: currentBreakpoint === 'wide',
        currentBreakpoint
      });
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return state;
};