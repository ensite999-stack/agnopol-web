'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'auto' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

type ThemeModeContextValue = {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (nextMode: ThemeMode) => void
}

const STORAGE_KEY = 'agnopol-theme-mode'

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  return getSystemTheme()
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const initialMode = getStoredMode()
    const initialResolvedTheme = resolveTheme(initialMode)

    setModeState(initialMode)
    setResolvedTheme(initialResolvedTheme)
    applyTheme(initialResolvedTheme)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleSystemChange() {
      setModeState((currentMode) => {
        if (currentMode !== 'auto') return currentMode

        const nextResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(nextResolvedTheme)
        applyTheme(nextResolvedTheme)
        return currentMode
      })
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange)
      return () => mediaQuery.removeEventListener('change', handleSystemChange)
    }

    mediaQuery.addListener(handleSystemChange)
    return () => mediaQuery.removeListener(handleSystemChange)
  }, [hydrated])

  const setMode = useCallback((nextMode: ThemeMode) => {
    const nextResolvedTheme = resolveTheme(nextMode)

    setModeState(nextMode)
    setResolvedTheme(nextResolvedTheme)
    applyTheme(nextResolvedTheme)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode)
    } catch {
      // ignore storage failure
    }
  }, [])

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode,
    }),
    [mode, resolvedTheme, setMode]
  )

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider')
  }

  return context
}
