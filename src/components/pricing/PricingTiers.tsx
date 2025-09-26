'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Globe, TrendingUp, BarChart3, Star, Zap, Building, Shield } from 'lucide-react'
import { createCheckoutSession } from '@/lib/stripe-client'

export const PricingTiers = () => {
  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Free Tier */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🆓 Free
          </CardTitle>
          <div className="text-3xl font-bold">£0<span className="text-lg text-gray-500">/month</span></div>
          <p className="text-sm text-gray-600">Perfect for trying out the platform</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-green-500" />
              3 evaluations per month
            </li>
            <li className="flex items-center">
              <Brain className="h-4 w-4 mr-2 text-green-500" />
              GPT-3.5 analysis
            </li>
            <li className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-green-500" />
              Basic 12-agent evaluation
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-green-500" />
              PDF reports
            </li>
            <li className="flex items-center text-gray-400">
              <Globe className="h-4 w-4 mr-2" />
              Real-time web data
            </li>
            <li className="flex items-center text-gray-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Advanced insights
            </li>
          </ul>
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </CardContent>
      </Card>

      {/* Pro Tier */}
      <Card className="relative border-2 border-blue-500 shadow-lg">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500">Most Popular</Badge>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💎 Index Pro
          </CardTitle>
          <div className="text-3xl font-bold">£29<span className="text-lg text-gray-500">/month</span></div>
          <p className="text-sm text-gray-600">For professionals and growing businesses</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              25 evaluations per month
            </li>
            <li className="flex items-center">
              <Brain className="h-4 w-4 mr-2 text-blue-500" />
              GPT-4 enhanced analysis
            </li>
            <li className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-blue-500" />
              Perplexity AI web search
            </li>
            <li className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Advanced reporting
            </li>
            <li className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
              Competitive intelligence
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-blue-500" />
              Priority support
            </li>
          </ul>
          <Button 
            className="w-full"
            onClick={async () => {
              try {
                await createCheckoutSession('pro')
              } catch (error) {
                console.error('Error starting checkout:', error)
                alert('Unable to start checkout. Please try again.')
              }
            }}
          >
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>

      {/* Enterprise Tier */}
      <Card className="relative">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏢 Enterprise
          </CardTitle>
          <div className="text-3xl font-bold">£199<span className="text-lg text-gray-500">/month</span></div>
          <p className="text-sm text-gray-600">For large organizations and agencies</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-purple-500" />
              Unlimited evaluations
            </li>
            <li className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-purple-500" />
              Full API access
            </li>
            <li className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-purple-500" />
              Custom integrations
            </li>
            <li className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-purple-500" />
              White-label options
            </li>
            <li className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
              Dedicated support
            </li>
            <li className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
              Custom reporting
            </li>
          </ul>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/contact'}
          >
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
