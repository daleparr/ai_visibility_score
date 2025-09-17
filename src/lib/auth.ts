import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

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
  providers: buildProviders(),
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Add user ID to session
        (session.user as any).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to check if authentication is properly configured
export const isAuthConfigured = () => {
  return process.env.NEXTAUTH_SECRET &&
         process.env.NEXTAUTH_URL &&
         buildProviders().length > 0
}