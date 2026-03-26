import './globals.css'
import './theme-overrides.css'

import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { LanguageProvider } from '../components/language-provider'
import { ThemeProvider } from '../components/theme-provider'

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
    var STORAGE_KEY = 'agnopol-theme-mode-v4';
    var LIGHT_COLOR = '#f5f5f7';
    var DARK_COLOR = '#0b0d12';

    var root = document.documentElement;
    var meta = document.getElementById('agnopol-theme-color');

    function isMode(value) {
      return value === 'light' || value === 'dark';
    }

    function readMode() {
      try {
        var stored = window.localStorage.getItem(STORAGE_KEY);
        return isMode(stored) ? stored : 'light';
      } catch (e) {
        return 'light';
      }
    }

    var mode = readMode();

    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;

    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? DARK_COLOR : LIGHT_COLOR);
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta id="agnopol-theme-color" name="theme-color" content="#f5f5f7" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>

      <body>
        <LanguageProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
