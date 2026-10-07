import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/providers'
import { ReduxProvider } from './redux-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MoodFlix — What do you feel like watching?',
    template: '%s · MoodFlix',
  },
  description: 'Tell us how you feel. We’ll find the perfect movie for this moment.',
  applicationName: 'MoodFlix',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0b0d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-ink text-foreground antialiased">
        <ReduxProvider>
          <AppProviders>{children}</AppProviders>
        </ReduxProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
