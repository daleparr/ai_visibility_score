import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cms/dashboard-content
 * Retrieve dashboard content blocks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const blockType = searchParams.get('blockType')
    const templateType = searchParams.get('templateType')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = `
      SELECT 
        dc.*,
        dt.template_name,
        u.name as created_by_name
      FROM dashboard_content_blocks dc
      LEFT JOIN dashboard_templates dt ON dc.template_id = dt.id
      LEFT JOIN users u ON dc.created_by = u.id
      WHERE 1=1
    `
    
    const queryParams: any[] = []
    let paramIndex = 1

    if (blockType) {
      query += ` AND dc.block_type = $${paramIndex}`
      queryParams.push(blockType)
      paramIndex++
    }

    if (!includeInactive) {
      query += ` AND dc.is_active = true`
    }

    query += ` ORDER BY dc.created_at DESC`

    const content = await db.query(query, queryParams)

    return NextResponse.json({ 
      success: true,
      content,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        filters: { blockType, templateType, includeInactive }
      }
    })

  } catch (error) {
    console.error('Dashboard content API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cms/dashboard-content
 * Create new dashboard content block
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
      blockType, 
      title, 
      content, 
      metadata, 
      variables,
      templateId 
    } = body

    if (!blockType || !content) {
      return NextResponse.json({ error: 'Block type and content are required' }, { status: 400 })
    }

    const query = `
      INSERT INTO dashboard_content_blocks (
        block_type, 
        title, 
        content, 
        metadata, 
        variables,
        template_id,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await db.query(query, [
      blockType,
      title,
      content,
      metadata ? JSON.stringify(metadata) : null,
      variables || [],
      templateId,
      sessionUser.id
    ])

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard content block created successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard content creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create dashboard content block',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cms/dashboard-content
 * Update existing dashboard content block
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
      blockType, 
      title, 
      content, 
      metadata, 
      variables,
      isActive 
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Content block ID is required' }, { status: 400 })
    }

    // Check if user has permission to edit this content block
    const permissionCheck = await db.query(
      'SELECT created_by FROM dashboard_content_blocks WHERE id = $1',
      [id]
    )

    if (permissionCheck.length === 0) {
      return NextResponse.json({ error: 'Content block not found' }, { status: 404 })
    }

    // For now, allow editing if user created the block (you can add more sophisticated permissions)
    if (permissionCheck[0].created_by !== sessionUser.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    if (blockType !== undefined) {
      updateFields.push(`block_type = $${paramIndex}`)
      updateValues.push(blockType)
      paramIndex++
    }

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex}`)
      updateValues.push(title)
      paramIndex++
    }

    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex}`)
      updateValues.push(content)
      paramIndex++
    }

    if (metadata !== undefined) {
      updateFields.push(`metadata = $${paramIndex}`)
      updateValues.push(metadata ? JSON.stringify(metadata) : null)
      paramIndex++
    }

    if (variables !== undefined) {
      updateFields.push(`variables = $${paramIndex}`)
      updateValues.push(variables)
      paramIndex++
    }

    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`)
      updateValues.push(isActive)
      paramIndex++
    }

    updateValues.push(id) // Add ID as last parameter

    const query = `
      UPDATE dashboard_content_blocks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await db.query(query, updateValues)

    return NextResponse.json({ 
      success: true,
      data: result[0],
      message: 'Dashboard content block updated successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard content update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update dashboard content block',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cms/dashboard-content
 * Delete dashboard content block
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
      return NextResponse.json({ error: 'Content block ID is required' }, { status: 400 })
    }

    // Check if user has permission to delete this content block
    const permissionCheck = await db.query(
      'SELECT created_by FROM dashboard_content_blocks WHERE id = $1',
      [id]
    )

    if (permissionCheck.length === 0) {
      return NextResponse.json({ error: 'Content block not found' }, { status: 404 })
    }

    if (permissionCheck[0].created_by !== sessionUser.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await db.query('DELETE FROM dashboard_content_blocks WHERE id = $1', [id])

    return NextResponse.json({ 
      success: true,
      message: 'Dashboard content block deleted successfully',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Dashboard content deletion error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete dashboard content block',
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
