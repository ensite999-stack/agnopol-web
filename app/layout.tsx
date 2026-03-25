import './globals.css'
import { LanguageProvider } from '../components/language-provider'
import { ThemeProvider } from '../components/theme-provider'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Agnopol',
  description: 'One world, one breath.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
