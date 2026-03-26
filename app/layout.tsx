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
    var STORAGE_KEY = 'agnopol-theme-mode-v2';
    var LIGHT_COLOR = '#f6f8fc';
    var DARK_COLOR = '#0b1020';

    var root = document.documentElement;
    var meta = document.getElementById('agnopol-theme-color');

    function isMode(value) {
      return value === 'auto' || value === 'light' || value === 'dark';
    }

    function readMode() {
      try {
        var stored = window.localStorage.getItem(STORAGE_KEY);
        return isMode(stored) ? stored : 'auto';
      } catch (e) {
        return 'auto';
      }
    }

    function getSystemTheme() {
      try {
        return window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } catch (e) {
        return 'light';
      }
    }

    var mode = readMode();
    var theme =
      mode === 'light'
        ? 'light'
        : mode === 'dark'
          ? 'dark'
          : getSystemTheme();

    root.setAttribute('data-theme-mode', mode);
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? DARK_COLOR : LIGHT_COLOR);
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
        <meta id="agnopol-theme-color" name="theme-color" content="#f6f8fc" />
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
