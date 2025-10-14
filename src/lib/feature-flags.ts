/**
 * Feature Flag System for UX Variation Testing
 * 
 * Enables A/B testing between:
 * - Executive-First Dashboard (score-centric, analytical)
 * - Playbook-First Dashboard (action-centric, quick wins)
 */

export enum UXVariation {
  EXECUTIVE_FIRST = 'executive-first',
  PLAYBOOK_FIRST = 'playbook-first'
}

export interface FeatureFlags {
  uxVariation: UXVariation;
  enableABTesting: boolean;
  showVariationToggle: boolean; // For QA only
}

interface ABTestAssignment {
  userId: string;
  variation: UXVariation;
  assignedAt: Date;
  cohort: number;
}

/**
 * Get feature flags for a user
 * Priority:
 * 1. Environment override (QA testing)
 * 2. User preference (explicit choice)
 * 3. A/B test assignment (for new users)
 * 4. Default (Executive-First)
 */
export function getFeatureFlags(userId?: string): FeatureFlags {
  // Check environment override (for QA testing)
  if (typeof window !== 'undefined') {
    const envOverride = localStorage.getItem('ux_variation_override');
    if (envOverride && Object.values(UXVariation).includes(envOverride as UXVariation)) {
      return {
        uxVariation: envOverride as UXVariation,
        enableABTesting: false,
        showVariationToggle: true
      };
    }
  }

  const serverOverride = process.env.NEXT_PUBLIC_UX_VARIATION;
  if (serverOverride && Object.values(UXVariation).includes(serverOverride as UXVariation)) {
    return {
      uxVariation: serverOverride as UXVariation,
      enableABTesting: false,
      showVariationToggle: true
    };
  }

  // Check user preference (stored in localStorage or DB)
  const userPreference = getUserUXPreference(userId);
  if (userPreference) {
    return {
      uxVariation: userPreference,
      enableABTesting: false,
      showVariationToggle: true
    };
  }

  // Check if user should be in A/B test
  if (userId && shouldAssignABTest(userId)) {
    const assignment = getOrCreateABTestAssignment(userId);
    return {
      uxVariation: assignment.variation,
      enableABTesting: true,
      showVariationToggle: false
    };
  }

  // Default to Executive First
  return {
    uxVariation: UXVariation.EXECUTIVE_FIRST,
    enableABTesting: false,
    showVariationToggle: process.env.NODE_ENV === 'development'
  };
}

/**
 * Get user's UX preference from storage
 */
function getUserUXPreference(userId?: string): UXVariation | null {
  if (typeof window === 'undefined' || !userId) return null;

  try {
    const stored = localStorage.getItem(`ux_preference_${userId}`);
    if (stored && Object.values(UXVariation).includes(stored as UXVariation)) {
      return stored as UXVariation;
    }
  } catch (error) {
    console.error('Error reading UX preference:', error);
  }

  return null;
}

/**
 * Save user's UX preference
 */
export function setUserUXPreference(userId: string, variation: UXVariation): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`ux_preference_${userId}`, variation);
    
    // Track preference change
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('ux_variation_preference_set', {
        userId,
        variation,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving UX preference:', error);
  }
}

/**
 * Check if user should be assigned to A/B test
 * Currently: Only new users (no preference set)
 */
function shouldAssignABTest(userId: string): boolean {
  // Check if A/B testing is globally enabled
  const abTestEnabled = process.env.NEXT_PUBLIC_ENABLE_AB_TEST === 'true';
  if (!abTestEnabled) return false;

  // Check if user has existing assignment
  const existingAssignment = getABTestAssignment(userId);
  if (existingAssignment) return true;

  // For new users, check if they qualify (e.g., created after A/B test start date)
  const abTestStartDate = process.env.NEXT_PUBLIC_AB_TEST_START_DATE;
  if (abTestStartDate) {
    const startDate = new Date(abTestStartDate);
    const now = new Date();
    return now >= startDate;
  }

  return false;
}

/**
 * Get or create A/B test assignment for user
 */
function getOrCreateABTestAssignment(userId: string): ABTestAssignment {
  const existing = getABTestAssignment(userId);
  if (existing) return existing;

  // Create new assignment with 50/50 split
  const variation = assignVariation(userId);
  const assignment: ABTestAssignment = {
    userId,
    variation,
    assignedAt: new Date(),
    cohort: getCohortNumber()
  };

  saveABTestAssignment(assignment);
  
  // Track assignment
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('ux_variation_assigned', {
      userId,
      variation,
      cohort: assignment.cohort,
      timestamp: assignment.assignedAt.toISOString()
    });
  }

  return assignment;
}

/**
 * Get existing A/B test assignment from storage
 */
function getABTestAssignment(userId: string): ABTestAssignment | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(`ab_test_assignment_${userId}`);
    if (stored) {
      const assignment = JSON.parse(stored);
      assignment.assignedAt = new Date(assignment.assignedAt);
      return assignment;
    }
  } catch (error) {
    console.error('Error reading A/B test assignment:', error);
  }

  return null;
}

/**
 * Save A/B test assignment to storage
 */
function saveABTestAssignment(assignment: ABTestAssignment): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`ab_test_assignment_${assignment.userId}`, JSON.stringify(assignment));
  } catch (error) {
    console.error('Error saving A/B test assignment:', error);
  }
}

/**
 * Assign variation using deterministic hash
 * Ensures same user always gets same variation
 */
function assignVariation(userId: string): UXVariation {
  // Simple hash function for consistent assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // 50/50 split
  return Math.abs(hash) % 2 === 0 ? UXVariation.EXECUTIVE_FIRST : UXVariation.PLAYBOOK_FIRST;
}

/**
 * Get current cohort number (week-based)
 * Useful for analyzing results by time period
 */
function getCohortNumber(): number {
  const startDate = new Date(process.env.NEXT_PUBLIC_AB_TEST_START_DATE || new Date());
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

/**
 * Track UX variation view
 */
export function trackVariationView(variation: UXVariation, userId?: string): void {
  if (typeof window === 'undefined' || !(window as any).analytics) return;

  (window as any).analytics.track('ux_variation_viewed', {
    variation,
    userId,
    timestamp: new Date().toISOString(),
    url: window.location.pathname
  });
}

/**
 * Track variation switch
 */
export function trackVariationSwitch(
  fromVariation: UXVariation,
  toVariation: UXVariation,
  method: 'toggle' | 'preference' | 'system',
  userId?: string
): void {
  if (typeof window === 'undefined' || !(window as any).analytics) return;

  (window as any).analytics.track('ux_variation_switched', {
    fromVariation,
    toVariation,
    method,
    userId,
    timestamp: new Date().toISOString()
  });
}

// React hook moved to separate client-side file: hooks/useFeatureFlags.ts
