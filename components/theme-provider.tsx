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

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getTimeBasedTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'
  const hour = new Date().getHours()
  return hour >= 7 && hour < 19 ? 'light' : 'dark'
}

function resolveAutoTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'

  try {
    if (window.matchMedia) {
      return getSystemTheme()
    }
  } catch {
    // ignore
  }

  return getTimeBasedTheme()
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyTheme = () => {
      const nextTheme = resolveAutoTheme()
      setEffectiveTheme(nextTheme)
      document.documentElement.dataset.theme = nextTheme
      document.documentElement.dataset.themeMode = 'auto'
    }

    applyTheme()

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      applyTheme()
    }

    media.addEventListener?.('change', handleSystemChange)

    const timer = window.setInterval(() => {
      applyTheme()
    }, 60 * 1000)

    return () => {
      media.removeEventListener?.('change', handleSystemChange)
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
