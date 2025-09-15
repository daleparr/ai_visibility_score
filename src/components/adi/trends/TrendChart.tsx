'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Dot
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import type { TrendDataPoint, ChartEvent } from '../../../lib/adi/ui-types';

interface TrendChartProps {
  data: TrendDataPoint[];
  timeRange: '3m' | '6m' | '12m';
  showEvents?: boolean;
  events?: ChartEvent[];
  height?: number;
  onPointClick?: (point: TrendDataPoint) => void;
  onTimeRangeChange?: (range: '3m' | '6m' | '12m') => void;
  className?: string;
}

/**
 * TrendChart Component
 * Interactive line chart showing ADI score trends with event markers
 */
export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  timeRange,
  showEvents = true,
  events = [],
  height = 300,
  onPointClick,
  onTimeRangeChange,
  className
}) => {
  const [hoveredEvent, setHoveredEvent] = useState<ChartEvent | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Overall Score:</span>
              <span className="font-medium">{data.score}</span>
            </div>
            {data.infrastructure && (
              <div className="flex items-center justify-between">
                <span className="text-blue-500">Infrastructure:</span>
                <span className="font-medium">{data.infrastructure}</span>
              </div>
            )}
            {data.perception && (
              <div className="flex items-center justify-between">
                <span className="text-purple-500">Perception:</span>
                <span className="font-medium">{data.perception}</span>
              </div>
            )}
            {data.commerce && (
              <div className="flex items-center justify-between">
                <span className="text-green-500">Commerce:</span>
                <span className="font-medium">{data.commerce}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom event dot
  const EventDot = ({ cx, cy, payload }: any) => {
    const event = events.find(e => e.date === payload.date);
    if (!event) return null;

    const eventColors = {
      positive: '#10B981',
      negative: '#EF4444',
      neutral: '#6B7280'
    };

    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill={eventColors[event.type]}
        stroke="#ffffff"
        strokeWidth={2}
        onMouseEnter={() => setHoveredEvent(event)}
        onMouseLeave={() => setHoveredEvent(null)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  // Time range options
  const timeRangeOptions = [
    { key: '3m', label: '3 Months', description: 'Last 3 months' },
    { key: '6m', label: '6 Months', description: 'Last 6 months' },
    { key: '12m', label: '12 Months', description: 'Last 12 months' }
  ];

  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', change: 0 };
    
    const recent = data[data.length - 1].score;
    const previous = data[data.length - 2].score;
    const change = recent - previous;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change)
    };
  };

  const trend = calculateTrend();

  return (
    <motion.div
      className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">ADI Score Trend</h3>
            <p className="text-sm text-gray-600">Performance over time</p>
          </div>
        </div>

        {/* Time Range Selector */}
        {onTimeRangeChange && (
          <div className="flex space-x-1">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.key}
                variant={timeRange === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(option.key as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Trend Summary */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
          {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
          {trend.direction === 'stable' && <div className="w-4 h-0.5 bg-gray-400"></div>}
          <span className={cn(
            'text-sm font-medium',
            trend.direction === 'up' ? 'text-green-600' :
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend.direction === 'up' ? `+${trend.change}` : 
             trend.direction === 'down' ? `-${trend.change}` : '±0'} points
          </span>
        </div>
        <span className="text-sm text-gray-500">
          vs previous period
        </span>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#D1D5DB' }}
            />
            
            {/* Reference lines for score ranges */}
            <ReferenceLine y={80} stroke="#10B981" strokeDasharray="2 2" opacity={0.5} />
            <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="2 2" opacity={0.5} />
            <ReferenceLine y={40} stroke="#EF4444" strokeDasharray="2 2" opacity={0.5} />

            {/* Main score line */}
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />

            {/* Pillar lines (optional) */}
            <Line
              type="monotone"
              dataKey="infrastructure"
              stroke="#2563EB"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.6}
            />
            <Line
              type="monotone"
              dataKey="perception"
              stroke="#7C3AED"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.6}
            />
            <Line
              type="monotone"
              dataKey="commerce"
              stroke="#059669"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.6}
            />

            {/* Events */}
            {showEvents && <Line dataKey="score" dot={<EventDot />} stroke="transparent" />}

            <Tooltip content={<CustomTooltip />} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-600"></div>
            <span className="text-gray-700">Overall Score</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-blue-400"></div>
            <span className="text-gray-600">Infrastructure</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-purple-400"></div>
            <span className="text-gray-600">Perception</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-green-400"></div>
            <span className="text-gray-600">Commerce</span>
          </div>
        </div>

        {showEvents && events.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{events.length} events</span>
          </div>
        )}
      </div>

      {/* Event Tooltip */}
      {hoveredEvent && (
        <motion.div
          className="absolute z-10 p-3 bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs"
          initial={!prefersReducedMotion ? { opacity: 0, scale: 0.9 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start space-x-2">
            <div className={cn(
              'p-1 rounded',
              hoveredEvent.type === 'positive' ? 'bg-green-100' :
              hoveredEvent.type === 'negative' ? 'bg-red-100' : 'bg-gray-100'
            )}>
              {hoveredEvent.type === 'positive' && <TrendingUp className="h-3 w-3 text-green-600" />}
              {hoveredEvent.type === 'negative' && <TrendingDown className="h-3 w-3 text-red-600" />}
              {hoveredEvent.type === 'neutral' && <Info className="h-3 w-3 text-gray-600" />}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">
                {hoveredEvent.title}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {hoveredEvent.description}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {hoveredEvent.date}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Zones Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-2">Performance Zones</div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Excellent (80+)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Good (60-79)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Needs Work (under 60)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendChart;