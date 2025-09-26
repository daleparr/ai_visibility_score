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
  Sparkles
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

export function EnhancedProgressDisplay({ tier, url }: EnhancedProgressDisplayProps) {
  const [agents, setAgents] = useState<Agent[]>(AGENTS)
  const [currentPhase, setCurrentPhase] = useState<'phase1' | 'phase2' | 'aggregation'>('phase1')
  const [overallProgress, setOverallProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Simulate agent progression
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Simulate realistic agent progression based on logs
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      // Phase 1: Parallel agents (crawl, citation, brand_heritage)
      setCurrentPhase('phase1')
      updateAgentStatus(['crawl_agent', 'citation_agent', 'brand_heritage_agent'], 'running')
      
      setTimeout(() => {
        updateAgentStatus(['crawl_agent', 'citation_agent', 'brand_heritage_agent'], 'completed')
        
        // Phase 2: Remaining agents in parallel
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
          
          // Final aggregation
          setCurrentPhase('aggregation')
          updateAgentStatus(['score_aggregator'], 'running')
          
          setTimeout(() => {
            updateAgentStatus(['score_aggregator'], 'completed')
            setOverallProgress(100)
          }, 3000)
        }, 12000)
      }, 25000)
    }, 2000)

    return () => clearTimeout(progressTimer)
  }, [])

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
                background: `conic-gradient(from 0deg, transparent, transparent ${overallProgress * 3.6}deg, #e5e7eb ${overallProgress * 3.6}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-600">
                  {Math.round((completedAgents / totalAgents) * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">Analyzing {safeHostname(url) || 'website'}</h2>
          <p className="text-gray-600">{getTierDescription()}</p>
          <Badge variant="outline" className="mt-2">
            Phase {currentPhase === 'phase1' ? '1' : currentPhase === 'phase2' ? '2' : '3'} of 3
          </Badge>
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
          <Progress value={(completedAgents / totalAgents) * 100} className="h-2" />
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

      {/* Current Activity */}
      {runningAgents.length > 0 && (
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
