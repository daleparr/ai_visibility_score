'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { 
  TrendingUp, 
  Award, 
  BarChart3, 
  Users, 
  Zap, 
  Shield,
  ArrowRight,
  Crown,
  Target,
  Globe
} from 'lucide-react';
import Link from 'next/link';

/**
 * ADI Dashboard - Premium AI Discoverability Index Features
 */
export default function ADIDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Discoverability Index</h1>
                  <p className="text-gray-600">Enterprise AI Visibility Intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                ADI v2.0
              </Badge>
              <Link href="/dashboard/adi/executive">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Zap className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to ADI 2.0</h2>
              <p className="text-blue-100 mb-4">
                Enhanced executive dashboard with advanced AI visibility insights and industry benchmarking
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Executive Snapshot
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Industry Benchmarks
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Competitive Analysis
                </div>
              </div>
            </div>
            <div className="text-right">
              <Link href="/dashboard/adi/executive">
                <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Executive Snapshot */}
          <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Crown className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Executive Snapshot</CardTitle>
                  <CardDescription>30-second status overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score Gauge</span>
                  <Badge variant="outline">Animated</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pillar Breakdown</span>
                  <span className="text-sm font-medium">3 Pillars</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verdict Line</span>
                  <span className="text-sm font-medium">Contextual</span>
                </div>
                <Link href="/dashboard/adi/executive">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Executive Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Industry Benchmarking */}
          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Industry Benchmarking</CardTitle>
                  <CardDescription>Compare against industry leaders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Your Percentile</span>
                  <Badge variant="outline">67th</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Industry Median</span>
                  <span className="text-sm font-medium">72/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top Performer</span>
                  <span className="text-sm font-medium">94/100</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Full Benchmark
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Analysis */}
          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Competitive Analysis</CardTitle>
                  <CardDescription>Track competitor performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">vs. Competitor A</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">+12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">vs. Competitor B</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">-5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Market Position</span>
                  <span className="text-sm font-medium">Above Average</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Analyze Competitors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ADI Framework Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              ADI 9-Dimension Framework
            </CardTitle>
            <CardDescription>
              Enterprise-grade evaluation across Infrastructure, Perception, and Commerce pillars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Infrastructure Pillar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-blue-900">Infrastructure (40%)</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Schema & Structured Data</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Semantic Clarity</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Knowledge Graphs</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LLM Readability</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>

              {/* Perception Pillar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-purple-900">Perception (47%)</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Geographic Visibility</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Answer Quality</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citation Authority</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reputation Signals</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>

              {/* Commerce Pillar */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-green-900">Commerce (20%)</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hero Products</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Policies & Logistics</span>
                    <span className="font-medium">8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="text-center">
          <Link href="/dashboard/adi/executive">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-3">
              <Crown className="h-5 w-5 mr-2" />
              Launch ADI Executive Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            Experience the enhanced AI discoverability intelligence platform
          </p>
        </div>
      </div>
    </div>
  );
}