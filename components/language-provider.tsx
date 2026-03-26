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
import { usePathname } from 'next/navigation'
import {
  LANG_STORAGE_KEY,
  dictionaries,
  normalizeLang,
  type LangCode,
  type Messages,
} from '../lib/i18n'

type LanguageContextValue = {
  lang: LangCode
  t: Messages
  setLang: (lang: LangCode) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function setDocumentLang(lang: LangCode) {
  if (typeof document === 'undefined') return

  const map: Record<LangCode, string> = {
    de: 'de',
    en: 'en',
    es: 'es',
    fr: 'fr',
    ja: 'ja',
    ko: 'ko',
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
  }

  document.documentElement.lang = map[lang]
}

function syncUrlLang(lang: LangCode) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.set('lang', lang)
  window.history.replaceState({}, '', url.toString())
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [lang, setLangState] = useState<LangCode>('en')

  const applyLang = useCallback((nextLang: LangCode, syncUrl = true) => {
    setLangState(nextLang)

    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang)
    }

    setDocumentLang(nextLang)

    if (syncUrl) {
      syncUrlLang(nextLang)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const rawUrlLang = url.searchParams.get('lang')
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY)

    const resolved = rawUrlLang
      ? normalizeLang(rawUrlLang)
      : storedLang
      ? normalizeLang(storedLang)
      : 'en'

    applyLang(resolved, true)
  }, [pathname, applyLang])

  const setLang = useCallback(
    (nextLang: LangCode) => {
      applyLang(nextLang, true)
    },
    [applyLang]
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      t: dictionaries[lang],
      setLang,
    }),
    [lang, setLang]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useI18n must be used within LanguageProvider')
  }
  return ctx
}
