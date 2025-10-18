'use client';

/**
 * Portfolio Heat Map - Portfolio Tab
 * Visual matrix positioning brands by performance
 */

import { motion } from 'framer-motion';
import { Award, TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';

export function PortfolioHeatMap() {
  const portfolioBrands = [
    { name: 'Nike', score: 78, industryRank: 85, status: 'at-risk', revenue: 'high' },
    { name: 'Jordan', score: 92, industryRank: 95, status: 'exceeding', revenue: 'high' },
    { name: 'Adidas', score: 71, industryRank: 78, status: 'at-risk', revenue: 'high' },
    { name: 'Converse', score: 68, industryRank: 72, status: 'action-required', revenue: 'medium' },
    { name: 'Umbro', score: 74, industryRank: 80, status: 'at-risk', revenue: 'medium' },
    { name: 'Air Max', score: 89, industryRank: 92, status: 'exceeding', revenue: 'high' },
    { name: 'Cortez', score: 76, industryRank: 82, status: 'at-risk', revenue: 'medium' },
    { name: 'Cole Haan', score: 81, industryRank: 88, status: 'exceeding', revenue: 'medium' },
    { name: 'Hurley', score: 73, industryRank: 79, status: 'at-risk', revenue: 'low' },
    { name: 'REACT', score: 85, industryRank: 90, status: 'exceeding', revenue: 'high' },
    { name: 'SB Dunk', score: 77, industryRank: 83, status: 'at-risk', revenue: 'medium' },
    { name: 'ACG', score: 79, industryRank: 85, status: 'at-risk', revenue: 'medium' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding': return '#22c55e';
      case 'at-risk': return '#f59e0b';
      case 'action-required': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeding': return Award;
      case 'at-risk': return TrendingUp;
      case 'action-required': return AlertTriangle;
      default: return Award;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 
          className="text-2xl md:text-3xl lg:text-4xl mb-4"
          style={{ 
            fontWeight: 400,
            color: '#0f172a',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.2
          }}
        >
          Portfolio Heat Map
        </h1>
        <p 
          className="text-base md:text-lg max-w-3xl mx-auto"
          style={{ 
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Visual matrix positioning brands by performance and strategic priority
        </p>
      </div>

      {/* Desktop: 2D Positioning Matrix */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl border p-6 md:p-8" style={{ borderColor: '#e2e8f0' }}>
          <div className="grid grid-cols-12 gap-2 mb-4">
            {portfolioBrands.map((brand, index) => {
              const StatusIcon = getStatusIcon(brand.status);
              return (
                <motion.div
                  key={index}
                  className="aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ 
                    borderColor: getStatusColor(brand.status),
                    backgroundColor: `${getStatusColor(brand.status)}10`
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <StatusIcon className="w-4 h-4 mb-1" style={{ color: getStatusColor(brand.status) }} />
                  <div className="text-xs font-medium text-center" style={{ color: '#0f172a' }}>
                    {brand.name}
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>
                    {brand.score}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs" style={{ color: '#64748b' }}>
            <span>Industry Rank (Low)</span>
            <span>Industry Rank (High)</span>
          </div>
        </div>
      </div>

      {/* Mobile: Optimized List View */}
      <div className="md:hidden space-y-4">
        {portfolioBrands.map((brand, index) => {
          const StatusIcon = getStatusIcon(brand.status);
          return (
            <motion.div
              key={index}
              className="bg-white rounded-xl border p-4"
              style={{ borderColor: '#e2e8f0' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${getStatusColor(brand.status)}20` }}
                  >
                    <StatusIcon className="w-4 h-4" style={{ color: getStatusColor(brand.status) }} />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: '#0f172a' }}>{brand.name}</div>
                    <div className="text-sm" style={{ color: '#64748b' }}>
                      Score: {brand.score} • Rank: {brand.industryRank}%
                    </div>
                  </div>
                </div>
                <Badge 
                  className="text-xs"
                  style={{ 
                    backgroundColor: getStatusColor(brand.status),
                    color: 'white',
                    fontWeight: 500
                  }}
                >
                  {brand.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
