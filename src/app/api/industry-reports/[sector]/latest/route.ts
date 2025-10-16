// API: Get latest report for a sector

import { NextRequest, NextResponse } from 'next/server';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { sector: string } }
) {
  try {
    const sectorSlug = params.sector;
    
    // Get sector
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    if (!sector) {
      return NextResponse.json(
        { success: false, error: 'Sector not found' },
        { status: 404 }
      );
    }
    
    // Get latest published report
    const report = await industryReportsDB.getLatestReport(sector.id, true);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'No published reports found for this sector' },
        { status: 404 }
      );
    }
    
    // Check user access level
    const session = await getServerSession(authOptions);
    let accessLevel: 'free' | 'pro' | 'enterprise' = 'free';
    
    if (session?.user?.id) {
      const subscription = await industryReportsDB.checkUserAccess(
        session.user.id,
        sector.id
      );
      if (subscription) {
        accessLevel = subscription.tier as 'free' | 'pro' | 'enterprise';
      }
    }
    
    // Filter report data based on access level
    const filteredReport = filterReportByAccess(report, accessLevel);
    
    // Log access
    if (report.id) {
      await industryReportsDB.incrementReportViews(report.id);
      await industryReportsDB.logReportAccess(
        session?.user?.id || null,
        report.id,
        'view',
        'api',
        request.headers.get('x-session-id') || undefined,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );
    }
    
    return NextResponse.json({
      success: true,
      report: filteredReport,
      sector,
      accessLevel,
    });
  } catch (error) {
    console.error('Error fetching latest report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

function filterReportByAccess(report: any, accessLevel: 'free' | 'pro' | 'enterprise') {
  if (accessLevel === 'enterprise') {
    return report; // Full access
  }
  
  if (accessLevel === 'pro') {
    return {
      ...report,
      leaderboard: report.leaderboard, // Full leaderboard
      recommendations: report.recommendations.filter((r: any) => 
        ['top10', 'mid-tier'].includes(r.forBrandTier)
      ), // Some recommendations
    };
  }
  
  // Free tier - limited access
  return {
    id: report.id,
    sectorId: report.sectorId,
    reportMonth: report.reportMonth,
    reportTitle: report.reportTitle,
    executiveSummary: report.executiveSummary,
    keyFindings: report.keyFindings.slice(0, 3), // Top 3 findings only
    leaderboard: report.leaderboard.slice(0, 10), // Top 10 only
    topMovers: report.topMovers.slice(0, 3),
    trendsAnalysis: {
      overallTrend: report.trendsAnalysis.overallTrend,
      insights: report.trendsAnalysis.insights.slice(0, 2),
    },
    samplePreviewUrl: report.samplePreviewUrl,
    viewCount: report.viewCount,
    publishedAt: report.publishedAt,
  };
}

