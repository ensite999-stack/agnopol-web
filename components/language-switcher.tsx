'use client'

import { ChangeEvent, useMemo } from 'react'
import { useI18n } from './language-provider'
import { type LangCode } from '../lib/i18n'

type Props = {
  size?: 'compact' | 'hero'
  fullWidth?: boolean
}

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

export default function LanguageSwitcher({ size = 'compact', fullWidth = false }: Props) {
  const { lang, setLang } = useI18n()

  const currentLang = useMemo(() => {
    return LANGUAGE_OPTIONS.some((item) => item.value === lang) ? lang : 'en'
  }, [lang])

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLang(event.target.value as LangCode)
  }

  return (
    <div className={`language-switcher ${size === 'hero' ? 'hero' : 'compact'} ${fullWidth ? 'full' : ''}`}>
      <select value={currentLang} onChange={handleChange} aria-label="Language selector">
        {LANGUAGE_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        .language-switcher {
          width: ${fullWidth ? '100%' : size === 'hero' ? '100%' : '132px'};
          min-width: 0;
        }

        .language-switcher select {
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.92);
          color: #334155;
          font-weight: 800;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          transition: all 0.16s ease;
          background-image:
            linear-gradient(45deg, transparent 50%, #475569 50%),
            linear-gradient(135deg, #475569 50%, transparent 50%);
          background-position:
            calc(100% - 18px) calc(50% - 3px),
            calc(100% - 13px) calc(50% - 3px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }

        .language-switcher.compact select {
          height: 38px;
          padding: 0 32px 0 12px;
          font-size: 12px;
        }

        .language-switcher.hero select {
          height: 52px;
          padding: 0 36px 0 16px;
          font-size: 15px;
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
      `}</style>
    </div>
  )
}
