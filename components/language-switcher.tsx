'use client'

import { languageOptions, type LangCode } from '../lib/i18n'
import { useI18n } from './language-provider'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div className="lang-switcher-wrap">
      <select
        aria-label={t.common.language}
        value={lang}
        onChange={(e) => setLang(e.target.value as LangCode)}
        className="lang-switcher"
      >
        {languageOptions.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  )
}
