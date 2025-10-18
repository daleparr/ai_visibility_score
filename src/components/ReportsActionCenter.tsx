'use client';

/**
 * Reports Action Center - Reports Tab
 * Export hub and workflow management
 */

import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Archive } from 'lucide-react';
import { Badge } from './ui/badge';

export function ReportsActionCenter() {
  const exportTemplates = [
    {
      name: 'Executive Board Deck',
      description: '12-15 slides for C-suite presentations',
      icon: FileText,
      color: '#d4a574'
    },
    {
      name: 'CMO Performance Report',
      description: '25-30 slides for marketing teams',
      icon: FileText,
      color: '#3b82f6'
    },
    {
      name: 'CFO Investment Brief',
      description: '8-10 slides for financial planning',
      icon: FileText,
      color: '#22c55e'
    },
    {
      name: 'Full Audit Report',
      description: '40-50 pages comprehensive analysis',
      icon: FileText,
      color: '#8b5cf6'
    }
  ];

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
          Reports Action Center
        </h1>
        <p 
          className="text-base md:text-lg max-w-3xl mx-auto"
          style={{ 
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Export hub and workflow management for executive consumption
        </p>
      </div>

      {/* Export Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportTemplates.map((template, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl border p-6"
            style={{ borderColor: '#e2e8f0' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${template.color}20` }}
              >
                <template.icon className="w-6 h-6" style={{ color: template.color }} />
              </div>
              <div className="flex-1">
                <h3 
                  className="text-lg mb-2"
                  style={{ 
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                >
                  {template.name}
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ 
                    color: '#64748b',
                    lineHeight: 1.5
                  }}
                >
                  {template.description}
                </p>
                <button 
                  className="px-4 py-2 rounded-md text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  style={{ backgroundColor: template.color }}
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scheduled Audits */}
      <motion.div
        className="bg-white rounded-xl border p-6"
        style={{ borderColor: '#e2e8f0' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6" style={{ color: '#d4a574' }} />
          <h2 
            className="text-lg"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            Scheduled Audits
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
            <div>
              <div className="font-medium" style={{ color: '#0f172a' }}>Q1 2025 Portfolio Review</div>
              <div className="text-sm" style={{ color: '#64748b' }}>January 15, 2025</div>
            </div>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: '#22c55e',
                color: 'white',
                fontWeight: 500
              }}
            >
              SCHEDULED
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
            <div>
              <div className="font-medium" style={{ color: '#0f172a' }}>Q2 2025 Competitive Analysis</div>
              <div className="text-sm" style={{ color: '#64748b' }}>April 15, 2025</div>
            </div>
            <Badge 
              className="text-xs"
              style={{ 
                backgroundColor: '#f59e0b',
                color: 'white',
                fontWeight: 500
              }}
            >
              PENDING APPROVAL
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Report Archive */}
      <motion.div
        className="bg-white rounded-xl border p-6"
        style={{ borderColor: '#e2e8f0' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Archive className="w-6 h-6" style={{ color: '#d4a574' }} />
          <h2 
            className="text-lg"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            Report Archive
          </h2>
        </div>
        
        <div className="text-center py-8">
          <Archive className="w-12 h-12 mx-auto mb-4" style={{ color: '#94a3b8' }} />
          <p style={{ color: '#64748b' }}>Historical reports will appear here</p>
        </div>
      </motion.div>
    </div>
  );
}
