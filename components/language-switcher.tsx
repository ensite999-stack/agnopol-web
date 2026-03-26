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

export default function LanguageSwitcher({
  size = 'compact',
  fullWidth = false,
}: Props) {
  const { lang, setLang } = useI18n()

  const currentLang = useMemo<LangCode>(() => {
    return LANGUAGE_OPTIONS.some((item) => item.value === lang)
      ? (lang as LangCode)
      : 'en'
  }, [lang])

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLang(event.target.value as LangCode)
  }

  const isHero = size === 'hero'
  const wrapperWidth = fullWidth
    ? '100%'
    : isHero
      ? 'min(100%, 320px)'
      : 'min(100%, 196px)'

  const controlHeight = isHero ? 52 : 40
  const padding = isHero ? '0 44px 0 18px' : '0 38px 0 14px'
  const fontSize = isHero ? 16 : 14

  return (
    <div
      style={{
        width: wrapperWidth,
        maxWidth: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
        }}
      >
        <select
          value={currentLang}
          onChange={handleChange}
          aria-label="Language"
          style={{
            width: '100%',
            height: controlHeight,
            padding,
            borderRadius: 999,
            border: '1px solid var(--border-soft)',
            background: 'var(--bg-card-soft)',
            color: 'var(--text-main)',
            fontSize,
            fontWeight: 800,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            boxShadow: 'var(--shadow-soft)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {LANGUAGE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: isHero ? 18 : 14,
            top: '50%',
            width: 0,
            height: 0,
            borderLeft: isHero ? '8px solid transparent' : '6px solid transparent',
            borderRight: isHero ? '8px solid transparent' : '6px solid transparent',
            borderTop: isHero
              ? '10px solid var(--text-soft)'
              : '8px solid var(--text-soft)',
            transform: 'translateY(-28%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
