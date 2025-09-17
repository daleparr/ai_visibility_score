import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
  metadataBase: new URL('https://ai-discoverability-index.netlify.app'),
  openGraph: {
    title: 'AI Discoverability Index - The Standard for AI Discoverability',
    description: 'Master your brand\'s AI discoverability with the AI Discoverability Index framework.',
    url: '/',
    siteName: 'AI Discoverability Index',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
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