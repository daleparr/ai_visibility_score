import { db } from '@/lib/db'

/**
 * Dynamic Content Generator
 * Handles template processing and variable substitution for dashboard content
 */
export class DynamicContentGenerator {
  
  /**
   * Generate executive summary with dynamic content
   */
  async generateExecutiveSummary(
    userId: string, 
    templateId?: string
  ): Promise<{
    content: string
    variables: Record<string, any>
    template: any
  }> {
    try {
      // Get user's portfolio data for variables
      const portfolioData = await this.getPortfolioData(userId)
      
      // Get executive summary template
      const template = await this.getTemplate('executive_summary', templateId)
      
      // Process template with variables
      const processedContent = this.processTemplate(template.content, portfolioData)
      
      return {
        content: processedContent,
        variables: portfolioData,
        template
      }
    } catch (error) {
      console.error('Error generating executive summary:', error)
      throw error
    }
  }

  /**
   * Generate priority alerts with dynamic content
   */
  async generatePriorityAlerts(
    userId: string,
    templateId?: string
  ): Promise<{
    alerts: any[]
    variables: Record<string, any>
    template: any
  }> {
    try {
      // Get user's alert data
      const alertData = await this.getAlertData(userId)
      
      // Get alert template
      const template = await this.getTemplate('alert_template', templateId)
      
      // Process each alert with template
      const processedAlerts = alertData.map(alert => ({
        ...alert,
        processedTitle: this.processTemplate(template.content, alert),
        processedDescription: this.processTemplate(template.description || '', alert)
      }))
      
      return {
        alerts: processedAlerts,
        variables: alertData,
        template
      }
    } catch (error) {
      console.error('Error generating priority alerts:', error)
      throw error
    }
  }

  /**
   * Generate insights with dynamic content
   */
  async generateInsights(
    userId: string,
    insightType: string,
    templateId?: string
  ): Promise<{
    insights: any[]
    variables: Record<string, any>
    template: any
  }> {
    try {
      // Get user's insight data
      const insightData = await this.getInsightData(userId, insightType)
      
      // Get insight template
      const template = await this.getTemplate('insight_card', templateId)
      
      // Process each insight with template
      const processedInsights = insightData.map(insight => ({
        ...insight,
        processedContent: this.processTemplate(template.content, insight)
      }))
      
      return {
        insights: processedInsights,
        variables: insightData,
        template
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      throw error
    }
  }

  /**
   * Get user's dashboard template
   */
  async getUserDashboardTemplate(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          udp.*,
          dt.template_name,
          dt.template_type,
          dt.content_structure
        FROM user_dashboard_preferences udp
        LEFT JOIN dashboard_templates dt ON udp.template_id = dt.id
        WHERE udp.user_id = $1
      `
      
      const result = await db.query(query, [userId])
      
      if (result.length === 0) {
        // Return default template
        const defaultTemplate = await db.query(`
          SELECT * FROM dashboard_templates 
          WHERE is_default = true AND is_active = true 
          ORDER BY created_at ASC 
          LIMIT 1
        `)
        
        return {
          template: defaultTemplate[0],
          customSettings: {}
        }
      }
      
      return {
        template: result[0],
        customSettings: result[0].custom_settings || {}
      }
    } catch (error) {
      console.error('Error getting user dashboard template:', error)
      throw error
    }
  }

  /**
   * Get content block by type
   */
  private async getTemplate(
    blockType: string, 
    templateId?: string
  ): Promise<any> {
    try {
      let query = `
        SELECT * FROM dashboard_content_blocks 
        WHERE block_type = $1 AND is_active = true
      `
      const params = [blockType]
      
      if (templateId) {
        query += ` AND template_id = $2`
        params.push(templateId)
      }
      
      query += ` ORDER BY created_at DESC LIMIT 1`
      
      const result = await db.query(query, params)
      
      if (result.length === 0) {
        throw new Error(`No template found for block type: ${blockType}`)
      }
      
      return result[0]
    } catch (error) {
      console.error(`Error getting template for ${blockType}:`, error)
      throw error
    }
  }

  /**
   * Process template with variable substitution
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    try {
      let processedContent = template
      
      // Replace variables in the format {variableName}
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key}}`
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value))
      }
      
      return processedContent
    } catch (error) {
      console.error('Error processing template:', error)
      return template
    }
  }

  /**
   * Get portfolio data for template variables
   */
  private async getPortfolioData(userId: string): Promise<Record<string, any>> {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT b.id) as total_brands,
          AVG(e.adi_score) as avg_aidi_score,
          COUNT(CASE WHEN e.industry_percentile >= 75 THEN 1 END) as above_benchmark,
          COUNT(CASE WHEN e.adi_score < 60 THEN 1 END) as action_required
        FROM brands b
        JOIN evaluations e ON b.id = e.brand_id
        WHERE b.user_id = $1
          AND e.status = 'completed'
          AND e.completed_at >= NOW() - INTERVAL '90 days'
      `
      
      const result = await db.query(query, [userId])
      const data = result[0] || {}
      
      return {
        totalBrands: parseInt(data.total_brands) || 0,
        avgAidiScore: Math.round(parseFloat(data.avg_aidi_score) || 0),
        aboveBenchmark: parseInt(data.above_benchmark) || 0,
        actionRequired: parseInt(data.action_required) || 0,
        avgScore: Math.round(parseFloat(data.avg_aidi_score) || 0)
      }
    } catch (error) {
      console.error('Error getting portfolio data:', error)
      return {}
    }
  }

  /**
   * Get alert data for template variables
   */
  private async getAlertData(userId: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          b.name as brand_name,
          b.id as brand_id,
          e.adi_score as current_score,
          LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) as previous_score,
          e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at) as score_change,
          e.completed_at
        FROM brands b
        JOIN evaluations e ON b.id = e.brand_id
        WHERE b.user_id = $1
          AND e.status = 'completed'
          AND e.completed_at >= NOW() - INTERVAL '30 days'
        ORDER BY ABS(e.adi_score - LAG(e.adi_score) OVER (PARTITION BY b.id ORDER BY e.completed_at)) DESC
        LIMIT 5
      `
      
      const result = await db.query(query, [userId])
      
      return result.map((row: any) => ({
        brandName: row.brand_name,
        brandId: row.brand_id,
        currentScore: Math.round(parseFloat(row.current_score) || 0),
        previousScore: Math.round(parseFloat(row.previous_score) || 0),
        scoreChange: Math.round(parseFloat(row.score_change) || 0),
        changeType: (row.score_change > 0) ? 'increased' : 'decreased'
      }))
    } catch (error) {
      console.error('Error getting alert data:', error)
      return []
    }
  }

  /**
   * Get insight data for template variables
   */
  private async getInsightData(userId: string, insightType: string): Promise<any[]> {
    try {
      // This would typically query the dashboard_insights table
      // For now, return mock insight data
      return [
        {
          direction: 'upward',
          change: 4.2,
          improvement: 'improvement',
          dimension: 'Technical Foundation',
          performance: 'excellent',
          confidence: 'high'
        }
      ]
    } catch (error) {
      console.error('Error getting insight data:', error)
      return []
    }
  }

  /**
   * Create dynamic content block
   */
  async createDynamicContentBlock(
    blockType: string,
    content: string,
    variables: string[],
    createdBy: string,
    templateId?: string
  ): Promise<any> {
    try {
      const query = `
        INSERT INTO dashboard_content_blocks (
          block_type,
          content,
          variables,
          template_id,
          created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      
      const result = await db.query(query, [
        blockType,
        content,
        variables,
        templateId,
        createdBy
      ])
      
      return result[0]
    } catch (error) {
      console.error('Error creating dynamic content block:', error)
      throw error
    }
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(template: string, availableVariables: string[]): {
    isValid: boolean
    missingVariables: string[]
    extraVariables: string[]
  } {
    const templateVariables = template.match(/\{([^}]+)\}/g) || []
    const templateVarNames = templateVariables.map(v => v.slice(1, -1))
    
    const missingVariables = templateVarNames.filter(v => !availableVariables.includes(v))
    const extraVariables = availableVariables.filter(v => !templateVarNames.includes(v))
    
    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      extraVariables
    }
  }
}
