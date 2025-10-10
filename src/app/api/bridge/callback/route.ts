import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Bridge API: Callback endpoint for Railway notifications
 * THIS IS THE ACTUAL ENDPOINT BEING CALLED!
 * POST /api/bridge/callback
 */
export async function POST(request: NextRequest) {
  console.log(``)
  console.log(`╔═══════════════════════════════════════════════════════════╗`)
  console.log(`║  🔔 API ROUTE CALLBACK RECEIVED FROM RAILWAY!             ║`)
  console.log(`║  THIS WAS THE MISSING PIECE!                              ║`)
  console.log(`╚═══════════════════════════════════════════════════════════╝`)
  console.log(``)

  try {
    const body = await request.json()
    const { evaluationId, status, results } = body

    console.log(`🏁 [API-Callback] Evaluation: ${evaluationId}`)
    console.log(`🏁 [API-Callback] Status: ${status}`)
    console.log(`🏁 [API-Callback] Results: ${results?.length || 0} agents`)
    console.log(`🏁 [API-Callback] Full payload:`, JSON.stringify(body, null, 2))

    // Import and call the finalizer!
    console.log(`🏁 [API-Callback] Importing EvaluationFinalizer...`)
    const { EvaluationFinalizer } = await import('@/lib/adi/evaluation-finalizer')
    const finalizer = new EvaluationFinalizer()
    
    console.log(`🏁 [API-Callback] Calling checkAndFinalizeEvaluation...`)
    const wasFinalized = await finalizer.checkAndFinalizeEvaluation(evaluationId)
    console.log(`✅ [API-Callback] Finalization result: ${wasFinalized}`)

    return NextResponse.json({
      success: true,
      message: 'Callback processed and finalization triggered',
      evaluationId,
      wasFinalized
    })
  } catch (error) {
    console.error(`❌ [API-Callback] Error:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * Bridge API: Get callback status
 * GET /api/bridge/callback
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'operational',
    endpoint: '/.netlify/functions/bridge-callback',
    message: 'Callback endpoint is operational'
  })
}
