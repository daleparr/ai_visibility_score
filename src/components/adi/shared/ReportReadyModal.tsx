'use client';

import { CheckCircle, Download, Share2, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportReadyModalProps {
  score: number;
  grade: string;
  brandName?: string;
  onClose: () => void;
  onViewReport: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  showUpsell?: boolean;
}

export function ReportReadyModal({
  score,
  grade,
  brandName,
  onClose,
  onViewReport,
  onDownload,
  onShare,
  showUpsell = true
}: ReportReadyModalProps) {
  const gradeColor = {
    'A': 'text-green-600 from-green-50 to-green-100 border-green-200',
    'B': 'text-blue-600 from-blue-50 to-blue-100 border-blue-200',
    'C': 'text-yellow-600 from-yellow-50 to-yellow-100 border-yellow-200',
    'D': 'text-orange-600 from-orange-50 to-orange-100 border-orange-200',
    'F': 'text-red-600 from-red-50 to-red-100 border-red-200'
  }[grade] || 'text-blue-600 from-blue-50 to-purple-100 border-blue-200';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full mx-auto text-center relative animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Success Icon */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2">
            Your AEO Report is Ready!
          </h2>
          
          {brandName && (
            <p className="text-gray-600 text-sm mb-6">
              Complete analysis for {brandName}
            </p>
          )}
          
          {/* Score Preview */}
          <div className={`my-6 p-6 bg-gradient-to-br ${gradeColor} rounded-lg border-2`}>
            <div className={`text-6xl font-bold mb-2 ${gradeColor.split(' ')[0]}`}>
              {grade}
            </div>
            <div className="text-3xl font-semibold text-gray-700">
              {score}/100
            </div>
            <div className="text-sm text-gray-600 mt-2">
              AEO Readiness Score
            </div>
          </div>
          
          {/* Message */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            We've analyzed your brand across 12 AEO dimensions and tested with
            multiple frontier AI models. Your comprehensive report includes benchmarking,
            recommendations, and a prioritized action plan.
          </p>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={onViewReport}
              className="w-full py-3 text-base font-medium"
              size="lg"
            >
              View Full Report →
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              {onDownload && (
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="py-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              {onShare && (
                <Button
                  onClick={onShare}
                  variant="outline"
                  className="py-2"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Upsell */}
        {showUpsell && (
          <div className="px-8 pb-8">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 text-yellow-900 text-sm font-medium mb-2">
                <TrendingUp className="h-4 w-4" />
                Track Your Progress Over Time
              </div>
              <p className="text-xs text-yellow-800">
                Set up quarterly monitoring to track improvements and stay ahead of competitors
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-yellow-300 hover:bg-yellow-100"
              >
                Learn About Monitoring →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified version without upsell
export function SimpleReportReadyModal({
  score,
  grade,
  onViewReport
}: {
  score: number;
  grade: string;
  onViewReport: () => void;
}) {
  return (
    <ReportReadyModal
      score={score}
      grade={grade}
      onClose={onViewReport}
      onViewReport={onViewReport}
      showUpsell={false}
    />
  );
}

