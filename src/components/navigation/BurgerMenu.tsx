'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Menu, X, Brain, Home, FileText, DollarSign, BarChart3, Users, Phone, LogOut } from 'lucide-react'

export default function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleSignOut = async () => {
    setIsOpen(false)
    await signOut({ callbackUrl: '/' })
  }

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Features', href: '/#features', icon: FileText },
    { label: 'Pricing', href: '/#pricing', icon: DollarSign },
    { label: 'Leaderboards', href: '/leaderboards', icon: BarChart3 },
    { label: 'Blog', href: '/blog', icon: FileText },
    { label: 'About', href: '/about', icon: Users },
    { label: 'Contact', href: '/contact', icon: Phone },
  ]

  return (
    <>
      {/* Header with burger menu */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AI Discoverability Index</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/leaderboards" className="text-gray-600 hover:text-gray-900 transition-colors">
                Leaderboards
              </Link>
              {session && (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link href="/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </Link>
              )}
            </nav>

            {/* Mobile burger menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu}>
          <div 
            className="fixed right-0 top-16 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
                {session && (
                  <p className="text-sm text-gray-600 mt-1">
                    Welcome, {session.user?.name || session.user?.email}
                  </p>
                )}
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-6 py-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                  
                  {/* Dashboard link for authenticated users */}
                  {session && (
                    <li>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>

              {/* Bottom Action */}
              <div className="px-6 py-4 border-t border-gray-200">
                {session ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}