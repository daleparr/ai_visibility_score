'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Search, 
  Globe, 
  Zap, 
  Database, 
  MessageSquare, 
  MapPin, 
  Heart, 
  Building, 
  ShoppingCart,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Target
} from 'lucide-react'
import { safeHostname } from '@/lib/url'

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  estimatedTime: number
  status: 'pending' | 'running' | 'completed'
  progress?: number
}

interface EnhancedProgressDisplayProps {
  tier: 'free' | 'index-pro' | 'enterprise'
  url: string
  evaluationId?: string // Add evaluation ID for real status polling
}

const AGENTS: Agent[] = [
  {
    id: 'crawl_agent',
    name: 'Web Crawler',
    description: 'Analyzing website structure and content',
    icon: <Globe className="h-5 w-5" />,
    estimatedTime: 15,
    status: 'pending'
  },
  {
    id: 'llm_test_agent',
    name: 'AI Probe Tests',
    description: 'Running LLM discovery simulations',
    icon: <Brain className="h-5 w-5" />,
    estimatedTime: 20,
    status: 'pending'
  },
  {
    id: 'schema_agent',
    name: 'Schema Analysis',
    description: 'Evaluating structured data markup',
    icon: <Database className="h-5 w-5" />,
    estimatedTime: 10,
    status: 'pending'
  },
  {
    id: 'semantic_agent',
    name: 'Semantic Clarity',
    description: 'Assessing content understanding',
    icon: <MessageSquare className="h-5 w-5" />,
    estimatedTime: 12,
    status: 'pending'
  },
  {
    id: 'citation_agent',
    name: 'Citation Strength',
    description: 'Analyzing brand mentions and authority',
    icon: <Search className="h-5 w-5" />,
    estimatedTime: 18,
    status: 'pending'
  },
  {
    id: 'geo_visibility_agent',
    name: 'Geographic Reach',
    description: 'Mapping location-based visibility',
    icon: <MapPin className="h-5 w-5" />,
    estimatedTime: 8,
    status: 'pending'
  },
  {
    id: 'sentiment_agent',
    name: 'Brand Sentiment',
    description: 'Evaluating emotional associations',
    icon: <Heart className="h-5 w-5" />,
    estimatedTime: 14,
    status: 'pending'
  },
  {
    id: 'brand_heritage_agent',
    name: 'Brand Heritage',
    description: 'Analyzing historical context and legacy',
    icon: <Building className="h-5 w-5" />,
    estimatedTime: 16,
    status: 'pending'
  },
  {
    id: 'commerce_agent',
    name: 'Commerce Signals',
    description: 'Assessing purchase intent indicators',
    icon: <ShoppingCart className="h-5 w-5" />,
    estimatedTime: 11,
    status: 'pending'
  },
  {
    id: 'score_aggregator',
    name: 'Score Synthesis',
    description: 'Calculating final ADI score',
    icon: <BarChart3 className="h-5 w-5" />,
    estimatedTime: 5,
    status: 'pending'
  }
]

export function EnhancedProgressDisplay({ tier, url, evaluationId }: EnhancedProgressDisplayProps) {
  const [agents, setAgents] = useState<Agent[]>(AGENTS)
  const [currentPhase, setCurrentPhase] = useState<'phase1' | 'phase2' | 'aggregation' | 'finalizing'>('phase1')
  const [displayProgress, setDisplayProgress] = useState(5) // What user sees - always increases
  const [targetProgress, setTargetProgress] = useState(5) // Target from server - can fluctuate
  const [elapsedTime, setElapsedTime] = useState(0)
  const [evaluationStatus, setEvaluationStatus] = useState<'running' | 'finalizing' | 'completed' | 'failed'>('running')
  const [allAgentsCompleted, setAllAgentsCompleted] = useState(false)
  
  // Benchmark form state
  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [selectedSector, setSelectedSector] = useState('')
  const [competitor, setCompetitor] = useState('')
  const [benchmarkSaved, setBenchmarkSaved] = useState(false)

  // Smooth progress animation - displayProgress always increases toward targetProgress
  useEffect(() => {
    const smoothingInterval = setInterval(() => {
      setDisplayProgress(prev => {
        // Always move toward target, never backward
        if (prev < targetProgress) {
          // Smooth increment - move 1-2% at a time
          const increment = Math.min(2, targetProgress - prev)
          return Math.min(prev + increment, targetProgress)
        }
        return prev // Already at or past target
      })
    }, 150) // Update every 150ms for smooth animation

    return () => clearInterval(smoothingInterval)
  }, [targetProgress])

  // Elapsed time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  
  // Show benchmark form after 10 seconds (fills dead time)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBenchmarkForm(true)
    }, 10000) // 10 seconds
    return () => clearTimeout(timer)
  }, [])
  
  // Load sectors for benchmark form
  useEffect(() => {
    fetch('/api/industry-reports/sectors')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.sectors) {
          setSectors(data.sectors)
        }
      })
      .catch(err => console.error('Failed to load sectors:', err))
  }, [])
  
  // Save benchmark data
  async function handleSaveBenchmark() {
    if (!selectedSector || !evaluationId) return
    
    try {
      await fetch('/api/evaluations/set-sector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          sectorId: selectedSector,
          competitors: competitor ? [competitor] : [],
          brandDomain: url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0],
        }),
      })
      setBenchmarkSaved(true)
      setTimeout(() => setShowBenchmarkForm(false), 2000) // Hide after 2s with success message
    } catch (err) {
      console.error('Failed to save benchmark:', err)
    }
  }

  // Minimum progress guarantee - always trickle forward even without server updates
  useEffect(() => {
    if (evaluationStatus === 'running' && displayProgress < 90) {
      const trickleTimer = setInterval(() => {
        setTargetProgress(prev => {
          // Slowly increase target even without server updates
          // This ensures progress never stalls completely
          if (prev < 20) return prev + 0.5  // Slower initial crawl
          if (prev < 60) return prev + 0.3  // Medium pace during agent execution
          if (prev < 85) return prev + 0.2  // Slower near the end
          return prev // Stop trickling near 90%
        })
      }, 2000) // Update every 2 seconds

      return () => clearInterval(trickleTimer)
    }
  }, [evaluationStatus, displayProgress])

  // Real evaluation status polling - REPLACES SIMULATION
  useEffect(() => {
    if (!evaluationId) {
      // Fallback to simulation if no evaluation ID provided
      const progressTimer = setTimeout(() => {
        setCurrentPhase('phase1')
        updateAgentStatus(['crawl_agent', 'citation_agent', 'brand_heritage_agent'], 'running')
        
        setTimeout(() => {
          updateAgentStatus(['crawl_agent', 'citation_agent', 'brand_heritage_agent'], 'completed')
          setCurrentPhase('phase2')
          updateAgentStatus([
            'llm_test_agent', 'schema_agent', 'semantic_agent', 
            'geo_visibility_agent', 'sentiment_agent', 'commerce_agent'
          ], 'running')
          
          setTimeout(() => {
            updateAgentStatus([
              'llm_test_agent', 'schema_agent', 'semantic_agent', 
              'geo_visibility_agent', 'sentiment_agent', 'commerce_agent'
            ], 'completed')
            setCurrentPhase('aggregation')
            updateAgentStatus(['score_aggregator'], 'running')
            
            setTimeout(() => {
              updateAgentStatus(['score_aggregator'], 'completed')
              setTargetProgress(100)
              setEvaluationStatus('completed')
            }, 3000)
          }, 12000)
        }, 25000)
      }, 2000)
      return () => clearTimeout(progressTimer)
    }

    // Show initial progress to avoid sitting at 0%
    setCurrentPhase('phase1')
    console.log('🚀 Starting real-time evaluation progress tracking...')

    // INTELLIGENT STATUS POLLING - Shows Railway bridge + agent details
    const pollEvaluationStatus = async () => {
      try {
        const response = await fetch(`/api/evaluation/${evaluationId}/intelligent-status`)
        if (response.ok) {
          const data = await response.json()
          
          console.log('🔍 [Progress] Intelligent status:', {
            overallStatus: data.overallStatus,
            totalAgents: data.progress?.totalAgents,
            completed: data.progress?.completedAgents,
            running: data.progress?.runningAgents,
            failed: data.progress?.failedAgents
          })
          
          if (data.overallStatus === 'completed') {
            // REAL COMPLETION - all agents finished and finalized
            setEvaluationStatus('completed')
            setTargetProgress(100)
            updateAgentStatus(AGENTS.map(a => a.id), 'completed')
            setCurrentPhase('finalizing')
            setAllAgentsCompleted(false) // Reset for next run
            console.log(`✅ Intelligent evaluation completed: ${data.progress?.completedAgents}/${data.progress?.totalAgents} agents`)
            return true // Stop polling
          } else if (data.overallStatus === 'failed') {
            setEvaluationStatus('failed')
            console.log(`❌ Intelligent evaluation failed: ${data.progress?.failedAgents} agents failed`)
            return true // Stop polling
          } else {
            // Still running - show real progress from agent details
            const totalAgents = data.progress?.totalAgents || 12
            const completedAgents = data.progress?.completedAgents || 0
            const runningAgents = data.progress?.runningAgents || 0
            
            // Check if all agents are done but evaluation isn't complete yet (finalizing)
            if (completedAgents === totalAgents && runningAgents === 0 && !allAgentsCompleted) {
              console.log('🏁 All agents completed, entering finalization phase...')
              setAllAgentsCompleted(true)
              setCurrentPhase('finalizing')
              setEvaluationStatus('finalizing')
              setTargetProgress(95) // Set target to 95%, smooth animation will catch up
              updateAgentStatus(AGENTS.map(a => a.id), 'completed')
              
              return false // Continue polling until status changes to 'completed'
            }
            
            // Calculate raw progress from server (0-90% range during agent execution)
            const rawProgress = Math.round((completedAgents / totalAgents) * 90)
            
            // Only update target if it's HIGHER than current target (never go backward)
            setTargetProgress(prev => Math.max(prev, rawProgress))
            
            // Update individual agent statuses from actual agent details
            if (data.agentDetails && Array.isArray(data.agentDetails)) {
              data.agentDetails.forEach((agentDetail: any) => {
                const status = agentDetail.status === 'pending' ? 'pending' :
                               agentDetail.status === 'running' ? 'running' :
                               agentDetail.status === 'completed' ? 'completed' : 'pending'
                
                updateAgentStatus([agentDetail.agentName], status as any)
                
                // Log Railway vs Netlify execution
                if (agentDetail.status === 'running' || agentDetail.status === 'completed') {
                  const isSlowAgent = ['crawl_agent', 'llm_test_agent', 'citation_agent', 'sentiment_agent', 'commerce_agent', 'geo_visibility_agent'].includes(agentDetail.agentName)
                  console.log(`🔍 [Agent] ${agentDetail.agentName}: ${agentDetail.status} (${isSlowAgent ? 'Railway 🛤️' : 'Netlify ⚡'})`)
                }
              })
            }
            
            // Set phase based on target progress
            if (targetProgress < 30) {
              setCurrentPhase('phase1')
            } else if (targetProgress < 80) {
              setCurrentPhase('phase2')
            } else {
              setCurrentPhase('aggregation')
            }
            
            // Show Railway bridge metrics if available
            if (data.performance?.slowAgentsInProgress > 0) {
              console.log(`🛤️  [Railway] ${data.performance.slowAgentsInProgress} agents processing in background`)
            }
            
            console.log(`🔄 Intelligent evaluation: ${Math.round(displayProgress)}% complete (${completedAgents}/${totalAgents} agents)`)
            return false // Continue polling
          }
        }
      } catch (error) {
        console.error('Failed to poll evaluation status:', error)
        return false // Continue polling on error
      }
      return false
    }

    // Start polling immediately, then every 3 seconds
    const pollInterval = setInterval(async () => {
      const shouldStop = await pollEvaluationStatus()
      if (shouldStop) {
        clearInterval(pollInterval)
      }
    }, 3000)

    // Initial poll
    pollEvaluationStatus()

    return () => clearInterval(pollInterval)
  }, [evaluationId, tier, elapsedTime])

  const updateAgentStatus = (agentIds: string[], status: Agent['status']) => {
    setAgents(prev => prev.map(agent => 
      agentIds.includes(agent.id) ? { ...agent, status } : agent
    ))
  }

  const completedAgents = agents.filter(a => a.status === 'completed').length
  const runningAgents = agents.filter(a => a.status === 'running')
  const totalAgents = agents.length

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTierDescription = () => {
    switch (tier) {
      case 'free':
        return 'Free analysis with GPT-3.5 Turbo'
      case 'index-pro':
        return 'GPT-4 + Perplexity AI analysis'
      case 'enterprise':
        return 'Multi-model enterprise analysis'
      default:
        return 'AI analysis'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with animated progress */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-gray-200"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div 
              className="w-24 h-24 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"
              style={{ 
                animationDuration: '2s',
                background: `conic-gradient(from 0deg, transparent, transparent ${displayProgress * 3.6}deg, #e5e7eb ${displayProgress * 3.6}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">
                  {Math.round(displayProgress)}%
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">
            {evaluationStatus === 'completed' ? 'Analysis Complete!' : 
             evaluationStatus === 'finalizing' ? 'Finalizing Your Score...' :
             `Analyzing ${safeHostname(url) || 'website'}`}
          </h2>
          <p className="text-gray-600">
            {evaluationStatus === 'finalizing' 
              ? 'Calculating dimension scores and generating insights...'
              : getTierDescription()}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              Phase {currentPhase === 'phase1' ? '1' : 
                     currentPhase === 'phase2' ? '2' : 
                     currentPhase === 'aggregation' ? '3' : 
                     '4 (Final)'} of 4
            </Badge>
            {evaluationStatus === 'completed' && (
              <Badge variant="default" className="bg-green-600">
                ✅ Score Available
              </Badge>
            )}
            {evaluationStatus === 'finalizing' && (
              <Badge variant="secondary" className="bg-purple-600 text-white animate-pulse">
                🧮 Calculating Scores
              </Badge>
            )}
            {evaluationStatus === 'running' && evaluationId && (
              <Badge variant="secondary" className="animate-pulse">
                🔄 Real-time Analysis
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {completedAgents} of {totalAgents} agents completed
            </span>
          </div>
          <Progress value={displayProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id} 
            className={`transition-all duration-500 ${
              agent.status === 'running' 
                ? 'ring-2 ring-brand-500 shadow-lg scale-105' 
                : agent.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : 'opacity-60'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  agent.status === 'completed' 
                    ? 'bg-green-100 text-green-600'
                    : agent.status === 'running'
                    ? 'bg-brand-100 text-brand-600 animate-pulse'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {agent.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : agent.status === 'running' ? (
                    <div className="relative">
                      {agent.icon}
                      <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-ping" />
                    </div>
                  ) : (
                    agent.icon
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                    {agent.status === 'running' && (
                      <Clock className="h-4 w-4 text-brand-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                  
                  {agent.status === 'running' && (
                    <div className="mt-2">
                      <Progress value={75} className="h-1" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge 
                      variant={
                        agent.status === 'completed' ? 'default' :
                        agent.status === 'running' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {agent.status === 'completed' ? 'Complete' :
                       agent.status === 'running' ? 'Running' : 'Queued'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      ~{agent.estimatedTime}s
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benchmark Form - Appears after 10s during analysis */}
      {showBenchmarkForm && !benchmarkSaved && displayProgress < 80 && evaluationStatus === 'running' && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  While we analyze, help us benchmark you
                </h3>
                <p className="text-sm text-blue-700">
                  Optional - unlocks competitive ranking in your results
                </p>
              </div>
              <button 
                onClick={() => setShowBenchmarkForm(false)}
                className="text-blue-400 hover:text-blue-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Your industry:
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select industry...</option>
                  {sectors.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Main competitor (optional):
                </label>
                <input
                  type="text"
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  placeholder="e.g., nike.com"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                See your rank vs competitors • Get targeted recommendations
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBenchmarkForm(false)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveBenchmark}
                  disabled={!selectedSector}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Save & Continue
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Success message after saving */}
      {benchmarkSaved && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Benchmark info saved! We'll show competitive context in your results.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Activity */}
      {runningAgents.length > 0 && evaluationStatus !== 'finalizing' && (
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-brand-700">Currently Running</span>
            </div>
            <div className="space-y-1">
              {runningAgents.map(agent => (
                <div key={agent.id} className="text-sm text-brand-600">
                  • {agent.name}: {agent.description}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finalization Phase */}
      {evaluationStatus === 'finalizing' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-purple-700">Finalizing Results</span>
            </div>
            <div className="space-y-1 text-sm text-purple-600">
              <div>• Aggregating {completedAgents} agent results</div>
              <div>• Calculating dimension scores</div>
              <div>• Generating personalized insights</div>
              <div className="mt-2 text-xs text-purple-500 italic">Almost there...</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier-specific enhancements */}
      {tier !== 'free' && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-700">
                {tier === 'index-pro' ? 'Index Pro' : 'Enterprise'} Enhancements
              </span>
            </div>
            <div className="text-sm text-purple-600 space-y-1">
              {tier === 'index-pro' && (
                <>
                  <div>• GPT-4 powered analysis for deeper insights</div>
                  <div>• Real-time web search with Perplexity AI</div>
                  <div>• Enhanced citation and reputation analysis</div>
                </>
              )}
              {tier === 'enterprise' && (
                <>
                  <div>• Multi-model analysis (GPT-4, Claude, Mistral)</div>
                  <div>• Advanced competitive intelligence</div>
                  <div>• Custom industry benchmarking</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
