'use client';

/**
 * Ultra-simple CMS test - Just colors
 * No complex components, just test if theme API works
 */

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
  const [colors, setColors] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPrimary, setNewPrimary] = useState('#2563EB');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await fetch('/api/cms-test/theme');
      const data = await response.json();
      setColors(data.colors);
      if (data.colors?.primary) {
        setNewPrimary(data.colors.primary);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const saveColor = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/cms-test/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors: { ...colors, primary: newPrimary }
        })
      });

      if (response.ok) {
        alert('Color saved!');
        await loadTheme();
      } else {
        const err = await response.json();
        alert('Save failed: ' + JSON.stringify(err));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading CMS...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">CMS Simple Test</h1>

        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Theme Color Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Primary Color:
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg border-2"
                    style={{ backgroundColor: colors?.primary || '#2563EB' }}
                  />
                  <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                    {colors?.primary || 'Loading...'}
                  </code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Change Primary Color:
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={newPrimary}
                    onChange={(e) => setNewPrimary(e.target.value)}
                    className="h-12 w-24 rounded cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={newPrimary}
                    onChange={(e) => setNewPrimary(e.target.value)}
                    className="px-3 py-2 border rounded font-mono text-sm w-32"
                    placeholder="#000000"
                  />
                  <button
                    onClick={saveColor}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Color'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Preview:</strong> This button will use the new color
                </div>
                <button
                  className="mt-2 px-4 py-2 rounded text-white font-medium"
                  style={{ backgroundColor: newPrimary }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">All Current Theme Colors:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(colors, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>✓ If you can see this page:</strong> React components are working<br/>
            <strong>✓ If "Current Primary Color" shows:</strong> Database connection is working<br/>
            <strong>✓ If "Save Color" button works:</strong> CMS is fully functional!
          </p>
        </div>
      </div>
    </div>
  );
}

