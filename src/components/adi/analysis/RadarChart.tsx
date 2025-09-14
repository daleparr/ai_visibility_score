'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { DimensionScore } from '../../../lib/adi/ui-types';

interface RadarChartProps {
  data: DimensionScore[];
  categoryAverage?: DimensionScore[];
  size?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  onDimensionClick?: (dimension: string) => void;
  className?: string;
}

interface ChartDataPoint {
  dimension: string;
  shortName: string;
  brandScore: number;
  categoryAverage: number;
  fullMark: number;
}

/**
 * RadarChart Component
 * Interactive radar/spider chart for 9-dimension ADI analysis
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  categoryAverage = [],
  size = 400,
  showGrid = true,
  showLabels = true,
  interactive = true,
  onDimensionClick,
  className
}) => {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Transform data for Recharts
  const chartData: ChartDataPoint[] = data.map((item) => {
    const categoryItem = categoryAverage.find(cat => cat.dimension === item.dimension);
    
    // Create short names for better chart readability
    const shortNames: Record<string, string> = {
      'Schema & Structured Data': 'Schema',
      'Semantic Clarity & Ontology': 'Semantic',
      'Knowledge Graphs & Entity Linking': 'Knowledge',
      'LLM Readability & Conversational Copy': 'LLM Ready',
      'AI Answer Quality & Presence': 'AI Answers',
      'Citation Authority & Freshness': 'Authority',
      'Reputation Signals': 'Reputation',
      'Hero Products & Use-Case Retrieval': 'Products',
      'Policies & Logistics Clarity': 'Policies'
    };

    return {
      dimension: item.dimension,
      shortName: shortNames[item.dimension] || item.dimension,
      brandScore: item.score,
      categoryAverage: categoryItem?.score || 0,
      fullMark: 100
    };
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.dimension}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Your Score:</span>
              <span className="font-medium">{data.brandScore}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Category Avg:</span>
              <span className="font-medium">{data.categoryAverage}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Difference:</span>
              <span className={cn(
                'font-medium',
                data.brandScore > data.categoryAverage ? 'text-green-600' : 'text-red-600'
              )}>
                {data.brandScore > data.categoryAverage ? '+' : ''}{data.brandScore - data.categoryAverage}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle dimension click
  const handleDimensionClick = (data: any) => {
    if (interactive && onDimensionClick) {
      onDimensionClick(data.dimension);
    }
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
      initial={!prefersReducedMotion ? { opacity: 0, scale: 0.9 } : {}}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {showGrid && (
            <PolarGrid 
              stroke="#E5E7EB" 
              strokeWidth={1}
              radialLines={true}
            />
          )}
          
          <PolarAngleAxis 
            dataKey="shortName" 
            tick={{ 
              fontSize: 12, 
              fill: '#374151',
              fontWeight: 500
            }}
            className="text-xs font-medium"
          />
          
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ 
              fontSize: 10, 
              fill: '#9CA3AF' 
            }}
            tickCount={6}
          />

          {/* Category Average (Background) */}
          {categoryAverage.length > 0 && (
            <Radar
              name="Category Average"
              dataKey="categoryAverage"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5,5"
              fill="transparent"
              dot={false}
            />
          )}

          {/* Brand Score (Foreground) */}
          <Radar
            name="Your Score"
            dataKey="brandScore"
            stroke="#2563EB"
            strokeWidth={3}
            fill="#2563EB"
            fillOpacity={0.1}
            dot={{ 
              fill: '#2563EB', 
              strokeWidth: 2, 
              stroke: '#ffffff',
              r: 4
            }}
            activeDot={{ 
              r: 6, 
              fill: '#1D4ED8',
              stroke: '#ffffff',
              strokeWidth: 2
            }}
          />

          {interactive && (
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#2563EB', strokeWidth: 2 }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span className="text-gray-700 font-medium">Your Score</span>
        </div>
        {categoryAverage.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-gray-400"></div>
            <span className="text-gray-600">Category Average</span>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <motion.div
        className="absolute top-0 right-0 bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-xs"
        initial={!prefersReducedMotion ? { opacity: 0, x: 20 } : {}}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="space-y-1">
          <div className="font-semibold text-gray-900">Performance</div>
          {(() => {
            const aboveAverage = chartData.filter(d => d.brandScore > d.categoryAverage).length;
            const total = chartData.length;
            const percentage = Math.round((aboveAverage / total) * 100);
            
            return (
              <>
                <div className="text-gray-600">
                  {aboveAverage}/{total} above average
                </div>
                <div className={cn(
                  'font-medium',
                  percentage >= 70 ? 'text-green-600' : 
                  percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                )}>
                  {percentage}% strong
                </div>
              </>
            );
          })()}
        </div>
      </motion.div>

      {/* Accessibility description */}
      <div className="sr-only">
        Radar chart showing AI Discoverability Index performance across 9 dimensions. 
        Your brand scores are shown as a solid blue line, with category averages shown as a dashed gray line.
        {chartData.map((item, index) => (
          <span key={index}>
            {item.dimension}: Your score {item.brandScore} out of 100, 
            category average {item.categoryAverage} out of 100.
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default RadarChart;