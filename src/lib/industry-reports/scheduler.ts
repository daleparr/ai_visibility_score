// Monthly automation scheduler for industry reports
// This would typically run as a cron job or scheduled function

import { industryReportsDB } from './db';
import { ProbeEngine } from './probe-engine';
import { ReportAnalyzer } from './analyzer';

export class ReportScheduler {
  /**
   * Run monthly probe for a sector
   * Should be called on the 1st of each month for each sector
   */
  async runMonthlyProbe(sectorSlug: string): Promise<{
    success: boolean;
    reportId?: string;
    error?: string;
  }> {
    try {
      console.log(`[Scheduler] Starting monthly probe for ${sectorSlug}`);
      
      // Get sector
      const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
      if (!sector) {
        throw new Error(`Sector not found: ${sectorSlug}`);
      }
      
      if (!sector.active) {
        console.log(`[Scheduler] Sector ${sectorSlug} is inactive, skipping`);
        return { success: false, error: 'Sector is inactive' };
      }
      
      // Get prompts
      const prompts = await industryReportsDB.getPromptsForSector(sector.id, true);
      if (prompts.length === 0) {
        throw new Error(`No active prompts for sector: ${sectorSlug}`);
      }
      
      console.log(`[Scheduler] Found ${prompts.length} prompts for ${sectorSlug}`);
      
      // Run probes
      const probeEngine = new ProbeEngine();
      const runDate = new Date();
      const probeResults = await probeEngine.runSectorProbe(sector.id, prompts, runDate);
      
      console.log(`[Scheduler] Completed ${probeResults.length} probes`);
      
      // Save probe results
      let savedCount = 0;
      for (const result of probeResults) {
        try {
          await industryReportsDB.saveProbeResult({
            sectorId: sector.id,
            promptId: result.promptId,
            modelId: result.modelId,
            runDate,
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
          console.error(`[Scheduler] Error saving probe result:`, err);
        }
      }
      
      console.log(`[Scheduler] Saved ${savedCount}/${probeResults.length} probe results`);
      
      // Generate report
      const analyzer = new ReportAnalyzer();
      const reportMonth = new Date(runDate.getFullYear(), runDate.getMonth(), 1);
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
          runDate: runDate,
          createdAt: runDate,
          brandCount: r.brandsMentioned.length,
        })),
        previousMonthPerformance: previousMonth,
      });
      
      console.log(`[Scheduler] Generated report with ${reportData.leaderboard?.length} brands`);
      
      // Save brand performance
      if (reportData.leaderboard) {
        for (const entry of reportData.leaderboard) {
          await industryReportsDB.saveBrandPerformance({
            sectorId: sector.id,
            reportMonth,
            ...entry.metrics as any,
          });
        }
      }
      
      // Save report as draft (admin will review and publish)
      const savedReport = await industryReportsDB.saveReport({
        ...reportData as any,
        status: 'draft',
      });
      
      console.log(`[Scheduler] Saved report ${savedReport.id} as draft`);
      
      // Update probe schedule status
      await industryReportsDB.updateProbeScheduleStatus(sector.id, 'success', {
        promptsRun: prompts.length,
        modelsProbed: 4,
        brandsMentioned: new Set(probeResults.flatMap(r => r.brandsMentioned.map(b => b.brand))).size,
        probesSaved: savedCount,
        reportId: savedReport.id,
      });
      
      // Send notification to admins
      await this.notifyAdmins(sector.name, savedReport.id);
      
      return { success: true, reportId: savedReport.id };
    } catch (error) {
      console.error(`[Scheduler] Error in monthly probe for ${sectorSlug}:`, error);
      
      // Update schedule with failure status
      const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
      if (sector) {
        await industryReportsDB.updateProbeScheduleStatus(sector.id, 'failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run all monthly probes for active sectors
   * Should be called once per month (e.g., via cron)
   */
  async runAllMonthlyProbes(): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{ sector: string; success: boolean; error?: string }>;
  }> {
    console.log('[Scheduler] Starting monthly probes for all sectors');
    
    const sectors = await industryReportsDB.getSectors(true);
    const results: Array<{ sector: string; success: boolean; error?: string }> = [];
    
    for (const sector of sectors) {
      const result = await this.runMonthlyProbe(sector.slug);
      results.push({
        sector: sector.slug,
        success: result.success,
        error: result.error,
      });
      
      // Wait between sectors to avoid rate limits
      await this.sleep(5000);
    }
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`[Scheduler] Completed: ${successful} successful, ${failed} failed`);
    
    // Send summary notification
    await this.notifySummary(results);
    
    return {
      total: results.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Notify admins about new draft report
   */
  private async notifyAdmins(sectorName: string, reportId: string): Promise<void> {
    // TODO: Implement email notification
    // Could use SendGrid, AWS SES, or similar
    console.log(`[Scheduler] Notification: New draft report for ${sectorName} (${reportId})`);
  }

  /**
   * Send summary notification after all probes complete
   */
  private async notifySummary(results: Array<{ sector: string; success: boolean; error?: string }>): Promise<void> {
    // TODO: Implement email summary
    console.log('[Scheduler] Monthly probe summary:', results);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Netlify/Vercel scheduled function handler
 * This should be deployed as a serverless function that runs monthly
 */
export async function scheduledMonthlyProbes() {
  const scheduler = new ReportScheduler();
  return await scheduler.runAllMonthlyProbes();
}

/**
 * API route handler for manual trigger
 */
export async function manualProbeRun(sectorSlug: string) {
  const scheduler = new ReportScheduler();
  return await scheduler.runMonthlyProbe(sectorSlug);
}

