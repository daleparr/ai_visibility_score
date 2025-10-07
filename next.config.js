/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Disable source maps in production for faster builds
  productionBrowserSourceMaps: false,
  // Ensure proper handling of environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://ai-visibility-score.netlify.app',
  },
  // Exclude Railway workers from Next.js compilation
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'railway-workers': 'railway-workers'
      })
    }
    
    // Exclude railway-workers directory from compilation
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /railway-workers\//,
      use: 'ignore-loader'
    })
    
    return config
  },
  // Exclude railway-workers from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Exclude railway-workers from the build
    outputFileTracingExcludes: {
      '*': ['./railway-workers/**/*'],
    },
  },
}

module.exports = nextConfig