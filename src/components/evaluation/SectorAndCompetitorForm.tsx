'use client';

// Sector and Competitor Selection Form
// Shown during first evaluation to properly benchmark brands

import { useState, useEffect } from 'react';
import { ChevronDown, Users, Building2, CheckCircle } from 'lucide-react';

interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
}

interface SectorAndCompetitorFormProps {
  brandUrl: string;
  onComplete: (data: {
    sectorId: string;
    competitors: string[];
  }) => void;
  onSkip?: () => void;
}

export function SectorAndCompetitorForm({ 
  brandUrl, 
  onComplete,
  onSkip 
}: SectorAndCompetitorFormProps) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('');
  const [competitors, setCompetitors] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSectors();
  }, []);

  async function loadSectors() {
    try {
      const response = await fetch('/api/industry-reports/sectors');
      const data = await response.json();
      
      if (data.success) {
        setSectors(data.sectors);
      } else {
        setError('Failed to load sectors');
      }
    } catch (err) {
      setError('Failed to load sectors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleCompetitorChange(index: number, value: string) {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedSectorId) {
      alert('Please select your industry sector');
      return;
    }

    // Filter out empty competitor entries
    const validCompetitors = competitors.filter(c => c.trim().length > 0);
    
    if (validCompetitors.length === 0) {
      if (!confirm('No competitors entered. Continue anyway? (We recommend adding at least 2 competitors for better benchmarking)')) {
        return;
      }
    }

    onComplete({
      sectorId: selectedSectorId,
      competitors: validCompetitors,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Help Us Benchmark Your Brand
          </h2>
          <p className="text-emerald-50">
            To provide accurate competitive insights, we need to understand your market position
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Brand Being Evaluated */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Evaluating</span>
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {brandUrl}
            </div>
          </div>

          {/* Sector Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              1. Which industry sector best describes your brand?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedSectorId}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white text-slate-900"
                required
              >
                <option value="">-- Select your industry --</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
            
            {selectedSectorId && (
              <div className="mt-2 text-sm text-slate-600">
                {sectors.find(s => s.id === selectedSectorId)?.description}
              </div>
            )}
          </div>

          {/* Competitor Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              2. Who are your top 3 direct competitors?
            </label>
            <p className="text-sm text-slate-600 mb-4">
              This helps us benchmark you against the right peer group. Enter company names or websites.
            </p>
            
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={competitors[index]}
                    onChange={(e) => handleCompetitorChange(index, e.target.value)}
                    placeholder={index === 0 ? "e.g., competitor1.com or Company Name" : "Optional"}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
              <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600" />
              <span>We'll show you exactly how you rank against these competitors in AI recommendations</span>
            </div>
          </div>

          {/* Why We Ask */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Why we ask this
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Compare you against the <strong>right</strong> competitive set</li>
              <li>• Show your ranking in industry reports</li>
              <li>• Provide competitor-specific recommendations</li>
              <li>• Track your market position over time</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-slate-600 hover:text-slate-700 text-sm font-medium"
              >
                Skip for now
              </button>
            )}
            
            <button
              type="submit"
              disabled={!selectedSectorId}
              className="ml-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Continue to Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

