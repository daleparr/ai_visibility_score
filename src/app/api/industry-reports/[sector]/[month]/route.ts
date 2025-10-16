// API: Get specific month report for a sector

import { NextRequest, NextResponse } from 'next/server';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { sector: string; month: string } }
) {
  try {
    const sectorSlug = params.sector;
    const monthParam = params.month; // Format: YYYY-MM
    
    // Parse month
    const [year, month] = monthParam.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format. Use YYYY-MM' },
        { status: 400 }
      );
    }
    
    const reportDate = new Date(year, month - 1, 1);
    
    // Get sector
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    if (!sector) {
      return NextResponse.json(
        { success: false, error: 'Sector not found' },
        { status: 404 }
      );
    }
    
    // Get report for specific month
    const report = await industryReportsDB.getReportByMonth(sector.id, reportDate);
    if (!report || report.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Report not found or not published' },
        { status: 404 }
      );
    }
    
    // Check user access and archive permissions
    const session = await getServerSession(authOptions);
    let accessLevel: 'free' | 'pro' | 'enterprise' = 'free';
    let hasArchiveAccess = false;
    
    if (session?.user?.id) {
      const subscription = await industryReportsDB.checkUserAccess(
        session.user.id,
        sector.id
      );
      if (subscription) {
        accessLevel = subscription.tier as 'free' | 'pro' | 'enterprise';
        hasArchiveAccess = subscription.canAccessArchive;
        
        // Check if report is within archive access limit
        if (hasArchiveAccess && subscription.archiveMonthsLimit) {
          const monthsAgo = Math.floor(
            (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          hasArchiveAccess = monthsAgo <= subscription.archiveMonthsLimit;
        }
      }
    }
    
    // Check if this is an archive report (older than 1 month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const isArchive = reportDate < oneMonthAgo;
    
    if (isArchive && !hasArchiveAccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Archive access required. Upgrade to Pro or Enterprise.',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
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
      isArchive,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
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
      emergingThreats: report.emergingThreats, // Full threats
      recommendations: report.recommendations.filter((r: any) => 
        ['top10', 'mid-tier'].includes(r.forBrandTier)
      ),
    };
  }
  
  // Free tier - limited access
  return {
    id: report.id,
    sectorId: report.sectorId,
    reportMonth: report.reportMonth,
    reportTitle: report.reportTitle,
    executiveSummary: report.executiveSummary,
    keyFindings: report.keyFindings.slice(0, 3),
    leaderboard: report.leaderboard.slice(0, 10),
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

