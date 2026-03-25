'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type EffectiveTheme = 'light' | 'dark'

type ThemeContextValue = {
  effectiveTheme: EffectiveTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getTimeBasedTheme(): EffectiveTheme {
  const hour = new Date().getHours()
  return hour >= 7 && hour < 19 ? 'light' : 'dark'
}

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return getTimeBasedTheme()
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return getTimeBasedTheme()
  }
}

function applyTheme(theme: EffectiveTheme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.dataset.themeMode = 'auto'
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncTheme = () => {
      const nextTheme = getSystemTheme()
      applyTheme(nextTheme)
      setEffectiveTheme(nextTheme)
    }

    syncTheme()

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const handleMediaChange = () => syncTheme()
    const handlePageShow = () => syncTheme()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTheme()
      }
    }

    if (media) {
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handleMediaChange)
      } else if (typeof media.addListener === 'function') {
        media.addListener(handleMediaChange)
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const timer = window.setInterval(syncTheme, 30000)

    return () => {
      if (media) {
        if (typeof media.removeEventListener === 'function') {
          media.removeEventListener('change', handleMediaChange)
        } else if (typeof media.removeListener === 'function') {
          media.removeListener(handleMediaChange)
        }
      }

      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(timer)
    }
  }, [])

  const value = useMemo(
    () => ({
      effectiveTheme,
    }),
    [effectiveTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider')
  }
  return context
}
