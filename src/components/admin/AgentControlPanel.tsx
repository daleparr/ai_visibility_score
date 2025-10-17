'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Cpu,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Zap,
  TrendingUp
} from 'lucide-react';

interface AIModel {
  id: string;
  model_key: string;
  model_name: string;
  model_provider: string;
  model_version: string;
  is_active: boolean;
  available_for_tiers: string[];
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  estimated_cost_per_evaluation: number;
  avg_response_time_ms: number;
  success_rate: number;
}

interface Agent {
  id: string;
  agent_key: string;
  agent_name: string;
  agent_category: string;
  is_active: boolean;
  is_required: boolean;
  execution_order: number;
  primary_model_key: string;
  uses_llm: boolean;
  avg_cost_per_run: number;
  avg_execution_time_ms: number;
  success_rate: number;
}

interface CostStats {
  today_spend: number;
  month_spend: number;
  daily_budget: number;
  monthly_budget: number;
  by_model: any[];
  by_agent: any[];
}

export function AgentControlPanel() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [costStats, setCostStats] = useState<CostStats | null>(null);
  const [view, setView] = useState<'models' | 'agents' | 'costs'>('models');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Refresh cost stats every 30 seconds
    const interval = setInterval(loadCostStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [modelsRes, agentsRes, costsRes] = await Promise.all([
        fetch('/api/admin/ai-models'),
        fetch('/api/admin/agents'),
        fetch('/api/admin/costs/stats')
      ]);
      const modelsData = await modelsRes.json();
      const agentsData = await agentsRes.json();
      const costsData = await costsRes.json();
      
      setModels(modelsData.models || []);
      setAgents(agentsData.agents || []);
      setCostStats(costsData.stats || null);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCostStats = async () => {
    try {
      const response = await fetch('/api/admin/costs/stats');
      const data = await response.json();
      setCostStats(data.stats || null);
    } catch (error) {
      console.error('Failed to load cost stats:', error);
    }
  };

  const toggleModel = async (modelId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/ai-models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle model:', error);
    }
  };

  const toggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const changeAgentModel = async (agentId: string, modelKey: string) => {
    try {
      await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primary_model_key: modelKey })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to change agent model:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading agent control panel...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Cost Summary */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent & Model Control</h2>
          <p className="text-gray-600 mt-1">Manage AI models, agents, and cost controls</p>
        </div>
        
        {costStats && (
          <div className="bg-white rounded-lg border p-4 min-w-[300px]">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Cost Overview</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Today:</span>
                <span className="font-semibold">${Number(costStats.today_spend || 0).toFixed(2)} / ${costStats.daily_budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month:</span>
                <span className="font-semibold">${Number(costStats.month_spend || 0).toFixed(2)} / ${costStats.monthly_budget}</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${Math.min((costStats.month_spend / costStats.monthly_budget) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((costStats.month_spend / costStats.monthly_budget) * 100).toFixed(1)}% of monthly budget
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Selector */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={view === 'models' ? 'default' : 'outline'}
          onClick={() => setView('models')}
        >
          <Cpu className="h-4 w-4 mr-1" />
          AI Models (8)
        </Button>
        <Button
          size="sm"
          variant={view === 'agents' ? 'default' : 'outline'}
          onClick={() => setView('agents')}
        >
          <Bot className="h-4 w-4 mr-1" />
          Agents (11)
        </Button>
        <Button
          size="sm"
          variant={view === 'costs' ? 'default' : 'outline'}
          onClick={() => setView('costs')}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Cost Tracking
        </Button>
      </div>

      {/* Models View */}
      {view === 'models' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">AI Model Configurations</h3>
            <div className="text-sm text-gray-600">
              {models.filter(m => m.is_active).length} of {models.length} models active
            </div>
          </div>

          {models.map((model) => (
            <div key={model.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{model.model_name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {model.model_provider}
                    </Badge>
                    {model.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    Version: <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{model.model_version}</code>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Cost/Eval</div>
                      <div className="font-semibold text-blue-600">
                        ${Number(model.estimated_cost_per_evaluation || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Input/1K</div>
                      <div className="font-semibold">
                        ${Number(model.cost_per_1k_input_tokens || 0).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Output/1K</div>
                      <div className="font-semibold">
                        ${Number(model.cost_per_1k_output_tokens || 0).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Available For</div>
                      <div className="font-semibold text-xs">
                        {model.available_for_tiers.join(', ')}
                      </div>
                    </div>
                  </div>

                  {model.avg_response_time_ms && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                      <span>⚡ {model.avg_response_time_ms}ms avg response</span>
                      {model.success_rate && (
                        <span>✅ {model.success_rate}% success rate</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Active</Label>
                  <Switch
                    checked={model.is_active}
                    onCheckedChange={(checked) => toggleModel(model.id, checked)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agents View */}
      {view === 'agents' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">AIDI Agent Configurations</h3>
            <div className="text-sm text-gray-600">
              {agents.filter(a => a.is_active).length} of {agents.length} agents active
            </div>
          </div>

          {/* Group by category */}
          {['infrastructure', 'perception', 'commerce'].map((category) => (
            <div key={category}>
              <h4 className="font-semibold text-sm text-gray-700 mb-2 mt-4 uppercase">
                {category} Agents
              </h4>
              {agents
                .filter(a => a.agent_category === category)
                .sort((a, b) => (a.execution_order || 0) - (b.execution_order || 0))
                .map((agent) => (
                  <div key={agent.id} className="bg-white rounded-lg border p-4 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="font-semibold">{agent.agent_name}</h5>
                          {agent.is_required ? (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Optional
                            </Badge>
                          )}
                          {agent.uses_llm && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              Uses LLM
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          {agent.uses_llm && agent.primary_model_key && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Model:</span>
                              <select
                                value={agent.primary_model_key}
                                onChange={(e) => changeAgentModel(agent.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                                disabled={!agent.is_active}
                              >
                                {models.filter(m => m.is_active).map((m) => (
                                  <option key={m.model_key} value={m.model_key}>
                                    {m.model_name} (${Number(m.estimated_cost_per_evaluation || 0).toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {agent.avg_cost_per_run > 0 && (
                            <span className="text-xs">
                              💰 ${Number(agent.avg_cost_per_run || 0).toFixed(4)}/run
                            </span>
                          )}
                          {agent.avg_execution_time_ms > 0 && (
                            <span className="text-xs">
                              ⚡ {agent.avg_execution_time_ms}ms
                            </span>
                          )}
                          {agent.success_rate > 0 && (
                            <span className="text-xs">
                              ✅ {Number(agent.success_rate || 0).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">
                          {agent.is_active ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          checked={agent.is_active}
                          onCheckedChange={(checked) => toggleAgent(agent.id, checked)}
                          disabled={agent.is_required}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-900 mb-1">Cost Optimization Tip:</div>
                <div className="text-yellow-800">
                  Disable optional agents to reduce evaluation costs. Required agents (Crawl, Schema, LLM Test, Score Aggregator) cannot be disabled.
                  Disabling expensive LLM-based agents can reduce cost from $0.45 to $0.15 per evaluation.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Tracking View */}
      {view === 'costs' && costStats && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Real-Time Cost Tracking</h3>

          {/* Budget Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold mb-4">Daily Budget</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${Number(costStats.today_spend || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                of ${costStats.daily_budget} limit
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (Number(costStats.today_spend || 0) / Number(costStats.daily_budget || 1)) > 0.8 ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min((Number(costStats.today_spend || 0) / Number(costStats.daily_budget || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold mb-4">Monthly Budget</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${Number(costStats.month_spend || 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                of ${costStats.monthly_budget} limit
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    (Number(costStats.month_spend || 0) / Number(costStats.monthly_budget || 1)) > 0.85 ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min((Number(costStats.month_spend || 0) / Number(costStats.monthly_budget || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cost by Model */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-semibold mb-4">Cost by AI Model (This Month)</h4>
            <div className="space-y-3">
              {costStats.by_model?.map((model: any) => (
                <div key={model.model_key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="font-medium">{model.model_name}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${(model.total_cost / costStats.month_spend) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold w-24 text-right">
                    ${Number(model.total_cost || 0).toFixed(2)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({((Number(model.total_cost || 0) / Number(costStats.month_spend || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost by Agent */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="font-semibold mb-4">Cost by Agent (This Month)</h4>
            <div className="space-y-2 text-sm">
              {costStats.by_agent?.map((agent: any) => (
                <div key={agent.agent_key} className="flex justify-between">
                  <span>{agent.agent_name}</span>
                  <span className="font-semibold">${Number(agent.total_cost || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

