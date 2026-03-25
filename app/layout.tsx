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
    var savedMode = null;

    try {
      savedMode = localStorage.getItem('agnopol-theme-mode');
    } catch (e) {}

    var systemDark = false;
    try {
      systemDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch (e) {
      systemDark = false;
    }

    var mode = savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto'
      ? savedMode
      : 'auto';

    var theme = mode === 'light'
      ? 'light'
      : mode === 'dark'
        ? 'dark'
        : (systemDark ? 'dark' : 'light');

    root.dataset.themeMode = mode;
    root.dataset.theme = theme;
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
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
