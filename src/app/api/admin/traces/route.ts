import { NextRequest, NextResponse } from 'next/server'
import { traceLogger, EvaluationTrace, AgentTrace } from '@/lib/adi/trace-logger'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'store_trace':
        // Store a complete evaluation trace
        const { evaluationTrace } = data as { evaluationTrace: EvaluationTrace }
        // In production, this would be stored in a database
        // For now, the trace logger handles in-memory storage
        return NextResponse.json({ success: true, traceId: evaluationTrace.evaluationId })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error handling trace request:', error)
    return NextResponse.json(
      { error: 'Failed to handle trace request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const evaluationId = searchParams.get('evaluationId')
    const agentName = searchParams.get('agentName')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    switch (type) {
      case 'evaluation':
        if (!evaluationId) {
          return NextResponse.json(
            { error: 'evaluationId required for evaluation traces' },
            { status: 400 }
          )
        }
        const evaluationTrace = traceLogger.getEvaluationTrace(evaluationId)
        return NextResponse.json({ trace: evaluationTrace })
      
      case 'agent':
        if (!agentName) {
          return NextResponse.json(
            { error: 'agentName required for agent traces' },
            { status: 400 }
          )
        }
        const agentTraces = traceLogger.getAgentTraces(agentName, limit)
        return NextResponse.json({ traces: agentTraces })
      
      case 'all':
        const allTraces = traceLogger.getAllTraces(limit)
        return NextResponse.json({ traces: allTraces })
      
      case 'analytics':
        const analytics = traceLogger.getTraceAnalytics()
        return NextResponse.json({ analytics })
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use: evaluation, agent, all, or analytics' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching traces:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traces' },
      { status: 500 }
    )
  }
}