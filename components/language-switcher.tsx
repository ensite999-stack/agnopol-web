'use client'

import { useMemo } from 'react'
import { useI18n } from './language-provider'
import { useThemeMode, type ThemeMode } from './theme-provider'

const LABELS: Record<
  string,
  {
    title: string
    auto: string
    light: string
    dark: string
  }
> = {
  de: { title: 'Modus', auto: 'Auto', light: 'Hell', dark: 'Dunkel' },
  en: { title: 'Mode', auto: 'Auto', light: 'Light', dark: 'Dark' },
  es: { title: 'Modo', auto: 'Auto', light: 'Claro', dark: 'Oscuro' },
  fr: { title: 'Mode', auto: 'Auto', light: 'Clair', dark: 'Sombre' },
  ja: { title: 'モード', auto: '自動', light: 'ライト', dark: 'ダーク' },
  ko: { title: '모드', auto: '자동', light: '라이트', dark: '다크' },
  'zh-cn': { title: '模式', auto: '自动', light: '浅色', dark: '深色' },
  'zh-tw': { title: '模式', auto: '自動', light: '淺色', dark: '深色' },
}

export default function ThemeSwitcher() {
  const { lang } = useI18n()
  const { mode, setMode } = useThemeMode()

  const text = useMemo(() => LABELS[lang] || LABELS.en, [lang])

  const items: Array<{ value: ThemeMode; label: string }> = [
    { value: 'auto', label: text.auto },
    { value: 'light', label: text.light },
    { value: 'dark', label: text.dark },
  ]

  return (
    <div className="theme-switcher">
      <div className="theme-switcher-label">{text.title}</div>

      <div className="theme-switcher-tabs">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMode(item.value)}
            className={`theme-switcher-btn ${mode === item.value ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
