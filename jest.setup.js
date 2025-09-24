require('@testing-library/jest-dom')

// Add Node.js polyfills for missing browser APIs
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}

// Add simple fetch mock for tests
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
    })
  )
}

// Add Request polyfill for Node.js environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.body = init.body || null
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  }
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'

// Global test utilities
global.mockConsole = () => {
  const originalConsole = { ...console }
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    console.log.mockRestore()
    console.warn.mockRestore()
    console.error.mockRestore()
  })
  return originalConsole
}

// Mock fetch for API calls
global.fetch = jest.fn()

// Setup for ADI testing
global.createMockADIResult = () => ({
  evaluationId: 'test-001',
  overallStatus: 'completed',
  agentResults: {
    'crawl_agent': {
      agentName: 'crawl_agent',
      status: 'completed',
      results: [
        {
          resultType: 'homepage_crawl',
          rawValue: 85,
          normalizedScore: 85,
          confidenceLevel: 0.9,
          evidence: { url: 'https://example.com' }
        }
      ],
      executionTime: 5000,
      metadata: { timestamp: new Date().toISOString() }
    }
  },
  totalExecutionTime: 45000,
  errors: [],
  warnings: []
})

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})