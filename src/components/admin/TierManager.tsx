'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PricingTier {
  id: string;
  tier_key: string;
  tier_name: string;
  tier_type: 'standard' | 'custom' | 'legacy';
  price_amount: number;
  price_currency: string;
  billing_period: string;
  is_active: boolean;
  is_visible_public: boolean;
  is_custom: boolean;
  badge_text?: string;
  description?: string;
  features: TierFeature[];
}

interface TierFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  feature_category: string;
  is_included: boolean;
  feature_limit?: string;
}

export function TierManager() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tiersRes, featuresRes] = await Promise.all([
        fetch('/api/admin/tiers'),
        fetch('/api/admin/features')
      ]);
      const tiersData = await tiersRes.json();
      const featuresData = await featuresRes.json();
      setTiers(tiersData.tiers || []);
      setAvailableFeatures(featuresData.features || []);
    } catch (error) {
      console.error('Failed to load tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTierActive = async (tierId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/tiers/${tierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle tier:', error);
    }
  };

  const toggleFeature = async (tierId: string, featureId: string, isIncluded: boolean) => {
    try {
      await fetch(`/api/admin/tiers/${tierId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature_id: featureId, is_included: isIncluded })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const createCustomTier = async (tier: Partial<PricingTier>) => {
    try {
      setSaving(true);
      await fetch('/api/admin/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tier)
      });
      await loadData();
      setView('list');
    } catch (error) {
      console.error('Failed to create tier:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading tiers...</div>;
  }

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pricing Tier Management</h2>
            <p className="text-gray-600 mt-1">Manage pricing tiers, features, and custom packages</p>
          </div>
          <Button onClick={() => setView('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Tier
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{tiers.length}</div>
            <div className="text-sm text-gray-600">Total Tiers</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {tiers.filter(t => t.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">
              {tiers.filter(t => t.is_custom).length}
            </div>
            <div className="text-sm text-gray-600">Custom</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-600">
              {availableFeatures.length}
            </div>
            <div className="text-sm text-gray-600">Features</div>
          </div>
        </div>

        {/* Tiers List */}
        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{tier.tier_name}</h3>
                    {tier.badge_text && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                        {tier.badge_text}
                      </span>
                    )}
                    {tier.is_custom && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {tier.price_currency} {tier.price_amount.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{tier.billing_period}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">{tier.tier_key}</span>
                  </div>
                  
                  {tier.description && (
                    <p className="text-gray-700 text-sm">{tier.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Active</Label>
                    <Switch
                      checked={tier.is_active}
                      onCheckedChange={(checked) => toggleTierActive(tier.id, checked)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTier(tier);
                      setView('edit');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">Included Features ({tier.features?.length || 0})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {tier.features?.map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {feature.feature_name}
                        {feature.feature_limit && (
                          <span className="text-gray-500 ml-1">({feature.feature_limit})</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tiers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No pricing tiers configured</p>
            <Button className="mt-4" onClick={() => setView('create')}>
              Create First Tier
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return <TierEditor
      tier={selectedTier}
      features={availableFeatures}
      onSave={createCustomTier}
      onCancel={() => {
        setView('list');
        setSelectedTier(null);
      }}
      isSaving={saving}
    />;
  }

  return null;
}

function TierEditor({
  tier,
  features,
  onSave,
  onCancel,
  isSaving
}: {
  tier: PricingTier | null;
  features: any[];
  onSave: (tier: Partial<PricingTier>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    tier_key: tier?.tier_key || '',
    tier_name: tier?.tier_name || '',
    price_amount: tier?.price_amount || 0,
    price_currency: tier?.price_currency || 'GBP',
    billing_period: tier?.billing_period || 'one-time',
    badge_text: tier?.badge_text || '',
    description: tier?.description || '',
    is_custom: tier?.is_custom || false,
    is_visible_public: tier?.is_visible_public !== false
  });

  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(tier?.features?.map(f => f.id) || [])
  );

  const handleSubmit = () => {
    onSave({
      ...formData,
      features: Array.from(selectedFeatures)
    } as any);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {tier ? 'Edit Tier' : 'Create Custom Tier'}
        </h2>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tier Name</Label>
            <Input
              value={formData.tier_name}
              onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
              placeholder="Enterprise Pro"
            />
          </div>
          <div>
            <Label>Tier Key (URL-friendly)</Label>
            <Input
              value={formData.tier_key}
              onChange={(e) => setFormData({ ...formData, tier_key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              placeholder="enterprise-pro"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Price Amount</Label>
            <Input
              type="number"
              value={formData.price_amount}
              onChange={(e) => setFormData({ ...formData, price_amount: parseFloat(e.target.value) })}
              placeholder="2500.00"
            />
          </div>
          <div>
            <Label>Currency</Label>
            <select
              value={formData.price_currency}
              onChange={(e) => setFormData({ ...formData, price_currency: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <Label>Billing Period</Label>
            <select
              value={formData.billing_period}
              onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Comprehensive strategic assessment for enterprise brands"
            rows={3}
          />
        </div>

        {/* Badge & Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Badge Text (optional)</Label>
            <Input
              value={formData.badge_text}
              onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
              placeholder="Most Popular"
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_visible_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible_public: checked })}
              />
              <span className="text-sm">Visible on public pricing page</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_custom}
                onCheckedChange={(checked) => setFormData({ ...formData, is_custom: checked })}
              />
              <span className="text-sm">Custom tier (for specific customer)</span>
            </label>
          </div>
        </div>

        {/* Feature Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Included Features</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-4">
            {features.map((feature) => (
              <label key={feature.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFeatures.has(feature.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedFeatures);
                    if (e.target.checked) {
                      newSet.add(feature.id);
                    } else {
                      newSet.delete(feature.id);
                    }
                    setSelectedFeatures(newSet);
                  }}
                  className="rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{feature.feature_name}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </div>
                {feature.is_premium && (
                  <Star className="h-4 w-4 text-yellow-500" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSubmit} disabled={isSaving}>
            <Package className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : tier ? 'Update Tier' : 'Create Tier'}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

