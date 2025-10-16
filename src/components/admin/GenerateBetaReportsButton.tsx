'use client';

// Admin button to generate beta industry reports from leaderboard data

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

export function GenerateBetaReportsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/industry-reports/generate-from-cache', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to generate reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Reports...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Beta Reports from Leaderboard Data
          </>
        )}
      </Button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">
            ✅ Success! Generated {result.reports?.length || 0} reports
          </h4>
          <div className="space-y-1 text-sm text-green-800">
            {result.reports?.map((report: any, idx: number) => (
              <div key={idx}>
                • {report.sector}: {report.brands} brands
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ Error: {error}</p>
        </div>
      )}
    </div>
  );
}

