import type { Metadata } from 'next'
import { Inter, Poppins, Fredoka } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/providers/toast-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-fredoka',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Paws & Hearts Animal Sanctuary',
    default: 'Paws & Hearts Animal Sanctuary | Where every animal finds their forever home',
  },
  description: 'Find your perfect companion at Paws & Hearts Animal Sanctuary. We provide loving care for rescued animals and help them find their forever homes through our comprehensive adoption program.',
  keywords: [
    'animal sanctuary',
    'pet adoption',
    'dog adoption',
    'cat adoption',
    'animal rescue',
    'volunteer',
    'donate',
    'animal care',
    'forever home',
    'animal welfare'
  ],
  authors: [{ name: 'Paws & Hearts Animal Sanctuary' }],
  creator: 'Paws & Hearts Animal Sanctuary',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Paws & Hearts Animal Sanctuary',
    description: 'Where every animal finds their forever home. Adopt, volunteer, or donate to support our mission.',
    siteName: 'Paws & Hearts Animal Sanctuary',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Paws & Hearts Animal Sanctuary - Happy animals in our care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paws & Hearts Animal Sanctuary',
    description: 'Where every animal finds their forever home. Adopt, volunteer, or donate to support our mission.',
    images: ['/images/twitter-image.jpg'],
    creator: '@pawsandhearts',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d97828" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased sanctuary-gradient',
          inter.variable,
          poppins.variable,
          fredoka.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <div className="relative flex min-h-screen flex-col">
              <main className="flex-1">
                {children}
              </main>
            </div>
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}