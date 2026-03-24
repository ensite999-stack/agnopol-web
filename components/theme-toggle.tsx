'use client'

import { useThemeMode, type ThemeMode } from './theme-provider'

type Props = {
  size?: 'compact' | 'hero'
  fullWidth?: boolean
}

const labels: Record<string, Record<ThemeMode, string>> = {
  en: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    auto: 'Auto',
  },
  'zh-cn': {
    light: '日间',
    dark: '夜间',
    system: '跟随设备',
    auto: '自动',
  },
  'zh-tw': {
    light: '日間',
    dark: '夜間',
    system: '跟隨設備',
    auto: '自動',
  },
  ja: {
    light: 'ライト',
    dark: 'ダーク',
    system: '端末連動',
    auto: '自動',
  },
  ko: {
    light: '라이트',
    dark: '다크',
    system: '기기 연동',
    auto: '자동',
  },
  de: {
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    auto: 'Auto',
  },
  fr: {
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    auto: 'Auto',
  },
  es: {
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    auto: 'Auto',
  },
}

function getPageLang() {
  if (typeof window === 'undefined') return 'en'
  const params = new URLSearchParams(window.location.search)
  return params.get('lang') || 'en'
}

export default function ThemeToggle({ size = 'compact', fullWidth = false }: Props) {
  const { mode, setMode } = useThemeMode()
  const lang = getPageLang()
  const dict = labels[lang] || labels.en

  return (
    <div
      className={`theme-toggle ${size === 'hero' ? 'hero' : 'compact'} ${
        fullWidth ? 'full' : ''
      }`}
    >
      {(['light', 'dark', 'system', 'auto'] as ThemeMode[]).map((item) => (
        <button
          key={item}
          type="button"
          className={`theme-pill ${mode === item ? 'active' : ''}`}
          onClick={() => setMode(item)}
        >
          {dict[item]}
        </button>
      ))}

      <style jsx>{`
        .theme-toggle {
          display: grid;
          gap: 6px;
          padding: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          width: fit-content;
        }

        .theme-toggle.compact {
          grid-template-columns: repeat(4, auto);
        }

        .theme-toggle.hero {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          width: 100%;
        }

        .theme-toggle.full {
          width: 100%;
        }

        .theme-pill {
          min-height: ${size === 'hero' ? '52px' : '34px'};
          padding: 0 ${size === 'hero' ? '12px' : '10px'};
          border: none;
          border-radius: 999px;
          background: transparent;
          color: #475569;
          font-size: ${size === 'hero' ? '14px' : '12px'};
          font-weight: 800;
          transition: all 0.16s ease;
          white-space: nowrap;
        }

        .theme-pill.active {
          background: #071b57;
          color: #ffffff;
          box-shadow: 0 10px 22px rgba(7, 27, 87, 0.18);
        }

        @media (max-width: 640px) {
          .theme-toggle.hero {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  )
}
