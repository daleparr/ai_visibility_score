'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Menu, X, BarChart3, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HomePageHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-brand-600" />
            <span className="text-2xl font-bold gradient-text">
              AI Discoverability Index (AIDI)
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-brand-600 transition-colors">
              Pricing
            </Link>
            <Link href="/reports" className="text-gray-600 hover:text-brand-600 transition-colors">
              <span className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Industry Reports</span>
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">New</Badge>
              </span>
            </Link>
            <Link href="/leaderboards" className="text-gray-600 hover:text-brand-600 transition-colors">
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Leaderboards</span>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </span>
            </Link>
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/evaluate">Get Your Score</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#features"
                className="text-gray-600 hover:text-brand-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-brand-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/reports"
                className="text-gray-600 hover:text-brand-600 transition-colors py-2 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Industry Reports</span>
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">New</Badge>
              </Link>
              <Link
                href="/leaderboards"
                className="text-gray-600 hover:text-brand-600 transition-colors py-2 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Leaderboards</span>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/evaluate" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Your Score
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

