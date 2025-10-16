// Database service layer for industry reports

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import {
  Sector,
  SectorPrompt,
  ProbeResult,
  BrandPerformance,
  IndustryReport,
  ReportSubscription,
  ProbeSchedule,
} from './types';

export class IndustryReportsDB {
  /**
   * SECTORS
   */
  async getSectors(activeOnly: boolean = true): Promise<Sector[]> {
    const query = activeOnly
      ? sql`SELECT * FROM industry_sectors WHERE active = true ORDER BY name`
      : sql`SELECT * FROM industry_sectors ORDER BY name`;
    
    const result = await db.execute(query);
    return result.rows as Sector[];
  }

  async getSectorBySlug(slug: string): Promise<Sector | null> {
    const result = await db.execute(
      sql`SELECT * FROM industry_sectors WHERE slug = ${slug} LIMIT 1`
    );
    return result.rows[0] as Sector || null;
  }

  async createSector(sector: Omit<Sector, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sector> {
    const result = await db.execute(sql`
      INSERT INTO industry_sectors (slug, name, description, icon_url, target_audience, market_size_notes, active, metadata)
      VALUES (${sector.slug}, ${sector.name}, ${sector.description}, ${sector.iconUrl}, 
              ${sector.targetAudience}, ${sector.marketSizeNotes}, ${sector.active}, ${JSON.stringify(sector.metadata)})
      RETURNING *
    `);
    return result.rows[0] as Sector;
  }

  /**
   * PROMPTS
   */
  async getPromptsForSector(sectorId: string, activeOnly: boolean = true): Promise<SectorPrompt[]> {
    const query = activeOnly
      ? sql`SELECT * FROM sector_prompts WHERE sector_id = ${sectorId} AND active = true`
      : sql`SELECT * FROM sector_prompts WHERE sector_id = ${sectorId}`;
    
    const result = await db.execute(query);
    return result.rows as SectorPrompt[];
  }

  async createPrompt(prompt: Omit<SectorPrompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<SectorPrompt> {
    const result = await db.execute(sql`
      INSERT INTO sector_prompts (
        sector_id, prompt_text, prompt_type, intent_category, 
        geographic_scope, temporal_context, expected_brand_count, 
        bias_controls, active
      )
      VALUES (
        ${prompt.sectorId}, ${prompt.promptText}, ${prompt.promptType}, 
        ${prompt.intentCategory}, ${prompt.geographicScope}, ${prompt.temporalContext},
        ${prompt.expectedBrandCount}, ${JSON.stringify(prompt.biasControls)}, ${prompt.active}
      )
      RETURNING *
    `);
    return result.rows[0] as SectorPrompt;
  }

  async bulkCreatePrompts(prompts: Omit<SectorPrompt, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
    if (prompts.length === 0) return 0;
    
    const values = prompts.map(p => 
      `('${p.sectorId}', '${p.promptText.replace(/'/g, "''")}', '${p.promptType}', '${p.intentCategory}', 
        ${p.geographicScope ? `'${p.geographicScope}'` : 'NULL'}, 
        ${p.temporalContext ? `'${p.temporalContext}'` : 'NULL'},
        ${p.expectedBrandCount || 'NULL'}, '${JSON.stringify(p.biasControls)}', ${p.active})`
    ).join(', ');
    
    await db.execute(sql.raw(`
      INSERT INTO sector_prompts (
        sector_id, prompt_text, prompt_type, intent_category, 
        geographic_scope, temporal_context, expected_brand_count, 
        bias_controls, active
      ) VALUES ${values}
    `));
    
    return prompts.length;
  }

  /**
   * PROBE RESULTS
   */
  async saveProbeResult(result: Omit<ProbeResult, 'id' | 'createdAt'>): Promise<ProbeResult> {
    const dbResult = await db.execute(sql`
      INSERT INTO probe_results (
        sector_id, prompt_id, model_id, model_version, run_date, run_number,
        response_text, response_tokens, response_latency_ms,
        brands_mentioned, sentiment_analysis, sources_cited, hallucination_flags,
        response_quality_score, brand_extraction_confidence, metadata
      )
      VALUES (
        ${result.sectorId}, ${result.promptId}, ${result.modelId}, ${result.modelVersion},
        ${result.runDate}, ${result.runNumber}, ${result.responseText}, ${result.responseTokens},
        ${result.responseLatencyMs}, ${JSON.stringify(result.brandsMentioned)},
        ${JSON.stringify(result.sentimentAnalysis)}, ${JSON.stringify(result.sourcesCited)},
        ${JSON.stringify(result.hallucinationFlags)}, ${result.responseQualityScore},
        ${result.brandExtractionConfidence}, ${JSON.stringify(result.metadata)}
      )
      RETURNING *
    `);
    return dbResult.rows[0] as ProbeResult;
  }

  async getProbeResultsForMonth(sectorId: string, month: Date): Promise<ProbeResult[]> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const result = await db.execute(sql`
      SELECT * FROM probe_results
      WHERE sector_id = ${sectorId}
        AND run_date >= ${startOfMonth}
        AND run_date <= ${endOfMonth}
      ORDER BY run_date DESC
    `);
    
    return result.rows as ProbeResult[];
  }

  /**
   * BRAND PERFORMANCE
   */
  async saveBrandPerformance(
    performance: Omit<BrandPerformance, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BrandPerformance> {
    const result = await db.execute(sql`
      INSERT INTO brand_performance (
        sector_id, report_month, brand_name, brand_domain,
        mention_count, mention_share, avg_position, top_3_appearances, recommendation_rate,
        models_mentioned_in, model_breakdown, avg_sentiment_score, sentiment_distribution,
        rank_overall, rank_change, co_mentioned_brands, hallucination_rate, source_citation_rate,
        metadata
      )
      VALUES (
        ${performance.sectorId}, ${performance.reportMonth}, ${performance.brandName}, ${performance.brandDomain},
        ${performance.mentionCount}, ${performance.mentionShare}, ${performance.avgPosition},
        ${performance.top3Appearances}, ${performance.recommendationRate}, ${performance.modelsMentionedIn},
        ${JSON.stringify(performance.modelBreakdown)}, ${performance.avgSentimentScore},
        ${JSON.stringify(performance.sentimentDistribution)}, ${performance.rankOverall}, ${performance.rankChange},
        ${JSON.stringify(performance.coMentionedBrands)}, ${performance.hallucinationRate},
        ${performance.sourceCitationRate}, ${JSON.stringify(performance.metadata)}
      )
      ON CONFLICT (sector_id, report_month, brand_name)
      DO UPDATE SET
        mention_count = EXCLUDED.mention_count,
        mention_share = EXCLUDED.mention_share,
        avg_position = EXCLUDED.avg_position,
        top_3_appearances = EXCLUDED.top_3_appearances,
        recommendation_rate = EXCLUDED.recommendation_rate,
        models_mentioned_in = EXCLUDED.models_mentioned_in,
        model_breakdown = EXCLUDED.model_breakdown,
        avg_sentiment_score = EXCLUDED.avg_sentiment_score,
        sentiment_distribution = EXCLUDED.sentiment_distribution,
        rank_overall = EXCLUDED.rank_overall,
        rank_change = EXCLUDED.rank_change,
        updated_at = now()
      RETURNING *
    `);
    
    return result.rows[0] as BrandPerformance;
  }

  async getBrandPerformanceForMonth(sectorId: string, month: Date): Promise<BrandPerformance[]> {
    const result = await db.execute(sql`
      SELECT * FROM brand_performance
      WHERE sector_id = ${sectorId}
        AND report_month = ${month}
      ORDER BY rank_overall
    `);
    
    return result.rows as BrandPerformance[];
  }

  async getPreviousMonthPerformance(sectorId: string, currentMonth: Date): Promise<BrandPerformance[]> {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    return this.getBrandPerformanceForMonth(sectorId, prevMonth);
  }

  /**
   * INDUSTRY REPORTS
   */
  async saveReport(report: Omit<IndustryReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndustryReport> {
    const result = await db.execute(sql`
      INSERT INTO industry_reports (
        sector_id, report_month, report_title, status,
        executive_summary, key_findings, methodology_notes,
        leaderboard, top_movers, new_entrants,
        trends_analysis, competitive_landscape, emerging_threats, model_insights,
        recommendations, pdf_url, dashboard_url, sample_preview_url,
        published_at, published_by, editorial_notes, metadata
      )
      VALUES (
        ${report.sectorId}, ${report.reportMonth}, ${report.reportTitle}, ${report.status},
        ${report.executiveSummary}, ${JSON.stringify(report.keyFindings)}, ${report.methodologyNotes},
        ${JSON.stringify(report.leaderboard)}, ${JSON.stringify(report.topMovers)},
        ${JSON.stringify(report.newEntrants)}, ${JSON.stringify(report.trendsAnalysis)},
        ${JSON.stringify(report.competitiveLandscape)}, ${JSON.stringify(report.emergingThreats)},
        ${JSON.stringify(report.modelInsights)}, ${JSON.stringify(report.recommendations)},
        ${report.pdfUrl}, ${report.dashboardUrl}, ${report.samplePreviewUrl},
        ${report.publishedAt}, ${report.publishedBy}, ${report.editorialNotes},
        ${JSON.stringify(report.metadata)}
      )
      ON CONFLICT (sector_id, report_month)
      DO UPDATE SET
        report_title = EXCLUDED.report_title,
        status = EXCLUDED.status,
        executive_summary = EXCLUDED.executive_summary,
        key_findings = EXCLUDED.key_findings,
        methodology_notes = EXCLUDED.methodology_notes,
        leaderboard = EXCLUDED.leaderboard,
        top_movers = EXCLUDED.top_movers,
        new_entrants = EXCLUDED.new_entrants,
        trends_analysis = EXCLUDED.trends_analysis,
        competitive_landscape = EXCLUDED.competitive_landscape,
        emerging_threats = EXCLUDED.emerging_threats,
        model_insights = EXCLUDED.model_insights,
        recommendations = EXCLUDED.recommendations,
        updated_at = now()
      RETURNING *
    `);
    
    return result.rows[0] as IndustryReport;
  }

  async getLatestReport(sectorId: string, publishedOnly: boolean = true): Promise<IndustryReport | null> {
    const statusFilter = publishedOnly ? sql`AND status = 'published'` : sql``;
    
    const result = await db.execute(sql`
      SELECT * FROM industry_reports
      WHERE sector_id = ${sectorId}
      ${statusFilter}
      ORDER BY report_month DESC
      LIMIT 1
    `);
    
    return result.rows[0] as IndustryReport || null;
  }

  async getReportByMonth(sectorId: string, month: Date): Promise<IndustryReport | null> {
    const result = await db.execute(sql`
      SELECT * FROM industry_reports
      WHERE sector_id = ${sectorId}
        AND report_month = ${month}
      LIMIT 1
    `);
    
    return result.rows[0] as IndustryReport || null;
  }

  async getReportsForSector(sectorId: string, limit: number = 12): Promise<IndustryReport[]> {
    const result = await db.execute(sql`
      SELECT * FROM industry_reports
      WHERE sector_id = ${sectorId}
        AND status = 'published'
      ORDER BY report_month DESC
      LIMIT ${limit}
    `);
    
    return result.rows as IndustryReport[];
  }

  async publishReport(reportId: string, publishedBy: string): Promise<void> {
    await db.execute(sql`
      UPDATE industry_reports
      SET status = 'published',
          published_at = now(),
          published_by = ${publishedBy}
      WHERE id = ${reportId}
    `);
  }

  /**
   * SUBSCRIPTIONS
   */
  async createSubscription(
    subscription: Omit<ReportSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportSubscription> {
    const result = await db.execute(sql`
      INSERT INTO report_subscriptions (
        user_id, sector_id, tier, status,
        can_view_full_reports, can_download_pdfs, can_access_archive, archive_months_limit,
        can_request_custom_prompts, api_access_enabled,
        price_monthly, currency, billing_interval,
        stripe_subscription_id, stripe_customer_id,
        started_at, current_period_end, metadata
      )
      VALUES (
        ${subscription.userId}, ${subscription.sectorId}, ${subscription.tier}, ${subscription.status},
        ${subscription.canViewFullReports}, ${subscription.canDownloadPdfs}, ${subscription.canAccessArchive},
        ${subscription.archiveMonthsLimit}, ${subscription.canRequestCustomPrompts}, ${subscription.apiAccessEnabled},
        ${subscription.priceMonthly}, ${subscription.currency}, ${subscription.billingInterval},
        ${subscription.stripeSubscriptionId}, ${subscription.stripeCustomerId},
        ${subscription.startedAt}, ${subscription.currentPeriodEnd}, ${JSON.stringify(subscription.metadata)}
      )
      RETURNING *
    `);
    
    return result.rows[0] as ReportSubscription;
  }

  async getUserSubscriptions(userId: string): Promise<ReportSubscription[]> {
    const result = await db.execute(sql`
      SELECT * FROM report_subscriptions
      WHERE user_id = ${userId}
        AND status = 'active'
      ORDER BY started_at DESC
    `);
    
    return result.rows as ReportSubscription[];
  }

  async checkUserAccess(userId: string, sectorId: string): Promise<ReportSubscription | null> {
    const result = await db.execute(sql`
      SELECT * FROM report_subscriptions
      WHERE user_id = ${userId}
        AND sector_id = ${sectorId}
        AND status = 'active'
      LIMIT 1
    `);
    
    return result.rows[0] as ReportSubscription || null;
  }

  /**
   * PROBE SCHEDULES
   */
  async getProbeSchedule(sectorId: string): Promise<ProbeSchedule | null> {
    const result = await db.execute(sql`
      SELECT * FROM probe_schedules
      WHERE sector_id = ${sectorId}
      LIMIT 1
    `);
    
    return result.rows[0] as ProbeSchedule || null;
  }

  async updateProbeScheduleStatus(
    sectorId: string,
    status: 'success' | 'partial' | 'failed',
    summary: Record<string, any>
  ): Promise<void> {
    await db.execute(sql`
      UPDATE probe_schedules
      SET last_run_at = now(),
          last_run_status = ${status},
          last_run_summary = ${JSON.stringify(summary)}
      WHERE sector_id = ${sectorId}
    `);
  }

  /**
   * ANALYTICS
   */
  async logReportAccess(
    userId: string | null,
    reportId: string,
    accessType: 'view' | 'download' | 'share',
    accessMethod: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await db.execute(sql`
      INSERT INTO report_access_logs (
        user_id, report_id, access_type, access_method,
        session_id, ip_address, user_agent
      )
      VALUES (
        ${userId}, ${reportId}, ${accessType}, ${accessMethod},
        ${sessionId}, ${ipAddress}, ${userAgent}
      )
    `);
  }

  async incrementReportViews(reportId: string): Promise<void> {
    await db.execute(sql`
      UPDATE industry_reports
      SET view_count = view_count + 1
      WHERE id = ${reportId}
    `);
  }

  async incrementReportDownloads(reportId: string): Promise<void> {
    await db.execute(sql`
      UPDATE industry_reports
      SET download_count = download_count + 1
      WHERE id = ${reportId}
    `);
  }
}

// Export singleton instance
export const industryReportsDB = new IndustryReportsDB();

