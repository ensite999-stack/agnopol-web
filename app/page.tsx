'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../components/language-provider'
import LanguageSwitcher from '../components/language-switcher'
import ThemeToggle from '../components/theme-toggle'
import { withLang } from '../lib/i18n'

type ProductType = 'premium' | 'stars'
type DurationType = '3m' | '6m' | '12m'

type PublicConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
  updated_at?: string
}

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
}

const NAV_UI: Record<
  string,
  {
    preparing: string
    redirecting: string
  }
> = {
  de: { preparing: 'Weiterleitung wird vorbereitet', redirecting: 'Weiterleitung zur Zahlungsseite...' },
  en: { preparing: 'Preparing your order', redirecting: 'Redirecting to payment page...' },
  es: { preparing: 'Preparando su pedido', redirecting: 'Redirigiendo a la página de pago...' },
  fr: { preparing: 'Préparation de votre commande', redirecting: 'Redirection vers la page de paiement...' },
  ja: { preparing: '注文を準備しています', redirecting: '支払いページへ移動中...' },
  ko: { preparing: '주문을 준비하는 중', redirecting: '결제 페이지로 이동 중...' },
  'zh-cn': { preparing: '正在准备订单', redirecting: '正在跳转到支付页...' },
  'zh-tw': { preparing: '正在準備訂單', redirecting: '正在跳轉到支付頁...' },
}

const HOME_FORM_ERRORS: Record<
  string,
  {
    username: string
    email: string
    emailInvalid: string
  }
> = {
  de: {
    username: 'Bitte geben Sie Ihren Telegram-Benutzernamen ein.',
    email: 'Bitte geben Sie Ihre E-Mail-Adresse ein.',
    emailInvalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
  },
  en: {
    username: 'Please enter your Telegram username.',
    email: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
  },
  es: {
    username: 'Por favor, introduzca su nombre de usuario de Telegram.',
    email: 'Por favor, introduzca su correo electrónico.',
    emailInvalid: 'Por favor, introduzca un correo electrónico válido.',
  },
  fr: {
    username: 'Veuillez saisir votre nom d’utilisateur Telegram.',
    email: 'Veuillez saisir votre e-mail.',
    emailInvalid: 'Veuillez saisir une adresse e-mail valide.',
  },
  ja: {
    username: 'Telegramユーザー名を入力してください。',
    email: 'メールアドレスを入力してください。',
    emailInvalid: '有効なメールアドレスを入力してください。',
  },
  ko: {
    username: 'Telegram 사용자명을 입력하세요.',
    email: '이메일을 입력하세요.',
    emailInvalid: '올바른 이메일 주소를 입력하세요.',
  },
  'zh-cn': {
    username: '请输入 TG 用户名。',
    email: '请输入邮箱地址。',
    emailInvalid: '请输入有效的邮箱地址。',
  },
  'zh-tw': {
    username: '請輸入 TG 用戶名。',
    email: '請輸入電子郵件地址。',
    emailInvalid: '請輸入有效的電子郵件地址。',
  },
}

const LOOKUP_ENTRY_UI: Record<
  string,
  {
    title: string
    subtitle: string
    button: string
  }
> = {
  de: {
    title: 'Bestehende Bestellung prüfen',
    subtitle:
      'Status prüfen, Systemhinweise ansehen oder Zahlungsnachweis erneut einreichen.',
    button: 'Bestellung suchen',
  },
  en: {
    title: 'Track order status',
    subtitle:
      'Check the latest progress, system feedback, or submit additional payment proof.',
    button: 'Track Order',
  },
  es: {
    title: 'Seguir estado del pedido',
    subtitle:
      'Consulte el progreso más reciente, los avisos del sistema o complete el comprobante de pago.',
    button: 'Seguir pedido',
  },
  fr: {
    title: 'Suivre le statut de la commande',
    subtitle:
      'Consultez la progression, les retours du système ou complétez la preuve de paiement.',
    button: 'Suivre la commande',
  },
  ja: {
    title: '注文状況を追跡',
    subtitle:
      '最新の進捗、システム案内、または支払い証明の補足を確認できます。',
    button: '注文を追跡',
  },
  ko: {
    title: '주문 상태 추적',
    subtitle:
      '최신 진행 상황, 시스템 안내 또는 결제 증빙 보완을 확인하세요.',
    button: '주문 추적',
  },
  'zh-cn': {
    title: '追踪订单状态',
    subtitle: '查看订单最新进度、系统反馈，或补充付款凭证。',
    button: '追踪订单',
  },
  'zh-tw': {
    title: '追蹤訂單狀態',
    subtitle: '查看訂單最新進度、系統回饋，或補充付款憑證。',
    button: '追蹤訂單',
  },
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function getHomeFormError(lang: string, key: 'username' | 'email' | 'emailInvalid') {
  const messages = HOME_FORM_ERRORS[lang] || HOME_FORM_ERRORS.en
  return messages[key]
}

function formatMoney(value: number) {
  const fixed = Number(value.toFixed(2))
  return Number.isInteger(fixed) ? String(fixed) : fixed.toFixed(2).replace(/\.?0+$/, '')
}

function HomePageInner() {
  const { lang, t } = useI18n()
  const navUi = NAV_UI[lang] || NAV_UI.en
  const lookupEntryUi = LOOKUP_ENTRY_UI[lang] || LOOKUP_ENTRY_UI.en

  const [tab, setTab] = useState<ProductType>('premium')
  const [duration, setDuration] = useState<DurationType>('12m')
  const [stars, setStars] = useState(50)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [configLoading, setConfigLoading] = useState(true)

  const [routingToPay, setRoutingToPay] = useState(false)
  const [formError, setFormError] = useState('')

  const startYear = 2026
  const currentYear = new Date().getFullYear()
  const copyrightText =
    currentYear > startYear
      ? `© ${startYear}–${currentYear} Agnopol. All rights reserved.`
      : `© ${startYear} Agnopol. All rights reserved.`

  useEffect(() => {
    let active = true

    async function loadConfig() {
      setConfigLoading(true)
      setConfigError('')

      try {
        const response = await fetch('/api/public/config', {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load config')
        }

        if (active && data?.item) {
          setConfig({
            premium_3m_price: Number(data.item.premium_3m_price ?? defaultConfig.premium_3m_price),
            premium_6m_price: Number(data.item.premium_6m_price ?? defaultConfig.premium_6m_price),
            premium_12m_price: Number(data.item.premium_12m_price ?? defaultConfig.premium_12m_price),
            stars_rate: Number(data.item.stars_rate ?? defaultConfig.stars_rate),
            trc20_address: String(data.item.trc20_address ?? defaultConfig.trc20_address),
            base_address: String(data.item.base_address ?? defaultConfig.base_address),
            updated_at: data.item.updated_at,
          })
        }
      } catch (error) {
        if (active) {
          setConfigError(error instanceof Error ? error.message : 'Failed to load config')
          setConfig(defaultConfig)
        }
      } finally {
        if (active) {
          setConfigLoading(false)
        }
      }
    }

    loadConfig()

    return () => {
      active = false
    }
  }, [])

  const safeStars = useMemo(() => {
    if (!Number.isFinite(stars)) return 50
    if (stars < 50) return 50
    return Math.floor(stars)
  }, [stars])

  const selectedPrice = useMemo(() => {
    if (tab === 'premium') {
      if (duration === '3m') return Number(config.premium_3m_price)
      if (duration === '6m') return Number(config.premium_6m_price)
      return Number(config.premium_12m_price)
    }

    return Number((safeStars * Number(config.stars_rate)).toFixed(2))
  }, [tab, duration, safeStars, config])

  const selectedTitle = useMemo(() => {
    if (tab === 'premium') {
      const durationText =
        duration === '3m' ? t.home.months3 : duration === '6m' ? t.home.months6 : t.home.months12
      return `${t.home.tgPremium} ${durationText}`
    }

    return `${t.home.tgStars} ${safeStars}`
  }, [tab, duration, safeStars, t])

  function goPay() {
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedUsername) {
      setFormError(getHomeFormError(lang, 'username'))
      return
    }

    if (!trimmedEmail) {
      setFormError(getHomeFormError(lang, 'email'))
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError(getHomeFormError(lang, 'emailInvalid'))
      return
    }

    setFormError('')

    const params = new URLSearchParams()
    params.set('lang', lang)
    params.set('username', trimmedUsername)
    params.set('email', trimmedEmail)
    params.set('price_usd', String(selectedPrice))

    if (tab === 'premium') {
      params.set('product_type', 'tg_premium')
      params.set('duration', duration)
    } else {
      params.set('product_type', 'tg_stars')
      params.set('stars_amount', String(safeStars))
    }

    setRoutingToPay(true)

    window.setTimeout(() => {
      window.location.href = `/pay?${params.toString()}`
    }, 420)
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <section className="hero-center hero-stack hero-stair-wrap">
          <h1 className="brand-title hero-step hero-step-1">{t.common.brand}</h1>
          <p className="brand-slogan hero-step hero-step-2">{t.common.slogan}</p>

          <div className="hero-stair hero-step hero-step-3">
            <div className="hero-tools">
              <LanguageSwitcher size="compact" />
            </div>

            <div className="hero-mode">
              <ThemeToggle />
            </div>
          </div>
        </section>

        <div className="segment-tabs">
          <button
            type="button"
            onClick={() => setTab('premium')}
            className={`segment-btn ${tab === 'premium' ? 'active' : ''}`}
          >
            {t.home.premiumTab}
          </button>

          <button
            type="button"
            onClick={() => setTab('stars')}
            className={`segment-btn ${tab === 'stars' ? 'active' : ''}`}
          >
            {t.home.starsTab}
          </button>
        </div>

        {configError ? <div className="status-box-error page-error-box">{configError}</div> : null}

        {tab === 'premium' ? (
          <>
            <p className="section-caption">{t.home.premiumPlans}</p>

            <div className="plan-grid">
              <div
                className={`card plan-card ${duration === '3m' ? 'active' : ''}`}
                onClick={() => setDuration('3m')}
              >
                <div className="plan-title">{t.home.months3}</div>
                <div className="plan-price">${formatMoney(Number(config.premium_3m_price))}</div>
              </div>

              <div
                className={`card plan-card ${duration === '6m' ? 'active' : ''}`}
                onClick={() => setDuration('6m')}
              >
                <div className="plan-title">{t.home.months6}</div>
                <div className="plan-price">${formatMoney(Number(config.premium_6m_price))}</div>
              </div>

              <div
                className={`card plan-card ${duration === '12m' ? 'active' : ''}`}
                onClick={() => setDuration('12m')}
              >
                <div className="plan-title">{t.home.months12}</div>
                <div className="plan-price">${formatMoney(Number(config.premium_12m_price))}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="section-caption">{t.home.starsPackage}</p>

            <div className="card single-box">
              <div className="field-title">{t.home.starsAmount}</div>
              <input
                type="number"
                min={50}
                step={1}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                placeholder={t.home.starsPlaceholder}
                className="input"
              />
              <div className="field-hint">{t.home.starsMinHint}</div>
              <div className="field-hint">{t.home.autoPriceHint}</div>
            </div>
          </>
        )}

        <div className="summary-box card-soft">
          <div className="small-muted summary-label">{t.home.currentSelection}</div>
          <div className="summary-title">{selectedTitle}</div>
          <div className="summary-price">${formatMoney(selectedPrice)}</div>
          {configLoading ? <div className="small-muted summary-loading">{t.common.loading}</div> : null}
        </div>

        <div className="form-stack">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (formError) setFormError('')
            }}
            placeholder={t.home.usernamePlaceholder}
            className="input"
            autoComplete="off"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (formError) setFormError('')
            }}
            placeholder={t.home.emailPlaceholder}
            className="input"
            autoComplete="email"
            inputMode="email"
          />

          {formError ? <div className="status-box-error">{formError}</div> : null}

          <button
            onClick={goPay}
            className="btn-primary"
            disabled={routingToPay}
            style={{ opacity: routingToPay ? 0.8 : 1 }}
          >
            {routingToPay ? navUi.redirecting : t.home.createOrder}
          </button>
        </div>

        <section className="lookup-entry-card card-soft">
          <div className="lookup-entry-header">
            <div className="lookup-entry-title">{lookupEntryUi.title}</div>
            <div className="small-muted lookup-entry-subtitle">{lookupEntryUi.subtitle}</div>
          </div>

          <a href={withLang('/lookup', lang)} className="btn-secondary link-button">
            {lookupEntryUi.button}
          </a>
        </section>

        <footer className="footer">
          <p>{copyrightText}</p>

          <p className="footer-email">
            <span className="footer-email-label">{t.common.officialEmail}:</span>{' '}
            <a href="mailto:hello@agnopol.com">hello@agnopol.com</a>
          </p>

          <div className="footer-links">
            <a href={withLang('/legal#terms', lang)}>{t.common.footerTerms}</a>
            <a href={withLang('/legal#privacy', lang)}>{t.common.footerPrivacy}</a>
            <a href={withLang('/legal#risk', lang)}>{t.common.footerRisk}</a>
          </div>
        </footer>
      </div>

      {routingToPay ? (
        <div className="route-overlay">
          <div className="route-card">
            <div className="route-spinner" />
            <div className="route-title">{navUi.preparing}</div>
            <div className="route-subtitle">{navUi.redirecting}</div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .site-shell {
          min-height: 100vh;
          padding: clamp(16px, 3vw, 28px) clamp(14px, 4vw, 24px) 36px;
          background:
            radial-gradient(circle at top, rgba(82, 110, 255, 0.07), transparent 36%),
            var(--bg-page, #f6f8fc);
        }

        .site-container {
          width: 100%;
          max-width: 820px;
          margin: 0 auto;
        }

        .card,
        .card-soft {
          border-radius: 28px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          backdrop-filter: blur(14px);
        }

        .card-soft {
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
        }

        .input {
          width: 100%;
          min-height: 50px;
          border-radius: 18px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, #fff);
          color: var(--text-main, #0a1736);
          padding: 0 16px;
          font-size: 15px;
          outline: none;
          box-sizing: border-box;
        }

        .input::placeholder {
          color: var(--text-soft, #7b8798);
        }

        .btn-primary,
        .btn-secondary,
        .segment-btn {
          appearance: none;
          border: 0;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            opacity 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .btn-primary:hover,
        .segment-btn:hover,
        .plan-card:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          font-size: 15px;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(11, 37, 112, 0.2);
        }

        .btn-secondary,
        .link-button {
          width: 100%;
          min-height: 50px;
          border-radius: 18px;
          background: rgba(11, 37, 112, 0.04);
          color: var(--brand, #0b2570);
          border: 1.5px solid var(--brand, #0b2570);
          font-size: 14px;
          font-weight: 800;
          box-shadow: none;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            border-color 0.16s ease,
            opacity 0.16s ease;
        }

        .btn-secondary:hover,
        .link-button:hover {
          transform: translateY(-1px);
          background: rgba(11, 37, 112, 0.08);
        }

        .small-muted {
          color: var(--text-soft, #7b8798);
          font-size: 13px;
          line-height: 1.55;
        }

        .status-box-error,
        .status-box-success {
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 14px;
          line-height: 1.6;
          margin-top: 10px;
        }

        .status-box-error {
          background: rgba(220, 53, 69, 0.08);
          border: 1px solid rgba(220, 53, 69, 0.18);
          color: #b42318;
        }

        .status-box-success {
          background: rgba(18, 183, 106, 0.08);
          border: 1px solid rgba(18, 183, 106, 0.18);
          color: #067647;
        }

        .hero-center {
          text-align: center;
          margin-bottom: 12px;
        }

        .hero-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .hero-stair-wrap {
          width: 100%;
          max-width: min(100%, 560px);
          margin-left: auto;
          margin-right: auto;
        }

        .hero-step {
          width: 100%;
        }

        .hero-step-1,
        .hero-step-2 {
          text-align: center;
        }

        .hero-stair {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
        }

        .hero-tools,
        .hero-mode {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .hero-tools {
          max-width: clamp(176px, 42vw, 196px);
        }

        .hero-mode {
          max-width: clamp(148px, 34vw, 164px);
          margin-top: -2px;
          margin-bottom: 10px;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(48px, 9vw, 86px);
          line-height: 0.95;
          font-weight: 900;
          color: var(--text-strong, #08142f);
          letter-spacing: -0.04em;
        }

        .brand-slogan {
          margin: 6px 0 0;
          padding: 0 10px;
          max-width: 100%;
          font-size: clamp(15px, 1.9vw, 18px);
          color: var(--text-soft, #7b8798);
        }

        .segment-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin: 12px auto 10px;
          max-width: min(100%, 700px);
        }

        .segment-btn {
          min-height: 72px;
          border-radius: 22px;
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          color: var(--text-main, #0a1736);
          font-size: clamp(18px, 2.6vw, 21px);
          font-weight: 900;
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
        }

        .segment-btn.active {
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
        }

        .page-error-box {
          max-width: 700px;
          margin: 0 auto 12px;
        }

        .section-caption {
          text-align: center;
          color: var(--text-soft, #7b8798);
          font-size: clamp(16px, 2.2vw, 22px);
          margin: 14px 0 12px;
        }

        .plan-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin: 0 auto;
          max-width: 700px;
        }

        .plan-card {
          min-height: 168px;
          padding: 22px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease,
            color 0.16s ease;
        }

        .plan-card.active {
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
        }

        .plan-title {
          font-size: clamp(20px, 2.5vw, 24px);
          font-weight: 900;
          line-height: 1.2;
        }

        .plan-price {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        .single-box {
          max-width: 700px;
          margin: 0 auto;
          padding: 22px;
        }

        .field-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--text-main, #0a1736);
        }

        .field-hint {
          margin-top: 10px;
          color: var(--text-soft, #7b8798);
          font-size: 13px;
          line-height: 1.6;
        }

        .summary-box {
          max-width: 700px;
          margin: 18px auto 0;
          padding: 18px 20px;
          text-align: center;
        }

        .summary-label {
          margin-bottom: 6px;
        }

        .summary-title {
          font-size: clamp(20px, 2.8vw, 26px);
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .summary-price {
          margin-top: 6px;
          font-size: clamp(32px, 4.5vw, 44px);
          font-weight: 900;
          color: var(--text-strong, #08142f);
          letter-spacing: -0.04em;
        }

        .summary-loading {
          margin-top: 8px;
        }

        .form-stack {
          max-width: 700px;
          margin: 18px auto 0;
          display: grid;
          gap: 12px;
        }

        .lookup-entry-card {
          max-width: 700px;
          margin: 22px auto 0;
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .lookup-entry-title {
          font-size: clamp(18px, 2.4vw, 24px);
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .lookup-entry-subtitle {
          margin-top: 6px;
        }

        .footer {
          text-align: center;
          margin-top: 26px;
          padding-top: 8px;
          color: var(--text-soft, #7b8798);
          font-size: 14px;
        }

        .footer p {
          margin: 8px 0;
        }

        .footer-email-label {
          color: var(--text-main, #0a1736);
          font-weight: 700;
        }

        .footer-email a,
        .footer-links a {
          color: var(--text-main, #0a1736);
          text-decoration: none;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px 18px;
          margin-top: 10px;
        }

        .route-overlay {
          position: fixed;
          inset: 0;
          z-index: 120;
          display: grid;
          place-items: center;
          background: rgba(8, 20, 47, 0.18);
          backdrop-filter: blur(8px);
          padding: 18px;
        }

        .route-card {
          width: min(100%, 360px);
          border-radius: 28px;
          padding: 26px 22px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(10, 23, 54, 0.08);
          box-shadow: 0 22px 50px rgba(10, 23, 54, 0.16);
          text-align: center;
        }

        .route-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 16px;
          border-radius: 999px;
          border: 3px solid rgba(11, 37, 112, 0.16);
          border-top-color: var(--brand, #0b2570);
          animation: agnopol-spin 0.9s linear infinite;
        }

        .route-title {
          font-size: 19px;
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .route-subtitle {
          margin-top: 8px;
          color: var(--text-soft, #7b8798);
          font-size: 14px;
          line-height: 1.6;
        }

        @keyframes agnopol-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 768px) {
          .hero-tools {
            transform: translateX(-18px);
          }

          .hero-mode {
            transform: translateX(18px);
          }
        }

        @media (max-width: 767px) {
          .plan-grid {
            grid-template-columns: 1fr;
          }

          .plan-card {
            min-height: 138px;
          }
        }

        @media (max-width: 640px) {
          .site-shell {
            padding: 14px 12px 30px;
          }

          .hero-stair {
            gap: 9px;
            margin-top: 12px;
          }

          .hero-tools {
            max-width: min(100%, 190px);
            transform: none;
          }

          .hero-mode {
            max-width: min(100%, 156px);
            margin-bottom: 10px;
            transform: none;
          }

          .brand-slogan {
            padding: 0 6px;
          }

          .segment-tabs {
            gap: 8px;
          }

          .segment-btn {
            min-height: 62px;
            border-radius: 20px;
          }

          .single-box,
          .summary-box,
          .lookup-entry-card {
            padding: 16px;
          }

          .footer-links {
            gap: 10px 14px;
          }
        }

        @media (max-width: 420px) {
          .site-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .brand-title {
            font-size: clamp(42px, 15vw, 60px);
          }

          .summary-price {
            font-size: 34px;
          }

          .plan-price {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  )
}
