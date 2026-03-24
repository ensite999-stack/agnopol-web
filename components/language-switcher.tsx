'use client'

import { ChangeEvent, useMemo } from 'react'
import { useI18n } from './language-provider'
import { type LangCode } from '../lib/i18n'

const LANGUAGE_OPTIONS: Array<{ value: LangCode; label: string }> = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh-cn', label: '简体中文' },
  { value: 'zh-tw', label: '繁體中文' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  const currentLang = useMemo(() => {
    return LANGUAGE_OPTIONS.some((item) => item.value === lang) ? lang : 'en'
  }, [lang])

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLang(event.target.value as LangCode)
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
          width: auto;
          min-width: 116px;
          max-width: 180px;
        }

        .language-switcher select {
          width: 100%;
          min-width: 116px;
          height: 40px;
          box-sizing: border-box;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.92);
          color: #334155;
          font-size: 13px;
          font-weight: 800;
          padding: 0 34px 0 14px;
          outline: none;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #475569 50%),
            linear-gradient(135deg, #475569 50%, transparent 50%);
          background-position:
            calc(100% - 18px) calc(50% - 3px),
            calc(100% - 13px) calc(50% - 3px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          transition: all 0.16s ease;
        }

        .language-switcher select:hover {
          background-color: #ffffff;
          border-color: rgba(15, 23, 42, 0.18);
        }

        .language-switcher select:focus {
          border-color: rgba(7, 27, 87, 0.22);
          box-shadow:
            0 8px 20px rgba(15, 23, 42, 0.06),
            0 0 0 4px rgba(7, 27, 87, 0.08);
        }

        @media (max-width: 640px) {
          .language-switcher {
            min-width: 108px;
            max-width: 156px;
          }

          .language-switcher select {
            min-width: 108px;
            height: 38px;
            font-size: 12px;
            padding: 0 30px 0 12px;
            background-position:
              calc(100% - 16px) calc(50% - 3px),
              calc(100% - 11px) calc(50% - 3px);
          }
        }
      `}</style>
    </div>
  )
}
