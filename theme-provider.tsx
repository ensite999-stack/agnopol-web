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

export type ThemeMode = 'light' | 'dark' | 'system' | 'auto'
export type EffectiveTheme = 'light' | 'dark'

type ThemeContextValue = {
  mode: ThemeMode
  effectiveTheme: EffectiveTheme
  setMode: (mode: ThemeMode) => void
}

const STORAGE_KEY = 'agnopol-theme-mode'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getAutoTheme(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light'
  const hour = new Date().getHours()
  return hour >= 7 && hour < 19 ? 'light' : 'dark'
}

function resolveTheme(mode: ThemeMode): EffectiveTheme {
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  if (mode === 'system') return getSystemTheme()
  return getAutoTheme()
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light')

  const applyTheme = useCallback((nextMode: ThemeMode) => {
    const nextEffective = resolveTheme(nextMode)
    setEffectiveTheme(nextEffective)

    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextEffective
      document.documentElement.dataset.themeMode = nextMode
      document.documentElement.style.colorScheme = nextEffective
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const initialMode: ThemeMode =
      saved === 'light' || saved === 'dark' || saved === 'system' || saved === 'auto'
        ? saved
        : 'system'

    setModeState(initialMode)
    applyTheme(initialMode)
  }, [applyTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      applyTheme(mode)
    }

    media.addEventListener?.('change', handleSystemChange)

    const timer = window.setInterval(() => {
      if (mode === 'auto') {
        applyTheme('auto')
      }
    }, 60 * 1000)

    return () => {
      media.removeEventListener?.('change', handleSystemChange)
      window.clearInterval(timer)
    }
  }, [mode, applyTheme])

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      setModeState(nextMode)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, nextMode)
      }
      applyTheme(nextMode)
    },
    [applyTheme]
  )

  const value = useMemo(
    () => ({
      mode,
      effectiveTheme,
      setMode,
    }),
    [mode, effectiveTheme, setMode]
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
