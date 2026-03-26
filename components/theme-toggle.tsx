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

export default function ThemeToggle() {
  const { lang } = useI18n()
  const { mode, setMode } = useThemeMode()

  const text = useMemo(() => LABELS[lang] || LABELS.en, [lang])

  const items: Array<{ value: ThemeMode; label: string }> = [
    { value: 'auto', label: text.auto },
    { value: 'light', label: text.light },
    { value: 'dark', label: text.dark },
  ]

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <div
        style={{
          marginBottom: 6,
          textAlign: 'center',
          color: 'var(--text-soft)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1.1,
        }}
      >
        {text.title}
      </div>

      <div
        role="tablist"
        aria-label={text.title}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 6,
          padding: 6,
          borderRadius: 999,
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-card-soft)',
          boxShadow: 'var(--shadow-soft)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {items.map((item) => {
          const active = item.value === mode

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item.value)}
              style={{
                minHeight: 34,
                padding: '0 6px',
                borderRadius: 999,
                border: '1px solid transparent',
                background: active ? 'var(--brand)' : 'transparent',
                color: active ? 'var(--brand-contrast)' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition:
                  'background 0.16s ease, color 0.16s ease, transform 0.16s ease',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
