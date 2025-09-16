'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Progress } from '../../../components/ui/progress';
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
  Globe,
  Brain,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Star,
  Medal,
  Trophy,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface ADIResult {
  success: boolean;
  adiScore: {
    overall: number;
    grade: string;
    confidenceInterval: number;
    reliabilityScore: number;
    pillars: Array<{
      pillar: string;
      score: number;
      weight: number;
      dimensions: Array<{
        dimension: string;
        score: number;
        confidenceInterval: number;
        evidence: any;
      }>;
    }>;
    industryPercentile?: number;
    globalRank?: number;
  };
  report: {
    executiveSummary: string;
    recommendationCount: number;
    methodology: string;
  };
  frameworkAnalysis: {
    expectedDimensions: number;
    foundDimensions: number;
    missingDimensions: string[];
    completeness: string;
  };
  benchmarking: {
    industryPercentile?: number;
    globalRank?: number;
  };
}

/**
 * AIDI Demo Dashboard - Interactive AI Discoverability Index Evaluation
 */
export default function ADIDemoPage() {
  const [websiteUrl, setWebsiteUrl] = useState('https://example-brand.com');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ADIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluation = async () => {
    if (!websiteUrl.trim()) return;
    
    setIsEvaluating(true);
    setError(null);
    setEvaluationResult(null);

    try {
      const response = await fetch('/api/test-adi');
      const data = await response.json();
      
      if (data.success) {
        setEvaluationResult(data);
      } else {
        setError(data.error || 'Evaluation failed');
      }
    } catch (err) {
      setError('Failed to connect to evaluation service');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'infrastructure': return 'text-blue-600 bg-blue-100';
      case 'perception': return 'text-purple-600 bg-purple-100';
      case 'commerce': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBadgesForScore = (score: number, rank?: number): Array<{
    name: string;
    icon: any;
    color: string;
    description: string;
  }> => {
    const badges = [];
    
    if (score >= 90) badges.push({
      name: 'AI Excellence',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Exceptional AI discoverability performance'
    });
    
    if (score >= 85) badges.push({
      name: 'AI Ready',
      icon: Star,
      color: 'text-blue-600 bg-blue-100',
      description: 'Optimized for AI discovery'
    });
    
    if (score >= 80) badges.push({
      name: 'Certified',
      icon: Award,
      color: 'text-green-600 bg-green-100',
      description: 'Meets ADI certification standards'
    });
    
    if (rank && rank <= 10) badges.push({
      name: 'Top 10 Performer',
      icon: Medal,
      color: 'text-purple-600 bg-purple-100',
      description: 'Top 10 in industry ranking'
    });
    
    if (score >= 70) badges.push({
      name: 'Discoverable',
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-100',
      description: 'Good AI discoverability foundation'
    });
    
    return badges;
  };

  const getCertificationLevel = (score: number): {
    level: string;
    color: string;
    description: string;
    validUntil: string;
  } => {
    if (score >= 90) return {
      level: 'AI Excellence Leader',
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      description: 'Exceptional AI discoverability across all dimensions',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
    
    if (score >= 80) return {
      level: 'AI Ready Certified',
      color: 'text-blue-600 bg-blue-100 border-blue-200',
      description: 'Optimized for AI discovery and recommendation systems',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
    
    if (score >= 70) return {
      level: 'AI Discoverable',
      color: 'text-green-600 bg-green-100 border-green-200',
      description: 'Good foundation for AI discoverability',
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };
    
    return {
      level: 'Improvement Needed',
      color: 'text-orange-600 bg-orange-100 border-orange-200',
      description: 'Significant opportunities for AI discoverability enhancement',
      validUntil: 'N/A'
    };
  };
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
                AIDI v2.0 Demo
              </Badge>
              <Link href="/demo">
                <Button variant="outline">Back to Demo</Button>
              </Link>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                View Executive Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Demo Notice */}
        <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">👑 AIDI Premium Demo</h2>
          <p className="text-purple-700">
            Experience the advanced AI Discoverability Index with enhanced executive dashboard, industry benchmarking, and competitive analysis features.
          </p>
        </div>

        {/* Welcome Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to AIDI 2.0</h2>
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
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Launch Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
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
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Executive Dashboard
                </Button>
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

        {/* Interactive Evaluation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-blue-600" />
              Live AIDI Evaluation
            </CardTitle>
            <CardDescription>
              Test the complete 10-dimension AI Discoverability Index evaluation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter website URL to evaluate..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    disabled={isEvaluating}
                  />
                </div>
                <Button
                  onClick={handleEvaluation}
                  disabled={isEvaluating || !websiteUrl.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run AIDI Evaluation
                    </>
                  )}
                </Button>
              </div>

              {isEvaluating && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running comprehensive AI discoverability analysis...</span>
                  </div>
                  <Progress value={75} className="w-full" />
                  <div className="text-xs text-gray-500">
                    Executing 11 specialized agents across 10 dimensions...
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Results */}
        {evaluationResult && (
          <>
            {/* Overall Score Card */}
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-blue-600" />
                    AIDI Evaluation Results
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Comprehensive AI discoverability analysis completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {evaluationResult.adiScore.overall || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Overall AIDI Score</div>
                    <Badge className={`${getGradeColor(evaluationResult.adiScore.grade)} border-0`}>
                      Grade {evaluationResult.adiScore.grade}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      ±{evaluationResult.adiScore.confidenceInterval}
                    </div>
                    <div className="text-sm text-gray-600">Confidence Interval</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {evaluationResult.frameworkAnalysis.completeness}
                    </div>
                    <div className="text-sm text-gray-600">Framework Complete</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      #{evaluationResult.benchmarking.globalRank || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Global Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pillar Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Pillar Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown across Infrastructure, Perception, and Commerce pillars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {evaluationResult.adiScore.pillars.map((pillar, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            pillar.pillar === 'infrastructure' ? 'bg-blue-500' :
                            pillar.pillar === 'perception' ? 'bg-purple-500' : 'bg-green-500'
                          }`}></div>
                          <h3 className="font-semibold capitalize">
                            {pillar.pillar} ({Math.round(pillar.weight * 100)}%)
                          </h3>
                        </div>
                        <Badge className={getPillarColor(pillar.pillar)}>
                          {pillar.score || 'N/A'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {pillar.dimensions.map((dimension, dimIndex) => (
                          <div key={dimIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              {dimension.dimension.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{dimension.score || 'N/A'}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  style={{ width: `${Math.min(100, (dimension.score || 0))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  AI-generated insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      {evaluationResult.report.executiveSummary}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{evaluationResult.report.recommendationCount} recommendations generated</span>
                    <span>Methodology: {evaluationResult.report.methodology.substring(0, 50)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certification & Badges Section */}
            <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  AIDI Certification & Achievement Badges
                </CardTitle>
                <CardDescription>
                  Earned certifications and performance badges based on your AIDI evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Certification Level */}
                  <div className="text-center p-6 border-2 border-dashed border-yellow-300 rounded-lg bg-white/50">
                    <div className="mb-4">
                      <Trophy className="h-12 w-12 mx-auto text-yellow-600 mb-2" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {getCertificationLevel(evaluationResult.adiScore.overall || 0).level}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getCertificationLevel(evaluationResult.adiScore.overall || 0).description}
                      </p>
                    </div>
                    <Badge className={`${getCertificationLevel(evaluationResult.adiScore.overall || 0).color} border-2 px-4 py-2 text-sm font-semibold`}>
                      Valid Until: {getCertificationLevel(evaluationResult.adiScore.overall || 0).validUntil}
                    </Badge>
                  </div>

                  {/* Achievement Badges */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Achievement Badges</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {getBadgesForScore(evaluationResult.adiScore.overall || 0, evaluationResult.benchmarking.globalRank).map((badge, index) => {
                        const IconComponent = badge.icon;
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                            <div className={`p-2 rounded-full ${badge.color}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{badge.name}</p>
                              <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {getBadgesForScore(evaluationResult.adiScore.overall || 0, evaluationResult.benchmarking.globalRank).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Medal className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No badges earned yet. Improve your AIDI score to unlock achievements!</p>
                      </div>
                    )}
                  </div>

                  {/* Report Actions */}
                  <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recommendations Section */}
            <Card className="mb-8 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Priority Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated action items to improve your discoverability score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock recommendations based on current score */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex-shrink-0">
                        <Badge className="bg-red-100 text-red-700 border-red-200">Priority 1</Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Improve Schema & Structured Data</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Add comprehensive JSON-LD markup to improve machine readability. Current score: 0/100
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Impact: High (+25 pts)</span>
                          <span>Effort: Medium</span>
                          <span>Category: Infrastructure</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex-shrink-0">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">Priority 2</Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Enhance Knowledge Graph Implementation</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Implement entity linking and knowledge graph markup. Current score: 4/100
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Impact: High (+20 pts)</span>
                          <span>Effort: High</span>
                          <span>Category: Infrastructure</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex-shrink-0">
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Priority 3</Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Optimize Geographic Visibility</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Improve local business schema and regional content. Current score: 25/100
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Impact: Medium (+15 pts)</span>
                          <span>Effort: Medium</span>
                          <span>Category: Perception</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4 border-t border-gray-200">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Target className="h-4 w-4 mr-2" />
                      View All {evaluationResult.report.recommendationCount} Recommendations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Framework Analysis */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Framework Analysis</CardTitle>
                <CardDescription>
                  Technical evaluation of the 10-dimension AIDI framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Dimensions</span>
                      <span className="font-medium">{evaluationResult.frameworkAnalysis.expectedDimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Found Dimensions</span>
                      <span className="font-medium">{evaluationResult.frameworkAnalysis.foundDimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completeness</span>
                      <Badge variant="outline">{evaluationResult.frameworkAnalysis.completeness}</Badge>
                    </div>
                  </div>
                  {evaluationResult.frameworkAnalysis.missingDimensions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Missing Dimensions:</h4>
                      <div className="space-y-1">
                        {evaluationResult.frameworkAnalysis.missingDimensions.map((dimension, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-1">
                            {dimension.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Updated ADI Framework Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              AIDI 10-Dimension Framework
            </CardTitle>
            <CardDescription>
              Complete enterprise-grade evaluation across Infrastructure, Perception, and Commerce pillars
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
                    <span>Semantic Clarity & Ontology</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Knowledge Graphs & Entity Linking</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LLM Readability & Conversational</span>
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
                    <span>Geographic Visibility & Presence</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Answer Quality & Presence</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citation Authority & Freshness</span>
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
                    <span>Hero Products & Use-Case</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Policies & Logistics Clarity</span>
                    <span className="font-medium">8%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg px-8 py-3"
              onClick={handleEvaluation}
              disabled={isEvaluating}
            >
              <Crown className="h-5 w-5 mr-2" />
              {isEvaluating ? 'Running Evaluation...' : 'Run Live AIDI Evaluation'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3"
              asChild
            >
              <Link href="/api/test-adi" target="_blank">
                <ExternalLink className="h-5 w-5 mr-2" />
                View API Response
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Experience the complete 10-dimension AI discoverability evaluation system
          </p>
        </div>
      </div>
    </div>
  );
}