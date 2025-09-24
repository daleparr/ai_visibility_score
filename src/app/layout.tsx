import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Discoverability Index - The Standard for AI Discoverability',
  description: 'The definitive framework for measuring and optimizing your brand\'s AI discoverability. Get your AIDI score and master AI visibility.',
  keywords: 'AI discoverability index, AIDI, AI visibility, brand analysis, AI SEO, AI discoverability',
  authors: [{ name: 'Dale Parr, Creator of AI Discoverability Index' }],
  creator: 'AI Discoverability Index',
  publisher: 'AI Discoverability Index',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'AI Discoverability Index - The Standard for AI Discoverability',
    description: 'Master your brand\'s AI discoverability with the AI Discoverability Index framework.',
    url: '/',
    siteName: 'AI Discoverability Index',
    images: [
      {
        url: '/favicon.ico',
        width: 32,
        height: 32,
        alt: 'AI Discoverability Index - AIDI Framework',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Discoverability Index - The Standard for AI Discoverability',
    description: 'Master your brand\'s AI discoverability with the AI Discoverability Index framework.',
    images: ['/favicon.ico'],
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
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}