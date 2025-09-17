'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { BenchmarkFilters } from '../../../lib/adi/ui-types';

interface FilterControlsProps {
  filters: BenchmarkFilters;
  onFilterChange: (filters: BenchmarkFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

/**
 * FilterControls Component
 * Advanced filtering interface for benchmarking data
 */
export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  className
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Filter options
  const filterOptions = {
    industry: [
      'All Industries',
      'Streetwear & Fashion',
      'Technology & Software',
      'E-commerce & Retail',
      'Healthcare & Wellness',
      'Financial Services',
      'Food & Beverage',
      'Automotive',
      'Travel & Hospitality',
      'Beauty & Personal Care',
      'Home & Garden'
    ],
    region: [
      'Global',
      'North America',
      'Europe',
      'Asia-Pacific',
      'Latin America',
      'Middle East & Africa'
    ],
    companySize: [
      'All Sizes',
      'Enterprise (1000+)',
      'Mid-market (100-999)',
      'SMB (<100)'
    ],
    timePeriod: [
      'Current',
      '3 months ago',
      '6 months ago',
      '1 year ago'
    ]
  };

  // Handle filter change
  const handleFilterChange = (key: keyof BenchmarkFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === `All ${key.charAt(0).toUpperCase() + key.slice(1)}` || 
             value === 'All Industries' || 
             value === 'All Sizes' || 
             value === 'Global' || 
             value === 'Current' ? undefined : value
    };
    onFilterChange(newFilters);
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Custom Select Component
  const FilterSelect: React.FC<{
    label: string;
    value: string | undefined;
    options: string[];
    onChange: (value: string) => void;
    filterKey: keyof BenchmarkFilters;
  }> = ({ label, value, options, onChange, filterKey }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value || options[0]}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}
      initial={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter Benchmarks</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterSelect
          label="Industry"
          value={filters.industry}
          options={filterOptions.industry}
          onChange={(value) => handleFilterChange('industry', value)}
          filterKey="industry"
        />
        
        <FilterSelect
          label="Region"
          value={filters.region}
          options={filterOptions.region}
          onChange={(value) => handleFilterChange('region', value)}
          filterKey="region"
        />
        
        <FilterSelect
          label="Company Size"
          value={filters.companySize}
          options={filterOptions.companySize}
          onChange={(value) => handleFilterChange('companySize', value)}
          filterKey="companySize"
        />
        
        <FilterSelect
          label="Time Period"
          value={filters.timePeriod}
          options={filterOptions.timePeriod}
          onChange={(value) => handleFilterChange('timePeriod', value)}
          filterKey="timePeriod"
        />
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-gray-200"
          initial={!prefersReducedMotion ? { opacity: 0, height: 0 } : {}}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters.industry && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200"
                  onClick={() => handleFilterChange('industry', 'All Industries')}
                >
                  {filters.industry}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.region && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-700 cursor-pointer hover:bg-green-200"
                  onClick={() => handleFilterChange('region', 'Global')}
                >
                  {filters.region}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.companySize && (
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200"
                  onClick={() => handleFilterChange('companySize', 'All Sizes')}
                >
                  {filters.companySize}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.timePeriod && (
                <Badge 
                  variant="secondary" 
                  className="bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                  onClick={() => handleFilterChange('timePeriod', 'Current')}
                >
                  {filters.timePeriod}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Summary */}
      <motion.div
        className="mt-4 p-3 bg-gray-50 rounded-lg"
        initial={!prefersReducedMotion ? { opacity: 0 } : {}}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Search className="h-4 w-4" />
          <span>
            Showing {filters.industry || 'all industries'}
            {filters.region && ` in ${filters.region}`}
            {filters.companySize && ` (${filters.companySize.toLowerCase()})`}
            {filters.timePeriod && ` - ${filters.timePeriod.toLowerCase()}`}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilterControls;