import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ThemeProvider from '@/components/ThemeProvider'
import InstallBanner from '@/components/InstallBanner'
import PwaTracker from '@/components/PwaTracker'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Mosque Jamaat Times Near You | FirstRow',
    template: '%s | FirstRow',
  },
  description: 'Find the nearest mosque and see live jamaat times with countdowns. Updated daily for Tower Hamlets, East London and nearby areas.',
  verification: {
    google: 'ZtenvBj_BmE6553N6CTdAQcxcsftKK-hbF_HwMKyOFU',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FirstRow',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full w-full flex-col overflow-x-hidden bg-app-bg text-text-primary">
        <ThemeProvider>
          {children}
          <InstallBanner />
        </ThemeProvider>
        <PwaTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
