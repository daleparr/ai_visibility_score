'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';

interface ClientLogo {
  id: string;
  logo_name: string;
  logo_slug: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number;
  height: number;
  is_active: boolean;
  category: string;
  alt_text: string;
  company_url?: string;
  display_order: number;
}

export function LogoManager() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<'list' | 'upload'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const response = await fetch('/api/admin/logos');
      const data = await response.json();
      setLogos(data.logos || []);
    } catch (error) {
      console.error('Failed to load logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLogoActive = async (logoId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/logos/${logoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      await loadLogos();
    } catch (error) {
      console.error('Failed to toggle logo:', error);
    }
  };

  const deleteLogo = async (logoId: string) => {
    if (!confirm('Delete this logo permanently?')) return;
    
    try {
      await fetch(`/api/admin/logos/${logoId}`, {
        method: 'DELETE'
      });
      await loadLogos();
    } catch (error) {
      console.error('Failed to delete logo:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading logos...</div>;
  }

  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Brand Logo Management</h2>
            <p className="text-gray-600 mt-1">Manage client/brand logos for "Trusted by" sections</p>
          </div>
          <Button onClick={() => setView('upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
          </Button>
        </div>

        {/* Upload Specs Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <div className="font-semibold mb-1">📏 Optimal Logo Specifications:</div>
              <div className="space-y-1 text-blue-800">
                <div><strong>Format:</strong> SVG (preferred), PNG or WebP with transparency</div>
                <div><strong>Dimensions:</strong> 200px width × 80px height (2.5:1 ratio)</div>
                <div><strong>Acceptable Range:</strong> 150-300px width, 60-120px height</div>
                <div><strong>File Size:</strong> Max 500KB (ideally &lt;100KB)</div>
                <div><strong>Background:</strong> Transparent (no white boxes)</div>
                <div><strong>Color Mode:</strong> Should work on both light AND dark backgrounds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{logos.length}</div>
            <div className="text-sm text-gray-600">Total Logos</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">
              {logos.filter(l => l.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">
              {logos.filter(l => l.file_type === 'svg').length}
            </div>
            <div className="text-sm text-gray-600">SVG Format</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-orange-600">
              {logos.filter(l => l.file_type === 'png').length}
            </div>
            <div className="text-sm text-gray-600">PNG Format</div>
          </div>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo) => (
            <div key={logo.id} className="bg-white rounded-lg border p-4">
              {/* Logo Preview */}
              <div className="aspect-[2.5/1] bg-gray-50 rounded flex items-center justify-center mb-3 relative overflow-hidden">
                <img
                  src={logo.file_url}
                  alt={logo.alt_text}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: 'grayscale(100%)' }}
                />
                {!logo.is_active && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>

              {/* Logo Info */}
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-sm">{logo.logo_name}</h4>
                  <p className="text-xs text-gray-500 font-mono">{logo.logo_slug}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{logo.file_type.toUpperCase()}</span>
                  <span>{(logo.file_size / 1024).toFixed(1)}KB</span>
                  <span>{logo.width}×{logo.height}</span>
                </div>

                {logo.category && (
                  <Badge variant="outline" className="text-xs">
                    {logo.category}
                  </Badge>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="flex items-center gap-1 flex-1">
                    <Label className="text-xs">Active</Label>
                    <Switch
                      checked={logo.is_active}
                      onCheckedChange={(checked) => toggleLogoActive(logo.id, checked)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLogo(logo.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {logos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No logos uploaded yet</p>
            <Button className="mt-4" onClick={() => setView('upload')}>
              Upload First Logo
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (view === 'upload') {
    return <LogoUploader onComplete={() => { loadLogos(); setView('list'); }} onCancel={() => setView('list')} />;
  }

  return null;
}

function LogoUploader({
  onComplete,
  onCancel
}: {
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    logo_name: '',
    logo_slug: '',
    file_url: '',
    file_type: 'svg',
    alt_text: '',
    category: 'client',
    company_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/svg+xml', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload SVG, PNG, or WebP files only');
      return;
    }

    // Validate file size (500KB max)
    if (file.size > 500 * 1024) {
      alert('File too large. Maximum 500KB. Please optimize and try again.');
      return;
    }

    // TODO: Implement actual file upload to storage service
    // For now, show instructions
    alert(`File selected: ${file.name} (${(file.size / 1024).toFixed(1)}KB)
    
Next step: Upload to your image hosting service (Cloudinary, Uploadcare, or /public folder)
Then paste the URL below.

For /public folder:
1. Place file in: /public/logos/${file.name}
2. URL will be: /logos/${file.name}`);
  };

  const handleSubmit = async () => {
    if (!formData.logo_name || !formData.file_url) {
      alert('Please provide logo name and file URL');
      return;
    }

    try {
      setUploading(true);
      await fetch('/api/admin/logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          logo_slug: formData.logo_slug || formData.logo_name.toLowerCase().replace(/\s+/g, '-'),
          width: 200, // Default, can be updated later
          height: 80,
          file_size: 50000 // Placeholder
        })
      });
      onComplete();
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upload Brand Logo</h2>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* File Upload */}
        <div>
          <Label>Select Logo File</Label>
          <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">
              Drag & drop your logo here, or click to browse
            </p>
            <Input
              type="file"
              accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
              onChange={handleFileSelect}
              className="max-w-xs mx-auto"
            />
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <div>✅ Preferred: SVG (200×80px)</div>
              <div>✅ Alternative: PNG/WebP with transparency</div>
              <div>✅ Max size: 500KB</div>
            </div>
          </div>
        </div>

        {/* Logo Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Brand Name</Label>
            <Input
              value={formData.logo_name}
              onChange={(e) => setFormData({ ...formData, logo_name: e.target.value })}
              placeholder="Nike"
            />
          </div>
          <div>
            <Label>Slug (URL-friendly)</Label>
            <Input
              value={formData.logo_slug}
              onChange={(e) => setFormData({ ...formData, logo_slug: e.target.value })}
              placeholder="nike"
            />
          </div>
        </div>

        <div>
          <Label>File URL (after uploading to hosting)</Label>
          <Input
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            placeholder="/logos/nike.svg or https://cdn.example.com/nike.svg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload file to /public/logos/ folder or use image hosting service (Cloudinary, Uploadcare)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Alt Text (Accessibility)</Label>
            <Input
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              placeholder="Nike logo"
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="client">Client</option>
              <option value="partner">Partner</option>
              <option value="case_study">Case Study</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Company URL (Optional - for clickable logos)</Label>
          <Input
            value={formData.company_url}
            onChange={(e) => setFormData({ ...formData, company_url: e.target.value })}
            placeholder="https://www.nike.com"
          />
        </div>

        {/* Preview */}
        {formData.file_url && (
          <div>
            <Label>Preview</Label>
            <div className="mt-2 bg-gray-50 rounded-lg p-8 flex items-center justify-center" style={{ height: '120px' }}>
              <img
                src={formData.file_url}
                alt={formData.alt_text || 'Logo preview'}
                className="max-h-full max-w-full object-contain"
                style={{ filter: 'grayscale(100%)' }}
                onError={() => alert('Failed to load image. Check URL.')}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSubmit} disabled={uploading || !formData.logo_name || !formData.file_url}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {uploading ? 'Saving...' : 'Add Logo'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* File Specs Reference */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h3 className="font-bold mb-3">📐 Logo Preparation Guide</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">SVG (Recommended)</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• Vector format - scales perfectly</li>
              <li>• Export with viewBox attribute</li>
              <li>• Remove unnecessary metadata</li>
              <li>• Optimize with SVGO or similar</li>
              <li>• Typically 5-20KB file size</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">PNG/WebP (Alternative)</h4>
            <ul className="space-y-1 text-gray-700">
              <li>• PNG-24 with alpha channel (transparency)</li>
              <li>• 2x resolution for retina: 400×160px</li>
              <li>• Compress with TinyPNG or ImageOptim</li>
              <li>• WebP: 90% quality, lossy with transparency</li>
              <li>• Target: &lt;100KB file size</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-900">
          <strong>⚠️ Dark Mode Test:</strong> Preview logos on both white AND dark backgrounds before activating.
          Logos should be visible on both (use appropriate colors or provide dark_mode_url variant).
        </div>
      </div>
    </div>
  );
}

