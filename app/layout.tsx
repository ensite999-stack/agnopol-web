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

const themeInitScript = `
(function () {
  try {
    var root = document.documentElement;
    var dark = false;

    try {
      if (window.matchMedia) {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        var hour = new Date().getHours();
        dark = hour < 7 || hour >= 19;
      }
    } catch (e) {
      var h = new Date().getHours();
      dark = h < 7 || h >= 19;
    }

    var theme = dark ? 'dark' : 'light';
    root.dataset.theme = theme;
    root.dataset.themeMode = 'auto';
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
