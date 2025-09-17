import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, FileText, Code, Lightbulb } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
              <p className="text-gray-600 mt-1">Learn how to use the AI Discoverability Index</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Start */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Getting Started</CardTitle>
                </div>
                <CardDescription>
                  Learn the basics of AI discoverability evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Understand how AI models discover and rank your brand content across different platforms.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/evaluate">
                    Start Evaluation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">API Reference</CardTitle>
                </div>
                <CardDescription>
                  Integrate ADI into your workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Use our REST API to automate brand evaluations and integrate with your existing tools.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">Best Practices</CardTitle>
                </div>
                <CardDescription>
                  Optimize your AI discoverability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Learn proven strategies to improve your brand's visibility across AI platforms.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Framework Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ADI Framework</h2>
          <Card>
            <CardHeader>
              <CardTitle>9-Dimension Evaluation Framework</CardTitle>
              <CardDescription>
                Comprehensive assessment across Infrastructure, Perception, and Commerce pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Infrastructure (40%)</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schema & Structured Data</li>
                    <li>• Semantic Clarity</li>
                    <li>• Knowledge Graph Presence</li>
                    <li>• LLM Readability</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Perception (47%)</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Geographic Visibility</li>
                    <li>• Citation Strength</li>
                    <li>• AI Response Quality</li>
                    <li>• Brand Heritage</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Commerce (20%)</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Product Identification</li>
                    <li>• Recommendation Accuracy</li>
                    <li>• Transaction Clarity</li>
                    <li>• Competitive Positioning</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Evaluate your brand's AI discoverability in minutes
          </p>
          <Button size="lg" asChild>
            <Link href="/evaluate">
              Start Your Evaluation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}