'use client'

import { ChangeEvent, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from './language-provider'

const LANGUAGE_OPTIONS = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' },
  { value: 'zh-cn', label: '简体中文' },
  { value: 'zh-tw', label: '繁體中文' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang } = useI18n()

  const currentLang = useMemo(() => {
    return LANGUAGE_OPTIONS.some((item) => item.value === lang) ? lang : 'en'
  }, [lang])

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLang = event.target.value
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('lang', nextLang)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="language-switcher">
      <select value={currentLang} onChange={handleChange} aria-label="Language selector">
        {LANGUAGE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        .language-switcher {
          width: 100%;
          min-width: 0;
        }

        .language-switcher select {
          width: 100%;
          min-width: 0;
          min-height: 56px;
          box-sizing: border-box;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: #ffffff;
          color: #4b5563;
          font-size: 16px;
          font-weight: 800;
          padding: 0 46px 0 20px;
          outline: none;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #4b5563 50%),
            linear-gradient(135deg, #4b5563 50%, transparent 50%);
          background-position:
            calc(100% - 24px) calc(50% - 3px),
            calc(100% - 18px) calc(50% - 3px);
          background-size: 7px 7px, 7px 7px;
          background-repeat: no-repeat;
          transition: all 0.16s ease;
        }

        .language-switcher select:focus {
          border-color: rgba(7, 27, 87, 0.24);
          box-shadow:
            0 12px 28px rgba(15, 23, 42, 0.06),
            0 0 0 4px rgba(7, 27, 87, 0.08);
        }
      `}</style>
    </div>
  )
}
