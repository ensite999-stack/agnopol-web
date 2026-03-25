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
export type ThemeMode = 'auto' | 'light' | 'dark'

type ThemeContextValue = {
  effectiveTheme: EffectiveTheme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function getStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto'

  try {
    const saved = localStorage.getItem('agnopol-theme-mode')
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved
    }
  } catch {
    // ignore
  }

  return 'auto'
}

function resolveTheme(mode: ThemeMode): EffectiveTheme {
  if (mode === 'light') return 'light'
  if (mode === 'dark') return 'dark'
  return getSystemTheme()
}

function applyTheme(mode: ThemeMode) {
  const theme = resolveTheme(mode)
  const root = document.documentElement

  root.dataset.themeMode = mode
  root.dataset.theme = theme
  root.style.colorScheme = theme

  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('auto')
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialMode = getStoredMode()
    setModeState(initialMode)
    setEffectiveTheme(applyTheme(initialMode))

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')

    const syncAutoMode = () => {
      setModeState((currentMode) => {
        if (currentMode !== 'auto') return currentMode
        setEffectiveTheme(applyTheme('auto'))
        return currentMode
      })
    }

    const handleMediaChange = () => syncAutoMode()
    const handlePageShow = () => syncAutoMode()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAutoMode()
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
    }
  }, [])

  function setMode(nextMode: ThemeMode) {
    setModeState(nextMode)
    setEffectiveTheme(applyTheme(nextMode))

    try {
      localStorage.setItem('agnopol-theme-mode', nextMode)
    } catch {
      // ignore
    }
  }

  const value = useMemo(
    () => ({
      effectiveTheme,
      mode,
      setMode,
    }),
    [effectiveTheme, mode]
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
