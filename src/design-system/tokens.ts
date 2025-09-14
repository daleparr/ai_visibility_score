/**
 * ADI Design System Tokens
 * Complete design system for AI Discoverability Index
 */

export const ADITokens = {
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#2563EB', // Main ADI Blue
      600: '#1D4ED8',
      700: '#1E40AF',
      800: '#1E3A8A',
      900: '#1E3A8A'
    },
    
    // Secondary Colors
    purple: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#7C3AED', // ADI Purple
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95'
    },
    
    green: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#059669', // ADI Green
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B'
    },
    
    // Score Colors
    score: {
      excellent: '#10B981', // 81-100 points
      good: '#F59E0B',       // 61-80 points
      warning: '#F97316',    // 41-60 points
      poor: '#EF4444'        // 0-40 points
    },
    
    // Pillar Colors
    infrastructure: '#2563EB', // Blue
    perception: '#7C3AED',     // Purple
    commerce: '#059669',       // Green
    
    // Alert Colors
    alert: {
      critical: '#DC2626',
      warning: '#D97706',
      info: '#2563EB',
      success: '#059669'
    },
    
    // Neutral Colors
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  typography: {
    display: {
      fontSize: '48px',
      lineHeight: '52px',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h1: {
      fontSize: '36px',
      lineHeight: '40px',
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontSize: '24px',
      lineHeight: '28px',
      fontWeight: 600,
      letterSpacing: '0'
    },
    h3: {
      fontSize: '20px',
      lineHeight: '24px',
      fontWeight: 600,
      letterSpacing: '0'
    },
    body: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0'
    },
    small: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0'
    },
    tiny: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.025em'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
    '5xl': '96px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
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