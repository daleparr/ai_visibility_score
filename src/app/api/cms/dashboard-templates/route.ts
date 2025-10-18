import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cms/dashboard-templates
 * Retrieve dashboard templates with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const templateType = searchParams.get('templateType')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const includeDefault = searchParams.get('includeDefault') !== 'false' // Default to true

    let query = `
      SELECT 
        dt.*,
        u.name as created_by_name,
        COUNT(dcb.id) as content_block_count
      FROM dashboard_templates dt
      LEFT JOIN users u ON dt.created_by = u.id
      LEFT JOIN dashboard_content_blocks dcb ON dt.id = dcb.template_id
      WHERE 1=1
    `
    
    const queryParams: any[] = []
    let paramIndex = 1

    if (templateType) {
      query += ` AND dt.template_type = $${paramIndex}`
      queryParams.push(templateType)
      paramIndex++
    }

    if (!includeInactive) {
      query += ` AND dt.is_active = true`
    }

    if (!includeDefault) {
      query += ` AND dt.is_default = false`
    }

    query += ` GROUP BY dt.id, u.name ORDER BY dt.is_default DESC, dt.created_at DESC`

    const templates = await db.query(query, queryParams)

    return NextResponse.json({ 
      success: true,
      templates,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        filters: { templateType, includeInactive, includeDefault }
      }
    })

  } catch (error) {
    console.error('Dashboard templates API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cms/dashboard-templates
 * Create new dashboard template
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
      templateName, 
      templateType, 
      contentStructure, 
      isDefault = false 
    } = body

    if (!templateName || !templateType || !contentStructure) {
      return NextResponse.json({ 
        error: 'Template name, type, and content structure are required' 
      }, { status: 400 })
    }

    // Validate content structure
    if (!validateContentStructure(contentStructure)) {
      return NextResponse.json({ 
        error: 'Invalid content structure format' 
      }, { status: 400 })
    }

    // If setting as default, unset other defaults of the same type
    if (isDefault) {
      await db.query(
        'UPDATE dashboard_templates SET is_default = false WHERE template_type = $1',
        [templateType]
      )
    }

    const query = `
      INSERT INTO dashboard_templates (
        template_name, 
        template_type, 
        content_structure, 
        is_default,
        created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const result = await db.query(query, [
      templateName,
      templateType,
      JSON.stringify(contentStructure),
      isDefault,
      sessionUser.id
    ])

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard template created successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard template creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create dashboard template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cms/dashboard-templates
 * Update existing dashboard template
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
      id,
      templateName, 
      templateType, 
      contentStructure, 
      isDefault,
      isActive 
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Check if user has permission to edit this template
    const permissionCheck = await db.query(
      'SELECT created_by FROM dashboard_templates WHERE id = $1',
      [id]
    )

    if (permissionCheck.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Allow editing if user created the template or if it's a default template
    const template = permissionCheck[0]
    if (template.created_by !== sessionUser.id && !template.is_default) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // If setting as default, unset other defaults of the same type
    if (isDefault) {
      await db.query(
        'UPDATE dashboard_templates SET is_default = false WHERE template_type = $1 AND id != $2',
        [templateType, id]
      )
    }

    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    if (templateName !== undefined) {
      updateFields.push(`template_name = $${paramIndex}`)
      updateValues.push(templateName)
      paramIndex++
    }

    if (templateType !== undefined) {
      updateFields.push(`template_type = $${paramIndex}`)
      updateValues.push(templateType)
      paramIndex++
    }

    if (contentStructure !== undefined) {
      if (!validateContentStructure(contentStructure)) {
        return NextResponse.json({ 
          error: 'Invalid content structure format' 
        }, { status: 400 })
      }
      updateFields.push(`content_structure = $${paramIndex}`)
      updateValues.push(JSON.stringify(contentStructure))
      paramIndex++
    }

    if (isDefault !== undefined) {
      updateFields.push(`is_default = $${paramIndex}`)
      updateValues.push(isDefault)
      paramIndex++
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      updateValues.push(isActive)
      paramIndex++
    }

    updateValues.push(id) // Add ID as last parameter

    const query = `
      UPDATE dashboard_templates 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query(query, updateValues)

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard template updated successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard template update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update dashboard template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cms/dashboard-templates
 * Delete dashboard template
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    // Check if user has permission to delete this template
    const permissionCheck = await db.query(
      'SELECT created_by, is_default FROM dashboard_templates WHERE id = $1',
      [id]
    )

    if (permissionCheck.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const template = permissionCheck[0]
    if (template.created_by !== sessionUser.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    if (template.is_default) {
      return NextResponse.json({ error: 'Cannot delete default template' }, { status: 400 })
    }

    await db.query('DELETE FROM dashboard_templates WHERE id = $1', [id])

    return NextResponse.json({ 
      success: true,
      message: 'Dashboard template deleted successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard template deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete dashboard template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Validate content structure format
 */
function validateContentStructure(contentStructure: any): boolean {
  try {
    // Basic validation - should be an object with sections
    if (typeof contentStructure !== 'object' || contentStructure === null) {
      return false
    }

    // Check if it has sections array
    if (!Array.isArray(contentStructure.sections)) {
      return false
    }

    // Validate each section
    for (const section of contentStructure.sections) {
      if (typeof section !== 'object' || !section.name || !Array.isArray(section.blocks)) {
        return false
      }
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
