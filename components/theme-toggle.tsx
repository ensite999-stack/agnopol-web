'use client'

import { useMemo } from 'react'
import { useI18n } from './language-provider'
import { useThemeMode, type ThemeMode } from './theme-provider'

const LABELS: Record<
  string,
  {
    title: string
    light: string
    dark: string
  }
> = {
  de: { title: 'Modus', light: 'Tag', dark: 'Nacht' },
  en: { title: 'Mode', light: 'Day', dark: 'Night' },
  es: { title: 'Modo', light: 'Día', dark: 'Noche' },
  fr: { title: 'Mode', light: 'Jour', dark: 'Nuit' },
  ja: { title: 'モード', light: 'ライト', dark: 'ダーク' },
  ko: { title: '모드', light: '주간', dark: '야간' },
  'zh-cn': { title: '模式', light: '日间', dark: '夜间' },
  'zh-tw': { title: '模式', light: '日間', dark: '夜間' },
}

export default function ThemeToggle() {
  const { lang } = useI18n()
  const { mode, setMode } = useThemeMode()

  const text = useMemo(() => LABELS[lang] || LABELS.en, [lang])

  const items: Array<{ value: ThemeMode; label: string }> = [
    { value: 'light', label: text.light },
    { value: 'dark', label: text.dark },
  ]

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-soft)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          lineHeight: 1.2,
        }}
      >
        {text.title}
      </div>

      <div
        style={{
          width: '100%',
          padding: 4,
          borderRadius: 999,
          border: '1px solid var(--border-soft)',
          background: 'var(--segmented-bg)',
          boxShadow: 'var(--shadow-soft)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 4,
        }}
      >
        {items.map((item) => {
          const active = item.value === mode

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              aria-pressed={active}
              style={{
                minHeight: 34,
                borderRadius: 999,
                border: '1px solid transparent',
                background: active ? 'var(--segment-active-bg)' : 'transparent',
                color: active ? 'var(--segment-active-text)' : 'var(--text-main)',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: active ? 'var(--segment-active-shadow)' : 'none',
                WebkitTapHighlightColor: 'transparent',
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
