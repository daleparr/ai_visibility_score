import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from './db'

// Build providers array based on available configuration
const buildProviders = () => {
  const providers = []
  
  // Only add Google provider if credentials are configured
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }
  
  return providers
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: buildProviders(),
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        // Add user ID to session from database user
        (session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to check if authentication is properly configured
export const isAuthConfigured = () => {
  return process.env.NEXTAUTH_SECRET &&
         process.env.NEXTAUTH_URL &&
         buildProviders().length > 0
}