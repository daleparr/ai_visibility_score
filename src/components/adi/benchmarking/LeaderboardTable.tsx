'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Crown,
  Medal,
  Award,
  Star,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import type { LeaderboardEntry, BenchmarkFilters } from '../../../lib/adi/ui-types';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  currentBrand?: string;
  filters: BenchmarkFilters;
  onFilterChange: (filters: BenchmarkFilters) => void;
  onBrandClick?: (brand: string) => void;
  pageSize?: number;
  className?: string;
}

type SortField = 'rank' | 'brand' | 'score' | 'infrastructure' | 'perception' | 'commerce';
type SortDirection = 'asc' | 'desc';

/**
 * LeaderboardTable Component
 * Interactive table showing industry rankings with sorting and competitive analysis
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  currentBrand,
  filters,
  onFilterChange,
  onBrandClick,
  pageSize = 20,
  className
}) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: number | string = a[sortField];
      let bValue: number | string = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [data, sortField, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-amber-600" />;
    if (rank <= 10) return <Star className="h-4 w-4 text-blue-500" />;
    return null;
  };

  // Get trend icon
  const getTrendIcon = (trend?: { direction: 'up' | 'down' | 'stable'; change: number }) => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return (
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs">+{trend.change}</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-600">
            <TrendingDown className="h-3 w-3 mr-1" />
            <span className="text-xs">{trend.change}</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center text-gray-500">
            <Minus className="h-3 w-3 mr-1" />
            <span className="text-xs">±0</span>
          </div>
        );
    }
  };

  // Render sort header
  const SortHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <motion.div
            initial={!prefersReducedMotion ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </motion.div>
        )}
      </div>
    </th>
  );

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="rank">Rank</SortHeader>
              <SortHeader field="brand">Brand</SortHeader>
              <SortHeader field="score">Score</SortHeader>
              <SortHeader field="infrastructure">Infrastructure</SortHeader>
              <SortHeader field="perception">Perception</SortHeader>
              <SortHeader field="commerce">Commerce</SortHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strength
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gap
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((entry, index) => (
              <motion.tr
                key={entry.brand}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  entry.isCurrentBrand && 'bg-blue-50 border-l-4 border-blue-500'
                )}
                initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Rank */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankBadge(entry.rank)}
                    <span className={cn(
                      'text-sm font-medium',
                      entry.isCurrentBrand ? 'text-blue-900' : 'text-gray-900'
                    )}>
                      #{entry.rank}
                    </span>
                  </div>
                </td>

                {/* Brand */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className={cn(
                        'text-sm font-medium',
                        entry.isCurrentBrand ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {entry.isCurrentBrand && '🔵 '}
                        {entry.brand}
                      </div>
                      {entry.badge && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {entry.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>

                {/* Overall Score */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {entry.score}
                  </div>
                </td>

                {/* Infrastructure */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {entry.infrastructure}
                  </div>
                </td>

                {/* Perception */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {entry.perception}
                  </div>
                </td>

                {/* Commerce */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {entry.commerce}
                  </div>
                </td>

                {/* Strength */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {entry.strength}
                  </Badge>
                </td>

                {/* Gap */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {entry.gap && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {entry.gap}
                    </Badge>
                  )}
                </td>

                {/* Trend */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {getTrendIcon(entry.trend)}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {onBrandClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBrandClick(entry.brand)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;