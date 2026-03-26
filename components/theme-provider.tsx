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

export type ThemeMode = 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

type ThemeModeContextValue = {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (nextMode: ThemeMode) => void
}

const STORAGE_KEY = 'agnopol-theme-mode-v4'

const THEME_COLOR = {
  light: '#f5f5f7',
  dark: '#0b0d12',
} as const

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'light'
  } catch {
    return 'light'
  }
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.setAttribute('data-theme-mode', mode)
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = mode

  const meta = document.getElementById('agnopol-theme-color')
  if (meta) {
    meta.setAttribute('content', THEME_COLOR[mode])
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light')

  useEffect(() => {
    const initialMode = getStoredMode()
    setModeState(initialMode)
    applyTheme(initialMode)
  }, [])

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode)
    applyTheme(nextMode)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode)
    } catch {
      // ignore storage failure
    }
  }, [])

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      mode,
      resolvedTheme: mode,
      setMode,
    }),
    [mode, setMode]
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
