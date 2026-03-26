'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const text = useMemo(() => LABELS[lang] || LABELS.en, [lang])

  const items: Array<{ value: ThemeMode; label: string }> = [
    { value: 'auto', label: text.auto },
    { value: 'light', label: text.light },
    { value: 'dark', label: text.dark },
  ]

  const currentLabel =
    items.find((item) => item.value === mode)?.label || text.auto

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown, { passive: true })
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelect(nextMode: ThemeMode) {
    setMode(nextMode)
    setOpen(false)
  }

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
          lineHeight: 1.2,
        }}
      >
        {text.title}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={text.title}
        style={{
          width: '100%',
          minHeight: 38,
          padding: '0 12px',
          borderRadius: 999,
          border: '1px solid var(--border-soft)',
          background: 'var(--bg-card-soft)',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          fontSize: 14,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-soft)',
          backdropFilter: 'blur(10px)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span>{currentLabel}</span>

        <span
          aria-hidden="true"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid var(--text-soft)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.16s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {open ? (
        <div
          role="menu"
          style={{
            width: '100%',
            marginTop: 8,
            padding: 6,
            borderRadius: 16,
            border: '1px solid var(--border-soft)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-soft)',
            backdropFilter: 'blur(12px)',
            display: 'grid',
            gap: 6,
          }}
        >
          {items.map((item) => {
            const active = item.value === mode

            return (
              <button
                key={item.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => handleSelect(item.value)}
                style={{
                  minHeight: 36,
                  borderRadius: 12,
                  border: active
                    ? '1px solid transparent'
                    : '1px solid var(--border-soft)',
                  background: active ? 'var(--brand)' : 'var(--bg-card-soft)',
                  color: active ? 'var(--brand-contrast)' : 'var(--text-main)',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
