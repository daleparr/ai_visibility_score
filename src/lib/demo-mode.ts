// Demo mode detection and mock data for testing without authentication
export const isDemoMode = () => {
  // Check explicit demo mode flag first
  const demoMode = process.env.DEMO_MODE
  if (demoMode === 'true') return true
  if (demoMode === 'false') return false
  
  // Fallback to legacy detection methods
  const databaseUrl = process.env.DATABASE_URL || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return databaseUrl.includes('demo') ||
         supabaseUrl.includes('demo.supabase.co') ||
         supabaseAnonKey.includes('demo') ||
         !process.env.NEXTAUTH_SECRET // No auth configured = demo mode
}

// Check if authentication is enabled
export const isAuthEnabled = () => {
  return !isDemoMode() &&
         process.env.NEXTAUTH_SECRET &&
         process.env.NEXTAUTH_URL
}

// Mock user for demo mode
export const mockUser = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  name: 'Demo User',
  image: null,
  emailVerified: null,
  createdAt: new Date(),
  updatedAt: new Date()
}

// Mock brands for demo mode (updated to match new schema)
export const mockBrands = [
  {
    id: 'demo-brand-1',
    userId: 'demo-user-id',
    name: 'TechCorp Demo',
    websiteUrl: 'https://techcorp-demo.com',
    industry: 'Technology',
    description: 'A demo technology company for testing AI Discoverability Terminal',
    competitors: ['https://competitor1.com', 'https://competitor2.com'],
    adiIndustryId: null,
    adiEnabled: false,
    annualRevenueRange: null,
    employeeCountRange: null,
    primaryMarketRegions: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'demo-brand-2',
    userId: 'demo-user-id',
    name: 'StyleBrand Demo',
    websiteUrl: 'https://stylebrand-demo.com',
    industry: 'Fashion',
    description: 'A demo fashion brand for testing the platform',
    competitors: ['https://fashioncomp1.com'],
    adiIndustryId: null,
    adiEnabled: false,
    annualRevenueRange: null,
    employeeCountRange: null,
    primaryMarketRegions: null,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000)
  }
]

// Mock evaluations for demo mode (updated to match new schema)
export const mockEvaluations = [
  {
    id: 'demo-eval-1',
    brandId: 'demo-brand-1',
    status: 'completed' as const,
    overallScore: 85,
    grade: 'B' as const,
    verdict: 'TechCorp Demo has good AI visibility with minor optimization opportunities',
    strongestDimension: 'Schema & Structured Data',
    weakestDimension: 'Citation Strength',
    biggestOpportunity: 'Geographic Visibility',
    adiScore: 87,
    adiGrade: 'B' as const,
    confidenceInterval: 24,
    reliabilityScore: 92,
    industryPercentile: 67,
    globalRank: 247,
    methodologyVersion: 'ADI-v1.0',
    startedAt: new Date(Date.now() - 3600000),
    completedAt: new Date(Date.now() - 1800000),
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 1800000)
  },
  {
    id: 'demo-eval-2',
    brandId: 'demo-brand-2',
    status: 'running' as const,
    overallScore: null,
    grade: null,
    verdict: null,
    strongestDimension: null,
    weakestDimension: null,
    biggestOpportunity: null,
    adiScore: null,
    adiGrade: null,
    confidenceInterval: null,
    reliabilityScore: null,
    industryPercentile: null,
    globalRank: null,
    methodologyVersion: 'ADI-v1.0',
    startedAt: new Date(Date.now() - 600000),
    completedAt: null,
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(Date.now() - 300000)
  }
]

// Mock dimension scores (updated to match new schema)
export const mockDimensionScores = [
  {
    id: 'demo-dim-1',
    evaluationId: 'demo-eval-1',
    dimensionName: 'schema_structured_data',
    score: 92,
    explanation: 'Excellent schema implementation with comprehensive markup',
    recommendations: ['Add FAQ schema', 'Implement review schema'],
    createdAt: new Date()
  },
  {
    id: 'demo-dim-2',
    evaluationId: 'demo-eval-1',
    dimensionName: 'semantic_clarity',
    score: 78,
    explanation: 'Good semantic structure with room for improvement',
    recommendations: ['Standardize terminology', 'Improve content hierarchy'],
    createdAt: new Date()
  }
]

// Mock recommendations (updated to match new schema)
export const mockRecommendations = [
  {
    id: 'demo-rec-1',
    evaluationId: 'demo-eval-1',
    priority: '1' as const,
    title: 'Implement FAQ Schema',
    description: 'Add structured data markup for frequently asked questions to improve AI understanding',
    impactLevel: 'high' as const,
    effortLevel: 'medium' as const,
    category: 'technical',
    createdAt: new Date()
  },
  {
    id: 'demo-rec-2',
    evaluationId: 'demo-eval-1',
    priority: '2' as const,
    title: 'Enhance Geographic Visibility',
    description: 'Optimize content for location-based queries and local search',
    impactLevel: 'medium' as const,
    effortLevel: 'high' as const,
    category: 'content',
    createdAt: new Date()
  }
]