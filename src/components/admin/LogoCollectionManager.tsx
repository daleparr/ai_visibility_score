'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Plus,
  X,
  Eye,
  Save,
  Info
} from 'lucide-react';

interface Logo {
  id: string;
  logo_name: string;
  logo_slug: string;
  file_url: string;
  is_active: boolean;
}

interface Collection {
  id: string;
  collection_key: string;
  collection_name: string;
  description: string;
  display_location: string;
  max_logos_shown: number;
  randomize_order: boolean;
  logos: CollectionLogo[];
}

interface CollectionLogo {
  mapping_id: string;
  logo_id: string;
  logo_name: string;
  file_url: string;
  display_order: number;
}

export function LogoCollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [availableLogos, setAvailableLogos] = useState<Logo[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [collectionsRes, logosRes] = await Promise.all([
        fetch('/api/admin/logo-collections'),
        fetch('/api/admin/logos')
      ]);
      const collectionsData = await collectionsRes.json();
      const logosData = await logosRes.json();
      setCollections(collectionsData.collections || []);
      setAvailableLogos(logosData.logos?.filter((l: Logo) => l.is_active) || []);
      
      if (collectionsData.collections?.length > 0) {
        setSelectedCollection(collectionsData.collections[0].id);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLogoToCollection = async (collectionId: string, logoId: string) => {
    try {
      await fetch(`/api/admin/logo-collections/${collectionId}/logos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo_id: logoId })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to add logo:', error);
    }
  };

  const removeLogoFromCollection = async (mappingId: string) => {
    try {
      await fetch(`/api/admin/logo-collections/mapping/${mappingId}`, {
        method: 'DELETE'
      });
      await loadData();
    } catch (error) {
      console.error('Failed to remove logo:', error);
    }
  };

  const reorderLogos = async (collectionId: string, newOrder: CollectionLogo[]) => {
    try {
      setSaving(true);
      await fetch(`/api/admin/logo-collections/${collectionId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logos: newOrder.map((logo, index) => ({
            mapping_id: logo.mapping_id,
            display_order: index
          }))
        })
      });
      await loadData();
    } catch (error) {
      console.error('Failed to reorder logos:', error);
    } finally {
      setSaving(false);
    }
  };

  const moveLogoUp = (collection: Collection, index: number) => {
    if (index === 0) return;
    const newLogos = [...collection.logos];
    [newLogos[index - 1], newLogos[index]] = [newLogos[index], newLogos[index - 1]];
    reorderLogos(collection.id, newLogos);
  };

  const moveLogoDown = (collection: Collection, index: number) => {
    if (index === collection.logos.length - 1) return;
    const newLogos = [...collection.logos];
    [newLogos[index], newLogos[index + 1]] = [newLogos[index + 1], newLogos[index]];
    reorderLogos(collection.id, newLogos);
  };

  const activeCollection = collections.find(c => c.id === selectedCollection);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading collections...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Logo Collections & Positioning</h2>
        <p className="text-gray-600 mt-1">Control which logos appear where and in what order</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <div className="font-semibold mb-1">💡 How Logo Collections Work:</div>
            <div className="space-y-1 text-blue-800">
              <div><strong>Collections</strong> = WHERE logos appear (Homepage, About, Reports, etc.)</div>
              <div><strong>Display Order</strong> = SEQUENCE (1st, 2nd, 3rd... from left to right)</div>
              <div><strong>Same logo</strong> can appear in multiple collections with different orders</div>
              <div><strong>Drag up/down</strong> or use arrows to reorder • Changes save automatically</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Selector */}
      <div className="flex items-center gap-4">
        <Label>Select Collection:</Label>
        <div className="flex gap-2 flex-wrap">
          {collections.map((collection) => (
            <Button
              key={collection.id}
              size="sm"
              variant={selectedCollection === collection.id ? 'default' : 'outline'}
              onClick={() => setSelectedCollection(collection.id)}
            >
              {collection.collection_name}
              <Badge variant="secondary" className="ml-2">
                {collection.logos?.length || 0}/{collection.max_logos_shown}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {activeCollection && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Collection Info */}
          <div className="pb-4 border-b">
            <h3 className="text-lg font-bold mb-2">{activeCollection.collection_name}</h3>
            <p className="text-sm text-gray-600 mb-2">{activeCollection.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>📍 Location: {activeCollection.display_location}</span>
              <span>•</span>
              <span>📊 Max: {activeCollection.max_logos_shown} logos</span>
              {activeCollection.randomize_order && (
                <>
                  <span>•</span>
                  <span>🔀 Randomized on each load</span>
                </>
              )}
            </div>
          </div>

          {/* Current Logos in Collection (Reorderable) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                Logos in This Collection ({activeCollection.logos?.length || 0})
              </h4>
              {saving && (
                <span className="text-sm text-blue-600">💾 Saving order...</span>
              )}
            </div>

            {activeCollection.logos && activeCollection.logos.length > 0 ? (
              <div className="space-y-2">
                {activeCollection.logos
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((logo, index) => (
                    <div
                      key={logo.mapping_id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {/* Drag Handle & Order */}
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Logo Preview */}
                      <div className="w-24 h-12 bg-white rounded border flex items-center justify-center p-1">
                        <img
                          src={logo.file_url}
                          alt={logo.logo_name}
                          className="max-w-full max-h-full object-contain grayscale"
                        />
                      </div>

                      {/* Logo Name */}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{logo.logo_name}</div>
                        <div className="text-xs text-gray-500">Order: {logo.display_order}</div>
                      </div>

                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveLogoUp(activeCollection, index)}
                          disabled={index === 0 || saving}
                          className="h-6 px-2"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveLogoDown(activeCollection, index)}
                          disabled={index === activeCollection.logos.length - 1 || saving}
                          className="h-6 px-2"
                        >
                          ↓
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLogoFromCollection(logo.mapping_id)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">No logos in this collection yet</p>
              </div>
            )}
          </div>

          {/* Add Logo to Collection */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Add Logo to This Collection</h4>
            <div className="grid grid-cols-4 gap-3">
              {availableLogos
                .filter(logo => !activeCollection.logos?.some(cl => cl.logo_id === logo.id))
                .map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => addLogoToCollection(activeCollection.id, logo.id)}
                    className="border rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="w-full h-12 bg-white rounded flex items-center justify-center mb-2">
                      <img
                        src={logo.file_url}
                        alt={logo.logo_name}
                        className="max-w-full max-h-full object-contain grayscale"
                      />
                    </div>
                    <div className="text-xs font-medium">{logo.logo_name}</div>
                    <Plus className="h-3 w-3 mx-auto mt-1 text-blue-600" />
                  </button>
                ))}
            </div>
            {availableLogos.filter(logo => !activeCollection.logos?.some(cl => cl.logo_id === logo.id)).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                All active logos are already in this collection
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Preview (as it will appear on site)</h4>
              <Badge variant="outline">
                <Eye className="h-3 w-3 mr-1" />
                {activeCollection.display_location}
              </Badge>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-4">
                  Trusted by brand managers at leading companies
                </div>
              </div>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                {activeCollection.logos
                  ?.sort((a, b) => a.display_order - b.display_order)
                  .slice(0, activeCollection.max_logos_shown)
                  .map((logo) => (
                    <div key={logo.logo_id} className="flex flex-col items-center">
                      <div className="w-32 h-16 flex items-center justify-center">
                        <img
                          src={logo.file_url}
                          alt={logo.logo_name}
                          className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">#{logo.display_order + 1}</div>
                    </div>
                  ))}
              </div>
              {activeCollection.logos && activeCollection.logos.length > activeCollection.max_logos_shown && (
                <div className="text-center mt-4 text-xs text-orange-600">
                  ⚠️ {activeCollection.logos.length - activeCollection.max_logos_shown} logos hidden (exceeds max: {activeCollection.max_logos_shown})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

