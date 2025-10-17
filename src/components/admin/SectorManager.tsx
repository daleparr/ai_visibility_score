'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Unlock,
  BarChart3,
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';

interface Sector {
  id: string;
  sector_slug: string;
  sector_name: string;
  sector_description: string;
  is_available: boolean;
  has_content: boolean;
  brand_count: number;
  monthly_price: number;
  annual_price: number;
  badge_text?: string;
  demo_cta_text: string;
  demo_cta_url: string;
}

interface Bundle {
  id: string;
  bundle_key: string;
  bundle_name: string;
  sector_count?: number;
  monthly_price: number;
  annual_price: number;
  price_per_sector: number;
  badge_text?: string;
  value_proposition: string;
  is_active: boolean;
}

export function SectorManager() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/sectors');
      const data = await response.json();
      setSectors(data.sectors || []);
      setBundles(data.bundles || []);
    } catch (error) {
      console.error('Failed to load sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSectorAvailability = async (sectorId: string, isAvailable: boolean) => {
    try {
      await fetch(`/api/admin/sectors/${sectorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle sector:', error);
    }
  };

  const updateSectorPricing = async (sectorId: string, pricing: any) => {
    try {
      await fetch(`/api/admin/sectors/${sectorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      });
      await loadData();
      setEditingSector(null);
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sectors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Industry Report Sector Management</h2>
        <p className="text-gray-600 mt-1">Lock/unlock sectors and manage pricing per sector or bundle</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {sectors.filter(s => s.is_available).length}
          </div>
          <div className="text-sm text-gray-600">Available Sectors</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-orange-600">
            {sectors.filter(s => !s.is_available).length}
          </div>
          <div className="text-sm text-gray-600">Locked Sectors</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {sectors.reduce((sum, s) => sum + s.brand_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Brands</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">{bundles.length}</div>
          <div className="text-sm text-gray-600">Bundle Packages</div>
        </div>
      </div>

      {/* Bundle Packages */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">Bundle Packages (Multi-Sector Deals)</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {bundles.map((bundle) => (
            <div key={bundle.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{bundle.bundle_name}</h4>
                  {bundle.badge_text && (
                    <Badge className="text-xs mt-1">{bundle.badge_text}</Badge>
                  )}
                </div>
                <Switch checked={bundle.is_active} disabled />
              </div>
              <div className="text-2xl font-bold text-blue-600 my-2">
                £{Number(bundle.monthly_price || 0).toLocaleString()}
                <span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                {bundle.sector_count && (
                  <div>Choose {bundle.sector_count} sectors</div>
                )}
                <div>£{Number(bundle.price_per_sector || 0).toFixed(2)}/sector</div>
                <div className="text-green-600 font-medium">{bundle.value_proposition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sectors List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Individual Sectors</h3>
        <div className="space-y-3">
          {sectors.map((sector) => (
            <div key={sector.id} className="bg-white rounded-lg border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{sector.sector_name}</h4>
                    {sector.is_available ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Unlock className="h-3 w-3 mr-1" />
                        AVAILABLE
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Lock className="h-3 w-3 mr-1" />
                        LOCKED
                      </Badge>
                    )}
                    {sector.badge_text && (
                      <Badge variant="outline">{sector.badge_text}</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{sector.sector_description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {sector.brand_count} brands
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      £{sector.monthly_price}/month
                    </span>
                    {!sector.is_available && (
                      <>
                        <span>•</span>
                        <span className="text-orange-600">
                          Shows: "{sector.demo_cta_text}"
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">
                      {sector.is_available ? 'Unlock' : 'Lock'}
                    </Label>
                    <Switch
                      checked={sector.is_available}
                      onCheckedChange={(checked) => toggleSectorAvailability(sector.id, checked)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSector(editingSector === sector.id ? null : sector.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Inline Editor */}
              {editingSector === sector.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Monthly Price</Label>
                    <Input
                      type="number"
                      defaultValue={sector.monthly_price}
                      onBlur={(e) => {
                        const newPrice = parseFloat(e.target.value);
                        if (newPrice !== sector.monthly_price) {
                          updateSectorPricing(sector.id, { 
                            monthly_price: newPrice,
                            annual_price: newPrice * 10 // 2 months free
                          });
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Badge Text</Label>
                    <Input
                      defaultValue={sector.badge_text || ''}
                      onBlur={(e) => {
                        updateSectorPricing(sector.id, { badge_text: e.target.value || null });
                      }}
                      placeholder="Coming Soon, Beta, Popular"
                      className="mt-1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Demo CTA Text (when locked)</Label>
                    <Input
                      defaultValue={sector.demo_cta_text}
                      onBlur={(e) => {
                        updateSectorPricing(sector.id, { demo_cta_text: e.target.value });
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Conversion Strategy</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Locked Sectors:</strong> Show "Request Demo" CTA → Capture leads → Schedule calls → Custom pricing</p>
          <p><strong>Available Sectors:</strong> Show pricing → Subscribe → Immediate access</p>
          <p><strong>Bundle Discounts:</strong> 3-pack (25% off), 5-pack (35% off), All-access (45% off) → Drive multi-sector purchases</p>
        </div>
      </div>
    </div>
  );
}

