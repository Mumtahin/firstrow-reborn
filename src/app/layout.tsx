import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
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
    default: 'FirstRow | Find your next jamaat nearby',
    template: '%s | FirstRow',
  },
  description: 'Find your next jamaat nearby',
  icons: {
    icon: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased`} style={{ colorScheme: 'light' }}>
      <body className="flex min-h-full w-full flex-col overflow-x-hidden bg-app-bg text-text-primary">{children}</body>
    </html>
  )
}
