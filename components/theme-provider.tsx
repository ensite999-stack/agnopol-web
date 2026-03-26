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

const STORAGE_KEY = 'agnopol-theme-mode-v2'
const THEME_COLOR = {
  light: '#f6f8fc',
  dark: '#0b1020',
} as const

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

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  return getSystemTheme()
}

function applyTheme(mode: ThemeMode, resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.setAttribute('data-theme-mode', mode)
  root.setAttribute('data-theme', resolvedTheme)
  root.style.colorScheme = resolvedTheme

  const meta = document.getElementById('agnopol-theme-color')
  if (meta) {
    meta.setAttribute('content', THEME_COLOR[resolvedTheme])
  }
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
    applyTheme(initialMode, initialResolvedTheme)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const syncAutoTheme = () => {
      if (mode !== 'auto') {
        applyTheme(mode, resolveTheme(mode))
        return
      }

      const nextResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme((prev) =>
        prev === nextResolvedTheme ? prev : nextResolvedTheme
      )
      applyTheme('auto', nextResolvedTheme)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAutoTheme()
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return

      const nextMode = getStoredMode()
      const nextResolvedTheme = resolveTheme(nextMode)

      setModeState(nextMode)
      setResolvedTheme(nextResolvedTheme)
      applyTheme(nextMode, nextResolvedTheme)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncAutoTheme)
    } else {
      mediaQuery.addListener(syncAutoTheme)
    }

    window.addEventListener('pageshow', syncAutoTheme)
    window.addEventListener('focus', syncAutoTheme)
    window.addEventListener('storage', handleStorage)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    syncAutoTheme()

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncAutoTheme)
      } else {
        mediaQuery.removeListener(syncAutoTheme)
      }

      window.removeEventListener('pageshow', syncAutoTheme)
      window.removeEventListener('focus', syncAutoTheme)
      window.removeEventListener('storage', handleStorage)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hydrated, mode])

  const setMode = useCallback((nextMode: ThemeMode) => {
    const nextResolvedTheme = resolveTheme(nextMode)

    setModeState(nextMode)
    setResolvedTheme(nextResolvedTheme)
    applyTheme(nextMode, nextResolvedTheme)

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

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider')
  }

  return context
}
