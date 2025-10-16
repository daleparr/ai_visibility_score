'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, Eye } from 'lucide-react';
import { ThemeColors, ThemeFonts } from '@/lib/cms/cms-client';

interface ThemeEditorProps {
  onSave?: () => void;
}

export function ThemeEditor({ onSave }: ThemeEditorProps) {
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#059669',
    background: '#FFFFFF',
    foreground: '#1F2937',
    muted: '#F3F4F6',
    border: '#E5E7EB',
    success: '#16A34A',
    warning: '#EA580C',
    error: '#DC2626',
    info: '#2563EB'
  });

  const [fonts, setFonts] = useState<ThemeFonts>({
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono'
  });

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Try test API first (no auth), fall back to regular API
      const response = await fetch('/api/cms-test/theme').catch(() => 
        fetch('/api/cms/theme')
      );
      const data = await response.json();
      if (data.colors) setColors(data.colors);
      if (data.fonts) setFonts(data.fonts);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const saveTheme = async () => {
    setSaving(true);
    try {
      // Try test API first (no auth), fall back to regular API
      const response = await fetch('/api/cms-test/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors, fonts })
      }).catch(() => 
        fetch('/api/cms/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ colors, fonts })
        })
      );
      
      if (response.ok) {
        alert('Theme saved successfully!');
        onSave?.();
      } else {
        const error = await response.json();
        alert('Failed to save: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      alert('Error saving theme. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset theme to defaults? This cannot be undone.')) {
      setColors({
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#059669',
        background: '#FFFFFF',
        foreground: '#1F2937',
        muted: '#F3F4F6',
        border: '#E5E7EB',
        success: '#16A34A',
        warning: '#EA580C',
        error: '#DC2626',
        info: '#2563EB'
      });
      setFonts({
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      });
    }
  };

  const applyPreview = () => {
    // Apply theme variables to document
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value);
    });
    root.style.setProperty('--font-heading', `${fonts.heading}, sans-serif`);
    root.style.setProperty('--font-body', `${fonts.body}, sans-serif`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Theme Editor</h1>
          <p className="text-gray-600 mt-1">
            Customize colors, fonts, and typography for your site
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              applyPreview();
              setPreviewMode(!previewMode);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveTheme}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colors Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
            <div className="space-y-4 bg-white rounded-lg border p-6">
              <ColorInput
                label="Primary"
                value={colors.primary}
                onChange={(value) => setColors({ ...colors, primary: value })}
                description="Main brand color (buttons, links, accents)"
              />
              <ColorInput
                label="Secondary"
                value={colors.secondary}
                onChange={(value) => setColors({ ...colors, secondary: value })}
                description="Secondary brand color (highlights, badges)"
              />
              <ColorInput
                label="Accent"
                value={colors.accent}
                onChange={(value) => setColors({ ...colors, accent: value })}
                description="Accent color (success states, highlights)"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">UI Colors</h2>
            <div className="space-y-4 bg-white rounded-lg border p-6">
              <ColorInput
                label="Background"
                value={colors.background}
                onChange={(value) => setColors({ ...colors, background: value })}
                description="Page background color"
              />
              <ColorInput
                label="Foreground"
                value={colors.foreground}
                onChange={(value) => setColors({ ...colors, foreground: value })}
                description="Main text color"
              />
              <ColorInput
                label="Muted"
                value={colors.muted}
                onChange={(value) => setColors({ ...colors, muted: value })}
                description="Muted backgrounds, disabled states"
              />
              <ColorInput
                label="Border"
                value={colors.border}
                onChange={(value) => setColors({ ...colors, border: value })}
                description="Border color for cards and dividers"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Semantic Colors</h2>
            <div className="space-y-4 bg-white rounded-lg border p-6">
              <ColorInput
                label="Success"
                value={colors.success || '#16A34A'}
                onChange={(value) => setColors({ ...colors, success: value })}
                description="Success messages, positive indicators"
              />
              <ColorInput
                label="Warning"
                value={colors.warning || '#EA580C'}
                onChange={(value) => setColors({ ...colors, warning: value })}
                description="Warning messages, caution states"
              />
              <ColorInput
                label="Error"
                value={colors.error || '#DC2626'}
                onChange={(value) => setColors({ ...colors, error: value })}
                description="Error messages, critical states"
              />
              <ColorInput
                label="Info"
                value={colors.info || '#2563EB'}
                onChange={(value) => setColors({ ...colors, info: value })}
                description="Informational messages, help text"
              />
            </div>
          </div>
        </div>

        {/* Fonts Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Typography</h2>
            <div className="space-y-4 bg-white rounded-lg border p-6">
              <FontSelect
                label="Heading Font"
                value={fonts.heading}
                onChange={(value) => setFonts({ ...fonts, heading: value })}
                description="Font for h1, h2, h3, h4 elements"
              />
              <FontSelect
                label="Body Font"
                value={fonts.body}
                onChange={(value) => setFonts({ ...fonts, body: value })}
                description="Font for paragraphs and general text"
              />
              <FontSelect
                label="Monospace Font"
                value={fonts.mono}
                onChange={(value) => setFonts({ ...fonts, mono: value })}
                description="Font for code blocks and technical content"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div
                style={{
                  backgroundColor: colors.background,
                  color: colors.foreground,
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${colors.border}`
                }}
              >
                <h3
                  style={{
                    color: colors.primary,
                    fontFamily: `${fonts.heading}, sans-serif`,
                    fontSize: '1.875rem',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}
                >
                  Sample Headline
                </h3>
                <p
                  style={{
                    fontFamily: `${fonts.body}, sans-serif`,
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1rem'
                  }}
                >
                  This is how your body text will look with the selected theme.
                  The quick brown fox jumps over the lazy dog.
                </p>
                <Button
                  style={{
                    backgroundColor: colors.primary,
                    color: '#FFFFFF'
                  }}
                >
                  Primary Button
                </Button>
              </div>

              {/* Color Palette Preview */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg border-2 mb-1"
                      style={{ backgroundColor: value, borderColor: colors.border }}
                    />
                    <div className="text-xs font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  description
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 rounded cursor-pointer border"
        />
        <Input
          id={label}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 font-mono text-sm"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange,
  description
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  const commonFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Source Sans Pro',
    'Raleway',
    'PT Sans',
    'Merriweather',
    'JetBrains Mono',
    'Fira Code',
    'Space Mono'
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-md border bg-white"
      >
        {commonFonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      <div
        className="p-3 bg-gray-50 rounded border text-sm"
        style={{ fontFamily: `${value}, sans-serif` }}
      >
        Preview: The quick brown fox jumps over the lazy dog. 1234567890
      </div>
    </div>
  );
}

