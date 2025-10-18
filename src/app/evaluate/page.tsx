'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Brain, Search, BarChart3, Zap, Shield, TrendingUp, Download, Lock, Star, Trophy, Globe, Crown, FileText, AlertTriangle, Target } from 'lucide-react'
import Link from 'next/link'
import { ExecutiveSummary } from '@/components/adi/reporting/ExecutiveSummary'
import { UserFriendlyDimensionCard } from '@/components/adi/reporting/UserFriendlyDimensionCard'
import { PriorityActionCard } from '@/components/adi/reporting/PriorityActionCard'
import { AIInteractionExample } from '@/components/adi/reporting/AIInteractionExample'
import { LeaderboardTable } from '@/components/adi/leaderboards/LeaderboardTable'
import { ProbeResultsPanel } from '@/components/adi/reporting/ProbeResultsPanel'
import { CompetitiveBenchmark } from '@/components/industry-reports/CompetitiveBenchmark'
import { AIModelLogos } from '@/components/AIModelLogos'
import { AuditGradeReportWrapper } from '@/components/AuditGradeReportWrapper'
import {
  getImprovementPriority,
  getAIInteractionExample,
  getImplementationSteps,
  getBusinessImpactForRecommendation
} from '@/lib/report-utils'
import { LeaderboardData } from '@/types/leaderboards'
// Removed server-side imports that cause webpack bundling issues
// import { BrandCategorizationService } from '@/lib/brand-categorization-service'
// import { AIDIPerformanceAnalyzer, AIDIPerformanceProfile } from '@/lib/adi/performance-framework'
import type { AIDIPerformanceProfile } from '@/lib/adi/performance-framework'
import { AIDIPerformanceDashboard } from '@/components/adi/performance/AIDIPerformanceDashboard'
import { createCheckoutSession } from '@/lib/stripe-client'
import { EnhancedProgressDisplay } from '@/components/evaluation/EnhancedProgressDisplay'

interface DimensionScore {
  name: string
  score: number
  description: string
  pillar: 'infrastructure' | 'perception' | 'commerce'
}

interface ModelAnalysis {
  model: string
  provider: string
  score: number
  confidence: number
  strengths: string[]
  weaknesses: string[]
  keyInsight: string
  recommendation: string
}

interface PillarScore {
  name: string
  score: number
  color: string
  icon: React.ReactNode
  description: string
}

interface ProfessionalInsights {
  aiReadiness: string
  riskFactors: string[]
  opportunities: string[]
  nextSteps: string[]
  categorySpecific: {
    category: string
    competitivePosition: string
    marketOpportunity: string
  }
}

interface EvaluationData {
  id?: string // Add evaluation ID for progress tracking
  url: string
  tier: string
  isDemo: boolean
  overallScore: number
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
  dimensionScores: DimensionScore[]
  aiProviders: string[]
  defaultModel: string
  recommendations: Array<{
    priority: string
    title: string
    score: number
    description: string
  }>
  analysisMethod?: string
  upgradeMessage?: string
  professionalInsights?: ProfessionalInsights
  executiveSummary?: {
    verdict?: string
    strongest?: string
    weakest?: string
    opportunity?: string
    keyInsight?: string
    businessImpacts?: {
      customerDiscovery?: string
      brandPerception?: string
      salesConversion?: string
      competitivePosition?: string
    }
    actionableInsights?: Array<{
      title: string
      score: number
      currentState: string
      businessImpact: string
      opportunity: string
      actionRequired: string
      timeframe: string
      difficulty: string
      potentialGain: string
    }>
  }
  // Professional tier features
  modelAnalysis?: ModelAnalysis[]
  channelInsights?: Array<{
    channel: string
    score: number
    performance: string
    opportunities: string[]
    businessImpact: string
    recommendation: string
    improvementPotential: number
  }>
  industryBenchmarks?: {
    industry: string
    totalCompanies: number
    yourRank: number
    percentile: number
    industryMedian: number
    topPerformer: number
    competitorAnalysis: Array<{
      name: string
      score: number
      gap: number
    }>
  }
  certification?: {
    level: string
    badge: string
    validUntil: string
    achievements: string[]
  }
  insights?: {
    aiReadiness: string
    riskFactors: string[]
    opportunities: string[]
    nextSteps: string[]
  }
  brandCategory?: {
    sector: string
    industry: string
    niche: string
    emoji: string
  }
  brandName?: string
  agentResults?: Array<{
    agentName: string
    results: any[]
    metadata: {
      testsRun?: number
      brandName?: string
      apiProvider?: string
      placeholder?: boolean
      timestamp?: string
      executionTime?: number
    }
  }>
}

export default function EvaluatePage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || 'example.com'
  const tierParam = searchParams.get('tier')
  
  // Map tier variations to standard tier names
  const getTierFromParam = (param: string | null): 'free' | 'index-pro' | 'enterprise' => {
    if (!param) return 'free';
    
    // Map all tier variations
    if (param === 'index-pro' || param === 'index-pro-monthly') return 'index-pro';
    if (param === 'full-audit' || param === 'protected-site') return 'index-pro'; // Paid one-time = Index Pro features
    if (param === 'enterprise' || param === 'enterprise-package' || param === 'enterprise-monthly') return 'enterprise';
    
    // Default to free for quick-scan or any other
    return 'free';
  };
  
  const tier = getTierFromParam(tierParam);
  const [isLoading, setIsLoading] = useState(true)
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentEvaluationId, setCurrentEvaluationId] = useState<string | null>(null) // Store evaluation ID for progress tracking
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [sectorData, setSectorData] = useState<{
    sectorId?: string;
    sectorName?: string;
    sectorSlug?: string;
    competitors?: string[];
    userRank?: number;
    totalBrands?: number;
    userMentionShare?: number;
    sectorAverage?: number;
    competitorRanks?: Array<{ name: string; rank: number; mentionShare: number; sentiment: number }>;
  } | null>(null)
  const [brandCategory, setBrandCategory] = useState<any>(null)
  const [performanceProfile, setPerformanceProfile] = useState<AIDIPerformanceProfile | null>(null)

  // Fetch sector and competitor data after evaluation completes
  useEffect(() => {
    if (currentEvaluationId && evaluationData) {
      fetch(`/api/evaluations/set-sector?evaluationId=${currentEvaluationId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.sectorId) {
            // Mock competitive data for now (will be replaced with real data from industry reports)
            setSectorData({
              sectorId: data.sectorId,
              sectorName: data.sectorName,
              sectorSlug: data.sectorSlug,
              competitors: data.competitors || [],
              userRank: 23, // Placeholder - would come from brand_performance query
              totalBrands: 78, // Placeholder
              userMentionShare: 2.4, // Placeholder
              sectorAverage: 3.1, // Placeholder
              competitorRanks: data.competitors?.map((comp: string, idx: number) => ({
                name: comp,
                rank: idx + 1, // Placeholder
                mentionShare: 15 - (idx * 2), // Placeholder
                sentiment: 0.85 - (idx * 0.05), // Placeholder
              })) || [],
            });
          }
        })
        .catch(err => console.error('Failed to fetch sector data:', err));
    }
  }, [currentEvaluationId, evaluationData]);

  // Debug: Log whenever evaluationData changes
  useEffect(() => {
    if (evaluationData) {
      console.log('🔄 evaluationData state updated:', {
        hasDimensionScores: !!evaluationData.dimensionScores,
        dimensionScoresLength: evaluationData.dimensionScores?.length || 0,
        dimensionScores: evaluationData.dimensionScores?.map((d: any) => ({
          name: d.name,
          score: d.score
        }))
      });
    }
  }, [evaluationData]);

  const generateActionPlan = async () => {
    console.log('🔍 generateActionPlan called');
    console.log('🔍 evaluationData:', evaluationData);
    console.log('🔍 professionalInsights:', evaluationData?.professionalInsights);
    
    if (!evaluationData?.professionalInsights) {
      console.error('❌ Professional insights not available');
      alert('Professional insights not available. Please refresh the page.');
      return;
    }

    if (!evaluationData.professionalInsights.nextSteps || evaluationData.professionalInsights.nextSteps.length === 0) {
      console.error('❌ No next steps available');
      alert('No action steps available. Please refresh the page.');
      return;
    }

    try {
      console.log('✅ Starting Action Plan PDF generation...');
      console.log('✅ Next steps available:', evaluationData.professionalInsights.nextSteps.length);
      
      // Import jsPDF
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Extract brand name
      const brandName = evaluationData.url?.replace(/^https?:\/\/(www\.)?/, '').split('.')[0] || 'Your Brand';
      const formattedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
      
      // Set up colors matching executive snapshot
      const primaryColor: [number, number, number] = [41, 128, 185]; // Blue
      const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray
      const accentColor: [number, number, number] = [231, 76, 60]; // Red
      const successColor: [number, number, number] = [39, 174, 96]; // Green
      const warningColor: [number, number, number] = [243, 156, 18]; // Orange
      
      let yPos = 25;
      
      // HEADER SECTION
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACTION PLAN', 20, 25);
      
      yPos = 55;
      
      // BRAND INFO SECTION
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Brand: ${formattedBrandName}`, 20, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`Current AI Visibility Score: ${evaluationData.overallScore}/100`, 20, yPos);
      
      yPos += 6;
      pdf.text(`AI Readiness Level: ${evaluationData.professionalInsights.aiReadiness}`, 20, yPos);
      
      yPos += 6;
      pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPos);
      
      yPos += 15;
      
      // EXECUTIVE SUMMARY
      pdf.setFillColor(245, 245, 245);
      pdf.rect(15, yPos - 5, 180, 20, 'F');
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 20, yPos + 5);
      
      yPos += 15;
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryText = `${formattedBrandName} currently scores ${evaluationData.overallScore}/100 for AI visibility. This action plan provides specific, prioritized steps to improve your brand's discoverability across AI systems including ChatGPT, Claude, Perplexity, and Google's AI features.`;
      const summaryLines = pdf.splitTextToSize(summaryText, 170);
      pdf.text(summaryLines, 20, yPos);
      yPos += summaryLines.length * 5 + 15;
      
      // PRIORITY ACTIONS SECTION
      if (yPos > 200) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📋 PRIORITY ACTIONS', 20, yPos);
      yPos += 12;
      
      evaluationData.professionalInsights.nextSteps.forEach((step, index) => {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 30;
        }
        
        // Priority level based on index
        const priority = index === 0 ? 'IMMEDIATE (Today)' : 
                       index === 1 ? 'SHORT TERM (1 Week)' : 
                       index === 2 ? 'MEDIUM TERM (2-4 Weeks)' : 
                       'ONGOING';
        const impact = index === 0 ? '+8-12 pts' : 
                     index === 1 ? '+5-8 pts' : 
                     index === 2 ? '+3-5 pts' : 
                     '+2-4 pts';
        
        pdf.setTextColor(...warningColor);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${priority}`, 20, yPos);
        
        pdf.setTextColor(...successColor);
        pdf.text(`Impact: ${impact}`, 150, yPos);
        
        yPos += 6;
        pdf.setTextColor(...secondaryColor);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const stepLines = pdf.splitTextToSize(step, 170);
        pdf.text(stepLines, 20, yPos);
        yPos += stepLines.length * 4 + 10;
      });
      
      // BOTTOM LINE SECTION
      if (yPos > 220) {
        pdf.addPage();
        yPos = 30;
      }
      
      yPos += 10;
      pdf.setFillColor(...primaryColor);
      pdf.rect(15, yPos - 5, 180, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BOTTOM LINE', 20, yPos);
      yPos += 15;
      
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const bottomLineText = `Current State: ${evaluationData.professionalInsights.categorySpecific.competitivePosition} performance in ${evaluationData.professionalInsights.categorySpecific.category}

Market Opportunity: ${evaluationData.professionalInsights.categorySpecific.marketOpportunity}

Expected Outcome: Following this action plan should improve your AI visibility score by 15-25 points within 3 months.

Next Step Today: Start with Priority Action #1 - the highest impact, lowest effort improvements that can be implemented immediately.`;
      
      const bottomLines = pdf.splitTextToSize(bottomLineText, 170);
      pdf.text(bottomLines, 20, yPos);
      
      // FOOTER
      yPos = 280;
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text(`Generated by AI Discoverability Index Platform | ${new Date().toLocaleString()}`, 20, yPos);
      
      // Generate filename and download
      const filename = `Action_Plan_${formattedBrandName}_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('✅ Saving PDF with filename:', filename);
      pdf.save(filename);
      
      console.log('✅ Action Plan PDF generated and downloaded successfully');
      alert('Action Plan downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating action plan:', error);
      alert(`Failed to generate action plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const generateTechnicalReport = async () => {
    if (!evaluationData) {
      console.error('No evaluation data available for report generation')
      alert('No evaluation data available. Please run an evaluation first.')
      return
    }

    try {
      console.log('Starting executive snapshot generation...', evaluationData)

      // Extract brand name properly
      const brandName = evaluationData.url?.replace(/^https?:\/\/(www\.)?/, '').split('.')[0] || 'Your Brand'
      const formattedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1)
      const grade = evaluationData.overallScore >= 80 ? 'A' : evaluationData.overallScore >= 70 ? 'B+' : evaluationData.overallScore >= 60 ? 'B' : evaluationData.overallScore >= 50 ? 'C+' : evaluationData.overallScore >= 40 ? 'C' : evaluationData.overallScore >= 30 ? 'D' : 'F'
      
      // Import jsPDF
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF()
      
      // Set up colors and styling
      const primaryColor: [number, number, number] = [41, 128, 185] // Blue
      const secondaryColor: [number, number, number] = [52, 73, 94] // Dark gray
      const accentColor: [number, number, number] = [231, 76, 60] // Red
      const successColor: [number, number, number] = [39, 174, 96] // Green
      
      let yPos = 25
      
      // HEADER SECTION
      pdf.setFillColor(...primaryColor)
      pdf.rect(0, 0, 210, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EXECUTIVE SNAPSHOT', 20, 25)
      
      yPos = 55
      
      // BRAND INFO SECTION
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Brand: ${formattedBrandName}`, 20, yPos)
      
      yPos += 8
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Category: ${evaluationData.brandCategory || 'Multi-Category Business'}`, 20, yPos)
      
      yPos += 6
      pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPos)
      
      yPos += 15
      
      // SCORE SECTION
      pdf.setFillColor(245, 245, 245)
      pdf.rect(15, yPos - 5, 180, 25, 'F')
      
      pdf.setTextColor(...accentColor)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Overall AI Visibility Score: ${evaluationData.overallScore || 0}/100 - Grade: ${grade}`, 20, yPos + 5)
      
      yPos += 15
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      // Generate insightful verdict based on scores
      const generateVerdict = () => {
        const score = evaluationData.overallScore || 0
        const perceptionScore = evaluationData.pillarScores?.perception || 0
        const commerceScore = evaluationData.pillarScores?.commerce || 0
        const infraScore = evaluationData.pillarScores?.infrastructure || 0
        
        if (score >= 75) {
          return 'Analysis completed successfully. Your brand demonstrates strong AI visibility across key dimensions.'
        } else if (score >= 60) {
          return 'Good foundation established. Strategic improvements in targeted areas will elevate your AI visibility significantly.'
        } else if (score >= 40) {
          const weakestPillar = perceptionScore < commerceScore && perceptionScore < infraScore ? 'brand perception' :
                               commerceScore < infraScore ? 'commerce experience' : 'technical infrastructure'
          return `Moderate AI visibility. Primary opportunity: strengthen ${weakestPillar} to improve how AI systems discover and recommend your brand.`
        } else {
          return 'Low AI visibility detected. Immediate action required to ensure your brand appears in AI-driven product discovery and recommendations.'
        }
      }
      
      const verdict = generateVerdict()
      const verdictLines = pdf.splitTextToSize(`Verdict: ${verdict}`, 170)
      pdf.text(verdictLines, 20, yPos + 5)
      yPos += verdictLines.length * 5 + 10
      
      // PILLAR SCORES SECTION
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('How AI Sees Your Brand (3 Key Areas)', 20, yPos)
      yPos += 12
      
      const pillars = [
        { name: 'Technical Foundation', score: evaluationData.pillarScores?.infrastructure || 0, desc: 'How easily AI can read your website' },
        { name: 'Brand Perception', score: evaluationData.pillarScores?.perception || 0, desc: 'How well AI understands your brand' },
        { name: 'Shopping Experience', score: evaluationData.pillarScores?.commerce || 0, desc: 'How AI helps customers buy from you' }
      ]
      
      pillars.forEach((pillar, index) => {
        // Pillar name and score
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${pillar.name}`, 20, yPos)
        
        // Score with color coding
        const scoreColor: [number, number, number] = pillar.score >= 70 ? successColor : pillar.score >= 40 ? [243, 156, 18] : accentColor
        pdf.setTextColor(...scoreColor)
        pdf.text(`${pillar.score}/100`, 150, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(pillar.desc, 20, yPos)
        yPos += 12
      })
      
      // DIMENSION SCORES SECTION
      yPos += 5
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DIMENSION SCORES (Quick View)', 20, yPos)
      yPos += 8
      
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text('(★ = 20 points, ☆ = remainder)', 20, yPos)
      yPos += 12
      
      // Get top dimensions from evaluation data
      const dimensions = evaluationData.dimensionScores || []
      const topDimensions = dimensions.slice(0, 8)
      
      topDimensions.forEach((dim, index) => {
        if (yPos > 250) {
          pdf.addPage()
          yPos = 30
        }
        
        const score = dim.score || 0
        
        // Convert score to visual rating (5-star system using text)
        const rating = score >= 90 ? '5/5 Excellent' :
                      score >= 80 ? '4.5/5 Very Good' :
                      score >= 70 ? '4/5 Good' :
                      score >= 60 ? '3.5/5 Fair' :
                      score >= 50 ? '3/5 Moderate' :
                      score >= 40 ? '2.5/5 Needs Work' :
                      score >= 30 ? '2/5 Poor' :
                      '1/5 Critical'
        
        // Get friendly dimension name
        const dimensionNameMap: Record<string, string> = {
          'citation_authority_freshness': 'Brand Authority & Citations',
          'ai_answer_quality_presence': 'AI Answer Quality & Presence',
          'geo_visibility_presence': 'Geographic Visibility',
          'reputation_signals': 'Brand Sentiment & Trust',
          'hero_products_use_case': 'Hero Products & Use Cases',
          'policies_logistics_clarity': 'Policies & Logistics Clarity',
          'schema_structured_data': 'Schema & Structured Data',
          'semantic_clarity_ontology': 'Semantic Clarity',
          'knowledge_graphs_entity_linking': 'Knowledge Graphs',
          'llm_readability_conversational': 'LLM Readability'
        }
        
        const friendlyName = dimensionNameMap[dim.name] || dim.name.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        
        // Dimension number and name
        pdf.setTextColor(...primaryColor)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${friendlyName}`, 20, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Score: ${score}/100 | Rating: ${rating}`, 20, yPos)
        
        yPos += 5
        const description = dim.description || `${friendlyName} analysis completed`
        const descLines = pdf.splitTextToSize(description, 170)
        pdf.text(descLines, 20, yPos)
        yPos += descLines.length * 4 + 8
      })
      
      // QUICK ACTIONS SECTION
      if (yPos > 200) {
        pdf.addPage()
        yPos = 30
      }
      
      yPos += 10
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('QUICK ACTIONS', 20, yPos)
      yPos += 12
      
      // Generate dynamic actions based on actual scores
      const generateActions = () => {
        const lowestDimensions = [...dimensions]
          .filter(d => (d.score || 0) < 80)
          .sort((a, b) => (a.score || 0) - (b.score || 0))
          .slice(0, 3)
        
        const actionMap: Record<string, { fix: string, impact: number, timeline: string }> = {
          'citation_authority_freshness': {
            fix: 'Secure citations in industry publications and authoritative websites',
            impact: Math.min(15, 90 - (dimensions.find(d => d.name === 'citation_authority_freshness')?.score || 0)),
            timeline: '90 days'
          },
          'ai_answer_quality_presence': {
            fix: 'Optimize content for AI comprehension with clear product descriptions and FAQs',
            impact: Math.min(20, 90 - (dimensions.find(d => d.name === 'ai_answer_quality_presence')?.score || 0)),
            timeline: '30 days'
          },
          'geo_visibility_presence': {
            fix: 'Add location-specific landing pages and local schema markup',
            impact: Math.min(10, 90 - (dimensions.find(d => d.name === 'geo_visibility_presence')?.score || 0)),
            timeline: '60 days'
          },
          'reputation_signals': {
            fix: 'Refresh customer reviews and testimonials; highlight trust signals',
            impact: Math.min(12, 90 - (dimensions.find(d => d.name === 'reputation_signals')?.score || 0)),
            timeline: '30 days'
          },
          'hero_products_use_case': {
            fix: 'Create detailed product comparison guides and use-case content',
            impact: Math.min(10, 90 - (dimensions.find(d => d.name === 'hero_products_use_case')?.score || 0)),
            timeline: '45 days'
          },
          'policies_logistics_clarity': {
            fix: 'Add structured data to shipping, returns, and FAQ pages',
            impact: Math.min(8, 90 - (dimensions.find(d => d.name === 'policies_logistics_clarity')?.score || 0)),
            timeline: '14 days'
          },
          'schema_structured_data': {
            fix: 'Implement comprehensive schema markup across all key pages',
            impact: Math.min(15, 90 - (dimensions.find(d => d.name === 'schema_structured_data')?.score || 0)),
            timeline: '30 days'
          }
        }
        
        const actions = lowestDimensions.map((dim, index) => {
          const action = actionMap[dim.name] || {
            fix: `Optimize ${dim.name.split('_').join(' ')} for better AI visibility`,
            impact: Math.min(10, 90 - (dim.score || 0)),
            timeline: '30-60 days'
          }
          
          const priorityLabel = index === 0 ? 'Priority 1 - Immediate' :
                               index === 1 ? 'Priority 2 - Short Term' :
                               'Priority 3 - Medium Term'
          
          return {
            priority: `${priorityLabel} (${action.timeline})`,
            fix: action.fix,
            impact: `+${action.impact} pts`
          }
        })
        
        // If we have fewer than 3 actions, add generic ones
        while (actions.length < 3) {
          actions.push({
            priority: `Priority ${actions.length + 1} - Strategic`,
            fix: 'Continue monitoring AI visibility and maintain strong performance',
            impact: '+5 pts'
          })
        }
        
        return actions
      }
      
      const actions = generateActions()
      
      actions.forEach((action, index) => {
        if (yPos > 250) {
          pdf.addPage()
          yPos = 30
        }
        
        pdf.setTextColor(...accentColor)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(action.priority, 20, yPos)
        
        yPos += 6
        pdf.setTextColor(...secondaryColor)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        const fixLines = pdf.splitTextToSize(`Fix: ${action.fix}`, 170)
        pdf.text(fixLines, 20, yPos)
        
        yPos += fixLines.length * 4 + 2
        pdf.setTextColor(...successColor)
        pdf.text(`Impact: ${action.impact}`, 20, yPos)
        yPos += 12
      })
      
      // BOTTOM LINE SECTION
      if (yPos > 220) {
        pdf.addPage()
        yPos = 30
      }
      
      yPos += 10
      pdf.setFillColor(...primaryColor)
      pdf.rect(15, yPos - 5, 180, 8, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('BOTTOM LINE', 20, yPos)
      yPos += 15
      
      pdf.setTextColor(...secondaryColor)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      // Generate contextual bottom line based on actual scores
      const generateBottomLine = () => {
        const score = evaluationData.overallScore || 0
        const perceptionScore = evaluationData.pillarScores?.perception || 0
        const commerceScore = evaluationData.pillarScores?.commerce || 0
        const infraScore = evaluationData.pillarScores?.infrastructure || 0
        
        let currentState = ''
        let opportunity = ''
        let risk = ''
        let nextStep = ''
        
        if (score >= 75) {
          currentState = 'Analysis completed successfully.'
          opportunity = 'Your brand has strong AI visibility. Focus on maintaining performance and monitoring emerging AI platforms.'
          risk = 'Complacency - AI landscape evolves rapidly. Regular monitoring recommended.'
          nextStep = 'Schedule quarterly AI visibility audits to stay ahead.'
        } else if (score >= 60) {
          currentState = 'Good foundation with room for improvement.'
          opportunity = `Focus on ${perceptionScore < 70 ? 'brand perception' : commerceScore < 70 ? 'commerce signals' : 'technical infrastructure'} - this offers the highest ROI.`
          risk = 'Competitors optimizing for AI may gain visibility advantage in product discovery.'
          nextStep = `Prioritize the lowest-scoring dimension (${dimensions.sort((a, b) => (a.score || 0) - (b.score || 0))[0]?.name.split('_').join(' ') || 'identified areas'}).`
        } else if (score >= 40) {
          currentState = 'Poor AI visibility - major overhaul required.'
          opportunity = `With focused effort on top 3 priorities, you could improve ${Math.min(30, 75 - score)}+ points in 90 days.`
          risk = 'Significant risk of brand invisibility in AI-driven product discovery vs. competitors.'
          nextStep = 'Implement Priority 1 action immediately - this offers quick wins and momentum.'
        } else {
          currentState = 'Critical - brand is nearly invisible to AI systems.'
          opportunity = 'Massive upside potential - even basic optimizations will yield significant improvements.'
          risk = 'Brand may be excluded from AI recommendations entirely, losing to competitors.'
          nextStep = 'Start with schema markup and basic SEO for AI - fundamental requirements.'
        }
        
        return { currentState, opportunity, risk, nextStep }
      }
      
      const bottomLine = generateBottomLine()
      
      const bottomLineText = `Current State: ${bottomLine.currentState}

Opportunity: ${bottomLine.opportunity}

If You Do Nothing: ${bottomLine.risk}

Next Step Today: ${bottomLine.nextStep}`
      
      const bottomLines = pdf.splitTextToSize(bottomLineText, 170)
      pdf.text(bottomLines, 20, yPos)
      
      // FOOTER
      yPos = 280
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(8)
      pdf.text(`Generated by AI Discoverability Index Platform | ${new Date().toLocaleString()}`, 20, yPos)
      
      // Generate filename and download
      const filename = `Executive_Snapshot_${formattedBrandName}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
      
      alert('Executive Snapshot downloaded successfully!')
      
    } catch (error) {
      console.error('Error generating executive snapshot:', error)
      alert(`Failed to generate executive snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Log evaluation for backend tracking
    logEvaluationForAdmin(evaluationData)
  }

  const logEvaluationForAdmin = async (data: EvaluationData) => {
    try {
      await fetch('/api/admin/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.url,
          tier: data.tier,
          overallScore: data.overallScore,
          pillarScores: data.pillarScores,
          timestamp: new Date().toISOString(),
          brandCategory: brandCategory,
          recommendations: data.recommendations,
          channelInsights: data.channelInsights,
          industryBenchmarks: data.industryBenchmarks
        })
      })
    } catch (error) {
      console.log('Admin logging failed:', error)
    }
  }

  useEffect(() => {
    const runEvaluation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get brand categorization first
        const brandName = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]
        let detectedCategory = null
        
        try {
          const categorizationResponse = await fetch(`/api/brand-categorization?action=categorize&brand=${encodeURIComponent(brandName)}&url=${encodeURIComponent(url)}`)
          if (categorizationResponse.ok) {
            const categoryData = await categorizationResponse.json()
            // Extract the proper category string for leaderboard API
            if (categoryData.category && typeof categoryData.category === 'object') {
              detectedCategory = categoryData.category.niche || categoryData.category.industry || categoryData.category.sector || 'general'
            } else {
              detectedCategory = categoryData.category || 'general'
            }
            setBrandCategory(categoryData.category)
            console.log('🔍 Brand categorization result:', {
              originalCategory: categoryData.category,
              extractedCategory: detectedCategory
            })
          }
        } catch (error) {
          console.log('Brand categorization failed, using fallback')
        }

        // Start evaluation
        const response = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, tier }),
        })

        if (!response.ok) {
          throw new Error('Failed to start evaluation')
        }

        const { evaluationId } = await response.json()
        console.log('Started evaluation:', evaluationId)
        setCurrentEvaluationId(evaluationId) // Store evaluation ID for progress component

        // Poll for completion
        let attempts = 0;
        const maxAttempts = tier === 'index-pro' || tier === 'enterprise' ? 300 : 150; // 10 minutes for professional tiers, 5 minutes for free
        const intervalId = setInterval(async () => {
          if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            const timeoutMinutes = Math.round(maxAttempts * 2 / 60);
            setError(`Evaluation is taking longer than expected (>${timeoutMinutes} minutes). This can happen with complex websites or during high traffic. Your report will be available on your dashboard when complete, or you can try again later.`);
            setIsLoading(false);
            return;
          }

          try {
            const statusResponse = await fetch(`/api/evaluation/${evaluationId}/status?tier=${tier}`);
            if (!statusResponse.ok) {
              // Stop polling on server errors
              clearInterval(intervalId);
              setError('An error occurred while fetching evaluation status.');
              setIsLoading(false);
              return;
            }

            const statusData = await statusResponse.json();
            console.log(`[Attempt ${attempts + 1}] Polling status:`, statusData);

            if (statusData.status === 'completed' || statusData.overallScore > 0) {
              clearInterval(intervalId);
              console.log('✅ Evaluation complete, fetching final report...');
              
              // Fetch final report data
              try {
                const reportResponse = await fetch(`/api/evaluation/${evaluationId}/report`);
                if (reportResponse.ok) {
                  const reportData = await reportResponse.json();
                  console.log('✅ Final report data (raw):', reportData);
                  console.log('🔍 Report structure check:', {
                    hasReport: !!reportData.report,
                    hasReportDimensionScores: !!reportData.report?.dimensionScores,
                    reportDimensionScoresLength: reportData.report?.dimensionScores?.length || 0,
                    firstDimensionInReport: reportData.report?.dimensionScores?.[0]
                  });
                  
                  // Use report data if available, fallback to status data
                  console.log('🔧 Data extraction chain:', {
                    hasReportDataReport: !!reportData.report,
                    hasReportData: !!reportData,
                    hasStatusDataReport: !!statusData.report,
                    hasStatusDataResults: !!statusData.results,
                    hasStatusData: !!statusData,
                    reportDataReportDimensions: reportData.report?.dimensionScores?.length || 0,
                    statusDataReportDimensions: statusData.report?.dimensionScores?.length || 0,
                    statusDataResultsDimensions: statusData.results?.dimensionScores?.length || 0
                  });
                  const finalData = reportData.report || reportData || statusData.report || statusData.results || statusData;
                  console.log('✅ Setting final evaluation data:', finalData);
                  console.log('🔍 DIMENSION SCORES DEBUG:', {
                    dimensionScoresLength: finalData?.dimensionScores?.length || 0,
                    firstDimension: finalData?.dimensionScores?.[0],
                    allDimensionNames: finalData?.dimensionScores?.map((d: any) => d.name),
                    allDimensionScores: finalData?.dimensionScores?.map((d: any) => d.score)
                  });
                  
                  setEvaluationData(finalData);
                  if(finalData.performanceProfile) {
                    setPerformanceProfile(finalData.performanceProfile);
                  }
                  setIsLoading(false);
                } else {
                  console.error('❌ Failed to fetch final report:', await reportResponse.text());
                  // Fallback to status data
                  setEvaluationData(statusData.report || statusData.results || statusData);
                  if(statusData.report?.performanceProfile) {
                    setPerformanceProfile(statusData.report.performanceProfile);
                  }
                  setIsLoading(false);
                }
              } catch (reportError) {
                console.error('❌ Error fetching final report:', reportError);
                // Fallback to status data
                setEvaluationData(statusData.report || statusData.results || statusData);
                if(statusData.report?.performanceProfile) {
                  setPerformanceProfile(statusData.report.performanceProfile);
                }
                setIsLoading(false);
              }
            } else if (statusData.status === 'failed') {
              clearInterval(intervalId);
              setError('Evaluation process failed. Please try again or contact support if the issue persists.');
              setIsLoading(false);
            } else if (statusData.status === 'running' || statusData.status === 'partial') {
              // Continue polling - evaluation is still in progress
              console.log(`[Attempt ${attempts + 1}] Evaluation still running...`, {
                status: statusData.status,
                progress: statusData.progress || 'unknown'
              });
            }
          } catch (err) {
            clearInterval(intervalId);
            setError('Failed to fetch status.');
            setIsLoading(false);
          }

          attempts++;
        }, 2000);

        // Fetch leaderboard data for professional tier using detected category
        if (tier === 'index-pro') {
          try {
            const leaderboardResponse = await fetch(`/api/leaderboards?category=${detectedCategory || 'general'}&limit=10`)
            if (leaderboardResponse.ok) {
              const leaderboardData = await leaderboardResponse.json()
              setLeaderboardData(leaderboardData)
            }
          } catch (error) {
            console.log('Leaderboard fetch failed:', error)
          }
        }

      } catch (error) {
        console.error('Evaluation error:', error)
        setError(error instanceof Error ? error.message : 'Evaluation failed')
        setIsLoading(false)
      }
    }

    runEvaluation()
  }, [url, tier])

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 60) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'
    if (score >= 80) return 'secondary'
    if (score >= 70) return 'outline'
    return 'destructive'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'outline'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Evaluation Failed</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/">Try Another URL</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Loading Animation */}
          <div className="max-w-4xl mx-auto">
            <EnhancedProgressDisplay 
              tier={tier} 
              url={url || 'https://example.com'}
              evaluationId={currentEvaluationId || undefined} // Pass real evaluation ID for status polling - FIXED!
            />
          </div>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return null
  }

  // Use Figma Audit-Grade Report design
  return <AuditGradeReportWrapper evaluationData={evaluationData} />;
}
