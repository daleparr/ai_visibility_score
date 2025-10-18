/**
 * AIDI Design System Tokens - LUXURY INTELLIGENCE Edition
 * Hermès meets Apple — C-Suite fashion & cultural edge
 * 
 * Updated with warm, sophisticated palette
 */

export const ADITokens = {
  colors: {
    // Warm Neutrals - Sophisticated foundation
    warm: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09'
    },
    
    // Champagne Gold - Premium accent (replaces blue)
    champagne: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#d4a574',   // Primary luxury signal
      600: '#b8956a',
      700: '#9c7f5a',
      800: '#7d6548',
      900: '#654e38'
    },
    
    // Sage Green - Success, refined growth
    sage: {
      50: '#f6f7f6',
      100: '#e8ebe8',
      200: '#d1d8d1',
      300: '#a8b8a8',
      400: '#7d947d',
      500: '#5a7359',   // Primary success
      600: '#4a5f49',
      700: '#3d4e3c',
      800: '#323f32',
      900: '#28332a'
    },
    
    // Terracotta - Warm attention
    terracotta: {
      50: '#fef5f1',
      100: '#fde8dd',
      200: '#fbd0bb',
      300: '#f7ad8e',
      400: '#f28562',
      500: '#c97a5a',   // Primary attention
      600: '#a86449',
      700: '#8a523c',
      800: '#6e4230',
      900: '#583629'
    },
    
    // Burgundy - Critical, refined urgency
    burgundy: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#8b4049',   // Primary critical
      600: '#73353d',
      700: '#5e2b32',
      800: '#4c232a',
      900: '#3e1d23'
    },
    
    // Score Colors (luxury palette)
    score: {
      excellent: '#5a7359',  // Sage green (81-100 points)
      good: '#d4a574',       // Champagne gold (61-80 points)
      warning: '#c97a5a',    // Terracotta (41-60 points)
      poor: '#8b4049'        // Burgundy (0-40 points)
    },
    
    // Pillar Colors (updated for luxury)
    infrastructure: '#d4a574', // Champagne
    perception: '#5a7359',     // Sage
    commerce: '#c97a5a',       // Terracotta
    
    // Alert Colors (refined)
    alert: {
      critical: '#8b4049',   // Burgundy
      warning: '#c97a5a',    // Terracotta
      info: '#d4a574',       // Champagne
      success: '#5a7359'     // Sage
    },
    
    // Legacy gray support (mapped to warm)
    gray: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917'
    }
  },
  
  typography: {
    // Typography scale - more refined, smaller sizes
    display: {
      fontSize: '4.5rem',      // 72px - statement data
      lineHeight: '1',
      fontWeight: 300,         // Light for large numbers
      letterSpacing: '-0.03em',
      fontFamily: 'Georgia, serif'
    },
    h1: {
      fontSize: '3.5rem',      // 56px - primary score
      lineHeight: '1.1',
      fontWeight: 300,         // Light for headlines
      letterSpacing: '-0.02em',
      fontFamily: 'Georgia, serif'
    },
    h2: {
      fontSize: '2rem',        // 32px - page titles
      lineHeight: '1.2',
      fontWeight: 400,
      letterSpacing: '-0.01em',
      fontFamily: 'Georgia, serif'
    },
    h3: {
      fontSize: '1.5rem',      // 24px - section headers
      lineHeight: '1.3',
      fontWeight: 400,
      letterSpacing: '0',
      fontFamily: 'Georgia, serif'
    },
    body: {
      fontSize: '0.9375rem',   // 15px - body
      lineHeight: '1.6',
      fontWeight: 400,
      letterSpacing: '0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    small: {
      fontSize: '0.8125rem',   // 13px - metadata
      lineHeight: '1.5',
      fontWeight: 400,
      letterSpacing: '0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    tiny: {
      fontSize: '0.6875rem',   // 11px - whisper labels
      lineHeight: '1.4',
      fontWeight: 500,
      letterSpacing: '0.025em',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    mono: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: 400,
      letterSpacing: '0',
      fontFamily: '"Courier New", monospace'
    }
  },
  
  spacing: {
    // More generous spacing (12px base unit)
    xs: '0.375rem',    // 6px
    sm: '0.75rem',     // 12px - base unit
    md: '1rem',        // 16px
    lg: '1.5rem',      // 24px
    xl: '2rem',        // 32px
    '2xl': '2.5rem',   // 40px
    '3xl': '3rem',     // 48px
    '4xl': '4rem',     // 64px
    '5xl': '5rem',     // 80px
    '6xl': '6rem'      // 96px
  },
  
  borderRadius: {
    sm: '0.5rem',      // 8px
    md: '0.75rem',     // 12px - more rounded
    lg: '1rem',        // 16px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    full: '9999px'
  },
  
  shadows: {
    // Softer, more diffused shadows
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 12px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
    xl: '0 24px 48px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.08)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)'
  },
  
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px'
  }
};

// Utility functions for design tokens
export const getScoreColor = (score: number): string => {
  if (score >= 81) return ADITokens.colors.score.excellent;
  if (score >= 61) return ADITokens.colors.score.good;
  if (score >= 41) return ADITokens.colors.score.warning;
  return ADITokens.colors.score.poor;
};

export const getScoreGrade = (score: number): string => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
};

export const getPillarColor = (pillar: 'infrastructure' | 'perception' | 'commerce'): string => {
  return ADITokens.colors[pillar];
};

export const getVerdictMessage = (score: number): string => {
  if (score >= 90) return 'AI discoverability leader in your industry';
  if (score >= 80) return 'Strong AI presence with room for optimization';
  if (score >= 70) return 'Visible but not competitive in AI recommendations';
  if (score >= 60) return 'Limited AI visibility - significant improvements needed';
  return 'Invisible to AI - urgent action required';
};

export default ADITokens;
