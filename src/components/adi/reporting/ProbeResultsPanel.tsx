'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle2, XCircle, Clock, Brain, Search, ShoppingCart, MessageSquare, Globe, Zap } from 'lucide-react'

interface ProbeResult {
  testName: string
  status: 'passed' | 'failed' | 'partial'
  score?: number
  confidence?: number
  details: string
  response?: string
  citations?: string[]
}

interface AgentResult {
  agentName: string
  executionTime: number
  status: string
  results: ProbeResult[]
  metadata: {
    testsRun?: number
    brandName?: string
    apiProvider?: string
    placeholder?: boolean
    timestamp?: string
  }
}

interface ProbeResultsPanelProps {
  agentResults: AgentResult[]
  brandName?: string
}

const getAgentIcon = (agentName: string) => {
  switch (agentName) {
    case 'llm_test_agent':
      return <Brain className="h-5 w-5" />
    case 'citation_agent':
      return <Search className="h-5 w-5" />
    case 'commerce_agent':
      return <ShoppingCart className="h-5 w-5" />
    case 'sentiment_agent':
      return <MessageSquare className="h-5 w-5" />
    case 'geo_visibility_agent':
      return <Globe className="h-5 w-5" />
    case 'crawl_agent':
      return <Zap className="h-5 w-5" />
    default:
      return <CheckCircle2 className="h-5 w-5" />
  }
}

const getAgentDisplayName = (agentName: string) => {
  const names: Record<string, string> = {
    'llm_test_agent': 'LLM Brand Recognition Test',
    'citation_agent': 'Citation & Search Presence',
    'commerce_agent': 'E-Commerce Signals',
    'sentiment_agent': 'Brand Sentiment Analysis',
    'geo_visibility_agent': 'Geographic Visibility',
    'crawl_agent': 'Technical Infrastructure'
  }
  return names[agentName] || agentName
}

const getAgentDescription = (agentName: string) => {
  const descriptions: Record<string, string> = {
    'llm_test_agent': 'Tests how well GPT-4 and other LLMs recognize and describe your brand',
    'citation_agent': 'Verifies your brand appears in search results and LLM citations',
    'commerce_agent': 'Analyzes e-commerce intent and purchase signal strength',
    'sentiment_agent': 'Measures brand perception and sentiment in AI responses',
    'geo_visibility_agent': 'Tests brand recognition across different geographic regions',
    'crawl_agent': 'Validates website structure, schema.org markup, and technical SEO'
  }
  return descriptions[agentName] || 'Agent test results'
}

export function ProbeResultsPanel({ agentResults, brandName }: ProbeResultsPanelProps) {
  if (!agentResults || agentResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Probe Results</CardTitle>
          <CardDescription>No probe data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Probe results will appear here once the evaluation completes.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate summary statistics
  const totalProbes = agentResults.reduce((sum, agent) => sum + (agent.results?.length || 0), 0)
  const totalExecutionTime = agentResults.reduce((sum, agent) => sum + agent.executionTime, 0)
  const realAgents = agentResults.filter(a => a.metadata?.placeholder === false).length
  const placeholderAgents = agentResults.filter(a => a.metadata?.placeholder === true).length

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">{agentResults.length}</div>
              <div className="text-sm text-gray-600">Agents Run</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalProbes}</div>
              <div className="text-sm text-gray-600">Total Probes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{(totalExecutionTime / 1000).toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{realAgents}</div>
              <div className="text-sm text-gray-600">Real LLM Tests</div>
              {placeholderAgents > 0 && (
                <div className="text-xs text-gray-400 mt-1">{placeholderAgents} synthetic</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Detailed Probe Results
          </CardTitle>
          <CardDescription>
            View individual test results from each agent execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {agentResults.map((agent, index) => (
              <AccordionItem key={index} value={`agent-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-brand-600">
                        {getAgentIcon(agent.agentName)}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{getAgentDisplayName(agent.agentName)}</div>
                        <div className="text-xs text-gray-500">{getAgentDescription(agent.agentName)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {agent.metadata?.placeholder === false && (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                          <Brain className="h-3 w-3 mr-1" />
                          Real LLM
                        </Badge>
                      )}
                      {agent.metadata?.apiProvider && (
                        <Badge variant="outline" className="text-xs">
                          {agent.metadata.apiProvider}
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {(agent.executionTime / 1000).toFixed(2)}s
                      </div>
                      <Badge variant="secondary">
                        {agent.results?.length || 0} tests
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Agent Metadata */}
                    {agent.metadata && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Agent Metadata</h4>
                        <div className="grid md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="font-medium">Brand:</span> {agent.metadata.brandName || brandName || 'Unknown'}
                          </div>
                          <div>
                            <span className="font-medium">Tests Run:</span> {agent.metadata.testsRun || agent.results?.length || 0}
                          </div>
                          <div>
                            <span className="font-medium">Timestamp:</span> {agent.metadata.timestamp ? new Date(agent.metadata.timestamp).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Probe Results */}
                    {agent.results && agent.results.length > 0 ? (
                      <div className="space-y-3">
                        {agent.results.map((probe: any, probeIndex: number) => (
                          <div key={probeIndex} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {probe.passed || probe.status === 'passed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                  <h5 className="font-semibold text-sm">
                                    {probe.testName || probe.name || `Test ${probeIndex + 1}`}
                                  </h5>
                                  {probe.category && (
                                    <p className="text-xs text-gray-500">{probe.category}</p>
                                  )}
                                </div>
                              </div>
                              {probe.score !== undefined && (
                                <Badge variant={probe.score >= 70 ? 'default' : probe.score >= 40 ? 'secondary' : 'destructive'}>
                                  {probe.score}/100
                                </Badge>
                              )}
                            </div>

                            {probe.result && (
                              <div className="bg-blue-50 rounded p-3 mb-2">
                                <p className="text-xs font-medium text-blue-800 mb-1">Result:</p>
                                <p className="text-sm text-gray-700">{probe.result}</p>
                              </div>
                            )}

                            {probe.response && (
                              <div className="bg-green-50 rounded p-3 mb-2">
                                <p className="text-xs font-medium text-green-800 mb-1">LLM Response:</p>
                                <p className="text-sm text-gray-700">{probe.response}</p>
                              </div>
                            )}

                            {probe.details && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Details:</span> {probe.details}
                              </div>
                            )}

                            {probe.citations && probe.citations.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Citations:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {probe.citations.map((citation: string, i: number) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-blue-500 mr-1">•</span>
                                      {citation}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {probe.confidence !== undefined && (
                              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                <span>Confidence:</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${probe.confidence}%` }}
                                  />
                                </div>
                                <span>{probe.confidence}%</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No detailed probe results available
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Technical Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">About Real LLM Tests</p>
              <p>
                Tests marked with "Real LLM" make actual API calls to GPT-4 and other frontier models
                to evaluate how they perceive and recommend your brand. Execution times vary based on
                model response times and complexity of the analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

