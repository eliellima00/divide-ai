import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Racha - Divida a conta do bar',
  description:
    'Escaneie a comanda, cada um marca o que consumiu e o app calcula a taxa do garçom e o couvert automaticamente. Funciona offline.',
  generator: 'v0.app',
  applicationName: 'Racha',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Racha',
  },
  icons: {
    icon: [{ url: '/icon-192.png', type: 'image/png' }],
    apple: [{ url: '/icon-192.png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1a17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="antialiased font-sans">
        {children}
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
