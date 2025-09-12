import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Visibility Score - Brand AI Discoverability Platform',
  description: 'Evaluate how your brand appears in AI-powered search and recommendation systems. Get actionable insights to improve your AI visibility.',
  keywords: 'AI visibility, brand discoverability, AI SEO, machine learning, brand analysis',
  authors: [{ name: 'AI Visibility Score Team' }],
  creator: 'AI Visibility Score',
  publisher: 'AI Visibility Score',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Visibility Score - Brand AI Discoverability Platform',
    description: 'Evaluate how your brand appears in AI-powered search and recommendation systems.',
    url: '/',
    siteName: 'AI Visibility Score',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Visibility Score Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Score - Brand AI Discoverability Platform',
    description: 'Evaluate how your brand appears in AI-powered search and recommendation systems.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          {children}
        </div>
      </body>
    </html>
  )
}