'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useI18n } from '../components/language-provider'
import LanguageSwitcher from '../components/language-switcher'
import { withLang, type Messages } from '../lib/i18n'

type ProductType = 'premium' | 'stars'
type DurationType = '3m' | '6m' | '12m'

type OrderResult = {
  order_no: string
  status: string
  product_type: string | null
  duration: string | null
  stars_amount: number | null
  amount: number | null
  price_usd: number | null
  payment_network: string | null
  created_at: string | null
  admin_note: string | null
  public_note: string | null
}

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

function getStatusLabel(status: string | null | undefined, t: Messages) {
  const value = String(status || '').toLowerCase()

  if (value === 'pending' || value === 'pending_payment') return t.lookup.pending
  if (value === 'processing') return t.lookup.processing
  if (value === 'completed' || value === 'paid') return t.lookup.completed
  if (value === 'failed' || value === 'cancelled') return t.lookup.failed

  return status || '-'
}

function OrderLookupSection() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [results, setResults] = useState<OrderResult[]>([])

  function getProductLabel(item: OrderResult) {
    if (item.product_type === 'tg_stars') {
      return `${t.home.tgStars} ${item.stars_amount ?? 0}`
    }
    if (item.duration === '3m') return `${t.home.tgPremium} ${t.home.months3}`
    if (item.duration === '6m') return `${t.home.tgPremium} ${t.home.months6}`
    return `${t.home.tgPremium} ${t.home.months12}`
  }

  async function handleLookup() {
    setLoading(true)
    setErrorText('')
    setResults([])

    try {
      const response = await fetch('/api/queryOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
        }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || t.lookup.notFound)
      }

      setResults(data.orders || [])
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t.lookup.notFound)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card-soft" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div
        style={{
          fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 800,
          color: '#111827',
          marginBottom: 6,
        }}
      >
        {t.lookup.title}
      </div>

      <div className="small-muted" style={{ marginBottom: 12 }}>
        {t.lookup.subtitle}
      </div>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.lookup.placeholder}
        className="input"
      />

      <button onClick={handleLookup} className="btn-primary" style={{ marginTop: 12 }}>
        {loading ? t.lookup.loading : t.lookup.button}
      </button>

      {errorText ? <div className="status-box-error">{errorText}</div> : null}

      {results.length > 0 ? (
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          {results.map((item) => (
            <div
              key={item.order_no}
              style={{
                padding: 16,
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.035)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                display: 'grid',
                gap: 8,
              }}
            >
              <div>
                <strong>{t.lookup.orderNo}:</strong> {item.order_no}
              </div>
              <div>
                <strong>{t.lookup.email}:</strong> {email}
              </div>
              <div>
                <strong>{t.lookup.status}:</strong> {getStatusLabel(item.status, t)}
              </div>
              <div>
                <strong>{t.lookup.product}:</strong> {getProductLabel(item)}
              </div>
              <div>
                <strong>{t.lookup.amount}:</strong> ${item.price_usd ?? item.amount ?? 0}
              </div>
              <div>
                <strong>{t.lookup.network}:</strong> {item.payment_network || '-'}
              </div>
              <div>
                <strong>{t.lookup.createdAt}:</strong>{' '}
                {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
              </div>
              {item.public_note ? (
                <div>
                  <strong>{t.lookup.note}:</strong> {item.public_note}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default function HomePage() {
  const { lang, t } = useI18n()
  const [tab, setTab] = useState<ProductType>('premium')
  const [duration, setDuration] = useState<DurationType>('12m')
  const [stars, setStars] = useState(50)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [configLoading, setConfigLoading] = useState(true)

  const currentYear = new Date().getFullYear()

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

  function topTabStyle(_active: boolean): CSSProperties {
    return {}
  }

  function goPay() {
    const params = new URLSearchParams()
    params.set('lang', lang)
    params.set('username', username.trim())
    params.set('email', email.trim())
    params.set('price_usd', String(selectedPrice))

    if (tab === 'premium') {
      params.set('product_type', 'tg_premium')
      params.set('duration', duration)
    } else {
      params.set('product_type', 'tg_stars')
      params.set('stars_amount', String(safeStars))
    }

    window.location.href = `/pay?${params.toString()}`
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <section className="hero-center">
          <h1 className="brand-title">{t.common.brand}</h1>
          <p className="brand-slogan">{t.common.slogan}</p>
          <LanguageSwitcher />
        </section>

        <div className="segment-tabs">
          <button
            type="button"
            onClick={() => setTab('premium')}
            className={`segment-btn ${tab === 'premium' ? 'active' : ''}`}
            style={topTabStyle(tab === 'premium')}
          >
            {t.home.premiumTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('stars')}
            className={`segment-btn ${tab === 'stars' ? 'active' : ''}`}
            style={topTabStyle(tab === 'stars')}
          >
            {t.home.starsTab}
          </button>
        </div>

        {configError ? <div className="status-box-error" style={{ maxWidth: 760, margin: '0 auto 14px' }}>{configError}</div> : null}

        {tab === 'premium' ? (
          <>
            <p className="section-caption">{t.home.premiumPlans}</p>

            <div className="plan-grid">
              <div
                className={`card plan-card ${duration === '3m' ? 'active' : ''}`}
                onClick={() => setDuration('3m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months3}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_3m_price)}
                </div>
              </div>

              <div
                className={`card plan-card ${duration === '6m' ? 'active' : ''}`}
                onClick={() => setDuration('6m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months6}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_6m_price)}
                </div>
              </div>

              <div
                className={`card plan-card ${duration === '12m' ? 'active' : ''}`}
                onClick={() => setDuration('12m')}
              >
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.home.months12}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${Number(config.premium_12m_price)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="section-caption">{t.home.starsPackage}</p>

            <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: '#111827' }}>
                {t.home.starsAmount}
              </div>

              <input
                type="number"
                min={50}
                step={1}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                placeholder={t.home.starsPlaceholder}
                className="input"
              />

              <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>{t.home.starsMinHint}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{t.home.autoPriceHint}</div>
            </div>
          </>
        )}

        <div className="summary-box card-soft">
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            {t.home.currentSelection}
          </div>

          <div
            style={{
              fontSize: 'clamp(19px, 3vw, 26px)',
              fontWeight: 800,
              color: '#111827',
            }}
          >
            {selectedTitle}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 'clamp(32px, 5vw, 44px)',
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1,
            }}
          >
            ${selectedPrice}
          </div>

          {configLoading ? (
            <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
              {t.common.loading}
            </div>
          ) : null}
        </div>

        <div className="form-stack">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.home.usernamePlaceholder}
            className="input"
            style={{ marginTop: 18 }}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.home.emailPlaceholder}
            className="input"
            style={{ marginTop: 14 }}
          />

          <button onClick={goPay} className="btn-primary" style={{ marginTop: 16 }}>
            {t.home.createOrder}
          </button>
        </div>

        <div style={{ marginTop: 28 }}>
          <OrderLookupSection />
        </div>

        <footer className="footer">
          <p>{t.common.rights.replace('{year}', String(currentYear))}</p>

          <p style={{ marginTop: 4 }}>
            <span style={{ marginRight: 6 }}>{t.common.officialEmail}:</span>
            <a href="mailto:hello@agnopol.com">hello@agnopol.com</a>
          </p>

          <div className="footer-links">
            <a href={withLang('/legal#terms', lang)}>{t.common.footerTerms}</a>
            <a href={withLang('/legal#privacy', lang)}>{t.common.footerPrivacy}</a>
            <a href={withLang('/legal#risk', lang)}>{t.common.footerRisk}</a>
          </div>
        </footer>
      </div>
    </main>
  )
}
