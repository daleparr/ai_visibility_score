// API: Trigger probe run for a sector (admin only)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { ProbeEngine } from '@/lib/industry-reports/probe-engine';
import { ReportAnalyzer } from '@/lib/industry-reports/analyzer';

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { sectorSlug, runDate } = body;
    
    if (!sectorSlug) {
      return NextResponse.json(
        { success: false, error: 'sectorSlug is required' },
        { status: 400 }
      );
    }
    
    // Get sector
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    if (!sector) {
      return NextResponse.json(
        { success: false, error: 'Sector not found' },
        { status: 404 }
      );
    }
    
    // Get prompts for sector
    const prompts = await industryReportsDB.getPromptsForSector(sector.id, true);
    if (prompts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active prompts found for sector' },
        { status: 400 }
      );
    }
    
    console.log(`Starting probe run for ${sectorSlug} with ${prompts.length} prompts`);
    
    // Run probes
    const probeEngine = new ProbeEngine();
    const date = runDate ? new Date(runDate) : new Date();
    const probeResults = await probeEngine.runSectorProbe(sector.id, prompts, date);
    
    // Save probe results to database
    let savedCount = 0;
    for (const result of probeResults) {
      try {
        await industryReportsDB.saveProbeResult({
          sectorId: sector.id,
          promptId: result.promptId,
          modelId: result.modelId,
          modelVersion: probeResults[0]?.responseText ? 'v1' : undefined,
          runDate: date,
          runNumber: result.runNumber,
          responseText: result.responseText,
          responseTokens: result.responseTokens,
          responseLatencyMs: result.responseLatencyMs,
          brandsMentioned: result.brandsMentioned,
          brandCount: result.brandsMentioned.length,
          sentimentAnalysis: result.sentimentAnalysis,
          sourcesCited: result.sourcesCited,
          hallucinationFlags: result.hallucinationFlags,
          responseQualityScore: result.responseQualityScore,
          brandExtractionConfidence: result.brandExtractionConfidence,
        });
        savedCount++;
      } catch (err) {
        console.error('Error saving probe result:', err);
      }
    }
    
    console.log(`Saved ${savedCount} probe results`);
    
    // Generate report
    const analyzer = new ReportAnalyzer();
    const reportMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const previousMonth = await industryReportsDB.getPreviousMonthPerformance(
      sector.id,
      reportMonth
    );
    
    const reportData = await analyzer.generateMonthlyReport({
      sectorId: sector.id,
      month: reportMonth,
      probeResults: probeResults.map(r => ({
        ...r,
        id: '',
        sectorId: sector.id,
        runDate: date,
        createdAt: date,
        brandCount: r.brandsMentioned.length,
      })),
      previousMonthPerformance: previousMonth,
    });
    
    // Save brand performance data
    if (reportData.leaderboard) {
      for (const entry of reportData.leaderboard) {
        await industryReportsDB.saveBrandPerformance({
          sectorId: sector.id,
          reportMonth,
          ...entry.metrics as any,
        });
      }
    }
    
    // Save report as draft
    const savedReport = await industryReportsDB.saveReport({
      ...reportData as any,
      status: 'draft',
    });
    
    // Update probe schedule status
    await industryReportsDB.updateProbeScheduleStatus(sector.id, 'success', {
      promptsRun: prompts.length,
      modelsProbed: 4,
      brandsMentioned: new Set(probeResults.flatMap(r => r.brandsMentioned.map(b => b.brand))).size,
      probesSaved: savedCount,
      reportId: savedReport.id,
    });
    
    return NextResponse.json({
      success: true,
      probesRun: probeResults.length,
      probesSaved: savedCount,
      reportId: savedReport.id,
      reportStatus: 'draft',
    });
  } catch (error) {
    console.error('Error running probe:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run probe', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
  return adminEmails.includes(email);
}

