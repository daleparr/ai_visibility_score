import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cms/dashboard-preferences
 * Retrieve user dashboard preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const preferences = await db.query(query, [sessionUser.id])

    // If no preferences exist, return default template
    if (preferences.length === 0) {
      const defaultTemplate = await db.query(`
        SELECT * FROM dashboard_templates 
        WHERE is_default = true AND is_active = true 
        ORDER BY created_at ASC 
        LIMIT 1
      `)

      return NextResponse.json({ 
        success: true,
        preferences: {
          user_id: sessionUser.id,
          template_id: defaultTemplate[0]?.id || null,
          custom_settings: {},
          template: defaultTemplate[0] || null
        },
        isDefault: true,
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      preferences: preferences[0],
      isDefault: false,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard preferences API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cms/dashboard-preferences
 * Create or update user dashboard preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      templateId, 
      customSettings 
    } = body

    // Validate template ID if provided
    if (templateId) {
      const templateCheck = await db.query(
        'SELECT id FROM dashboard_templates WHERE id = $1 AND is_active = true',
        [templateId]
      )
      
      if (templateCheck.length === 0) {
        return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
      }
    }

    // Check if preferences already exist
    const existingPreferences = await db.query(
      'SELECT id FROM user_dashboard_preferences WHERE user_id = $1',
      [sessionUser.id]
    )

    let result
    if (existingPreferences.length > 0) {
      // Update existing preferences
      const query = `
        UPDATE user_dashboard_preferences 
        SET template_id = $1, custom_settings = $2, updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `
      result = await db.query(query, [
        templateId,
        customSettings ? JSON.stringify(customSettings) : null,
        sessionUser.id
      ])
    } else {
      // Create new preferences
      const query = `
        INSERT INTO user_dashboard_preferences (
          user_id, 
          template_id, 
          custom_settings
        ) VALUES ($1, $2, $3)
        RETURN ReadING *
      `
      result = await db.query(query, [
        sessionUser.id,
        templateId,
        customSettings ? JSON.stringify(customSettings) : null
      ])
    }

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard preferences saved successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard preferences save error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save dashboard preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cms/dashboard-preferences
 * Update specific dashboard preference settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      templateId, 
      customSettings,
      widgetPositions,
      alertThresholds,
      displayPreferences 
    } = body

    // Get existing preferences
    const existingPreferences = await db.query(
      'SELECT * FROM user_dashboard_preferences WHERE user_id = $1',
      [sessionUser.id]
    )

    let currentSettings = {}
    if (existingPreferences.length > 0) {
      currentSettings = existingPreferences[0].custom_settings || {}
    }

    // Merge new settings with existing ones
    const updatedSettings = {
      ...currentSettings,
      ...(customSettings || {}),
      ...(widgetPositions && { widgetPositions }),
      ...(alertThresholds && { alertThresholds }),
      ...(displayPreferences && { displayPreferences })
    }

    // Validate template ID if provided
    if (templateId) {
      const templateCheck = await db.query(
        'SELECT id FROM dashboard_templates WHERE id = $1 AND is_active = true',
        [templateId]
      )
      
      if (templateCheck.length === 0) {
        return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
      }
    }

    let result
    if (existingPreferences.length > 0) {
      // Update existing preferences
      const query = `
        UPDATE user_dashboard_preferences 
        SET template_id = COALESCE($1, template_id), 
            custom_settings = $2, 
            updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `
      result = await db.query(query, [
        templateId,
        JSON.stringify(updatedSettings),
        sessionUser.id
      ])
    } else {
      // Create new preferences
      const query = `
        INSERT INTO user_dashboard_preferences (
          user_id, 
          template_id, 
          custom_settings
        ) VALUES ($1, $2, $3)
        RETURNING *
      `
      result = await db.query(query, [
        sessionUser.id,
        templateId,
        JSON.stringify(updatedSettings)
      ])
    }

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard preferences updated successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard preferences update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update dashboard preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cms/dashboard-preferences
 * Reset user dashboard preferences to default
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user preferences (will fall back to default template)
    await db.query(
      'DELETE FROM user_dashboard_preferences WHERE user_id = $1',
      [sessionUser.id]
    )

    // Get default template for response
    const defaultTemplate = await db.query(`
      SELECT * FROM dashboard_templates 
      WHERE is_default = true AND is_active = true 
      ORDER BY created_at ASC 
      LIMIT 1
    `)

    return NextResponse.json({ 
      success: true,
      message: 'Dashboard preferences reset to default',
      defaultTemplate: defaultTemplate[0] || null,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard preferences reset error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset dashboard preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
