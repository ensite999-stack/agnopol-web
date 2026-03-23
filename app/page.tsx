'use client'

import { useMemo, useState, type CSSProperties } from 'react'

type LangType =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'

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
}

type HomeText = {
  brand: string
  slogan: string
  premiumTitle: string
  starsTitle: string
  tabPremium: string
  tabStars: string
  plan3m: string
  plan6m: string
  plan12m: string
  currentSelection: string
  usernamePlaceholder: string
  emailPlaceholder: string
  createOrder: string
  starsInputLabel: string
  starsInputPlaceholder: string
  starsMinHint: string
  starsPriceHint: string
  selectedPremium: string
  selectedStars: string
  rights: string
  footerTerms: string
  footerPrivacy: string
  footerRisk: string
  officialEmail: string
  lookupTitle: string
  lookupSubtitle: string
  lookupPlaceholder: string
  lookupButton: string
  lookupLoading: string
  lookupNotFound: string
  lookupOrderNo: string
  lookupStatus: string
  lookupProduct: string
  lookupAmount: string
  lookupNetwork: string
  lookupCreatedAt: string
  lookupNote: string
  statusPending: string
  statusProcessing: string
  statusCompleted: string
  statusFailed: string
}

const languageOptions: { code: LangType; label: string }[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-cn', label: '简体中文' },
  { code: 'zh-tw', label: '繁體中文' },
]

const prices = {
  tg_premium_3m: 13.1,
  tg_premium_6m: 17.1,
  tg_premium_12m: 31.1,
  tg_stars_rate: 0.02,
}

const homeEn: HomeText = {
  brand: 'Agnopol',
  slogan: 'One world, one breath.',
  premiumTitle: 'TG Premium Plans',
  starsTitle: 'TG Stars',
  tabPremium: 'Premium',
  tabStars: 'Stars',
  plan3m: '3 Months',
  plan6m: '6 Months',
  plan12m: '12 Months',
  currentSelection: 'Current Selection',
  usernamePlaceholder: 'Telegram Username',
  emailPlaceholder: 'Email',
  createOrder: 'Create Order',
  starsInputLabel: 'Stars Amount',
  starsInputPlaceholder: 'Minimum 50',
  starsMinHint: 'Minimum order: 50 stars',
  starsPriceHint: 'Price is calculated automatically',
  selectedPremium: 'TG Premium',
  selectedStars: 'TG Stars',
  rights: '© {year} Agnopol. All rights reserved.',
  footerTerms: 'Terms of Service',
  footerPrivacy: 'Privacy Policy',
  footerRisk: 'Risk Disclosure',
  officialEmail: 'Official Email',
  lookupTitle: 'Order Lookup',
  lookupSubtitle: 'Enter your order number to check the latest status.',
  lookupPlaceholder: 'Enter order number, e.g. APXXXXXX',
  lookupButton: 'Check Order',
  lookupLoading: 'Checking...',
  lookupNotFound: 'Order not found.',
  lookupOrderNo: 'Order No',
  lookupStatus: 'Status',
  lookupProduct: 'Product',
  lookupAmount: 'Amount',
  lookupNetwork: 'Payment Network',
  lookupCreatedAt: 'Created At',
  lookupNote: 'Note',
  statusPending: 'Pending',
  statusProcessing: 'Processing',
  statusCompleted: 'Completed',
  statusFailed: 'Failed',
}

const homeZhCn: HomeText = {
  brand: 'Agnopol',
  slogan: 'One world, one breath.',
  premiumTitle: 'TG Premium 套餐',
  starsTitle: 'TG Stars',
  tabPremium: 'Premium',
  tabStars: 'Stars',
  plan3m: '3个月',
  plan6m: '6个月',
  plan12m: '12个月',
  currentSelection: '当前选择',
  usernamePlaceholder: 'TG 用户名（如 @username）',
  emailPlaceholder: '电子邮件',
  createOrder: '创建订单',
  starsInputLabel: 'Stars 数量',
  starsInputPlaceholder: '最少 50',
  starsMinHint: '最低下单数量：50 Stars',
  starsPriceHint: '价格将自动计算',
  selectedPremium: 'TG Premium',
  selectedStars: 'TG Stars',
  rights: '© {year} Agnopol。保留所有权利。',
  footerTerms: '服务条款',
  footerPrivacy: '隐私政策',
  footerRisk: '风险披露',
  officialEmail: '官方邮箱',
  lookupTitle: '订单查询',
  lookupSubtitle: '输入订单号，查看最新处理状态。',
  lookupPlaceholder: '输入订单号，例如 APXXXXXX',
  lookupButton: '查询订单',
  lookupLoading: '查询中...',
  lookupNotFound: '未找到该订单。',
  lookupOrderNo: '订单号',
  lookupStatus: '状态',
  lookupProduct: '产品',
  lookupAmount: '金额',
  lookupNetwork: '支付网络',
  lookupCreatedAt: '创建时间',
  lookupNote: '备注',
  statusPending: '待处理',
  statusProcessing: '处理中',
  statusCompleted: '已完成',
  statusFailed: '失败',
}

const homeZhTw: HomeText = {
  brand: 'Agnopol',
  slogan: 'One world, one breath.',
  premiumTitle: 'TG Premium 方案',
  starsTitle: 'TG Stars',
  tabPremium: 'Premium',
  tabStars: 'Stars',
  plan3m: '3個月',
  plan6m: '6個月',
  plan12m: '12個月',
  currentSelection: '目前選擇',
  usernamePlaceholder: 'TG 用戶名（如 @username）',
  emailPlaceholder: '電子郵件',
  createOrder: '建立訂單',
  starsInputLabel: 'Stars 數量',
  starsInputPlaceholder: '最少 50',
  starsMinHint: '最低下單數量：50 Stars',
  starsPriceHint: '價格將自動計算',
  selectedPremium: 'TG Premium',
  selectedStars: 'TG Stars',
  rights: '© {year} Agnopol。保留所有權利。',
  footerTerms: '服務條款',
  footerPrivacy: '隱私政策',
  footerRisk: '風險披露',
  officialEmail: '官方郵箱',
  lookupTitle: '訂單查詢',
  lookupSubtitle: '輸入訂單號，查看最新處理狀態。',
  lookupPlaceholder: '輸入訂單號，例如 APXXXXXX',
  lookupButton: '查詢訂單',
  lookupLoading: '查詢中...',
  lookupNotFound: '未找到該訂單。',
  lookupOrderNo: '訂單號',
  lookupStatus: '狀態',
  lookupProduct: '產品',
  lookupAmount: '金額',
  lookupNetwork: '支付網路',
  lookupCreatedAt: '建立時間',
  lookupNote: '備註',
  statusPending: '待處理',
  statusProcessing: '處理中',
  statusCompleted: '已完成',
  statusFailed: '失敗',
}

const messages: Record<LangType, HomeText> = {
  de: homeEn,
  en: homeEn,
  es: homeEn,
  fr: homeEn,
  ja: homeEn,
  ko: homeEn,
  'zh-cn': homeZhCn,
  'zh-tw': homeZhTw,
}

function getStatusLabel(status: string | null | undefined, t: HomeText) {
  const value = String(status || '').toLowerCase()
  if (value === 'pending') return t.statusPending
  if (value === 'processing') return t.statusProcessing
  if (value === 'completed') return t.statusCompleted
  if (value === 'failed') return t.statusFailed
  return status || '-'
}

function OrderLookupSection({ lang, t }: { lang: LangType; t: HomeText }) {
  const [orderNo, setOrderNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [result, setResult] = useState<OrderResult | null>(null)

  const productLabel = useMemo(() => {
    if (!result) return '-'
    if (result.product_type === 'tg_stars') {
      return `${t.selectedStars} ${result.stars_amount ?? 0}`
    }
    if (result.duration === '3m') return `${t.selectedPremium} ${t.plan3m}`
    if (result.duration === '6m') return `${t.selectedPremium} ${t.plan6m}`
    return `${t.selectedPremium} ${t.plan12m}`
  }, [result, t])

  async function handleLookup() {
    setLoading(true)
    setErrorText('')
    setResult(null)

    try {
      const response = await fetch('/api/queryOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: orderNo.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || t.lookupNotFound)
      }

      setResult(data.order)
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t.lookupNotFound)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: 18,
        borderRadius: 18,
        border: '1px solid rgba(15, 23, 42, 0.07)',
        background: 'rgba(255,255,255,0.78)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.035)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(18px, 2.2vw, 22px)',
          fontWeight: 800,
          color: '#111827',
          marginBottom: 6,
        }}
      >
        {t.lookupTitle}
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#6b7280',
          marginBottom: 12,
        }}
      >
        {t.lookupSubtitle}
      </div>

      <input
        value={orderNo}
        onChange={(e) => setOrderNo(e.target.value)}
        placeholder={t.lookupPlaceholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: 14,
          borderRadius: 12,
          border: '1px solid #d1d5db',
          fontSize: 16,
          background: '#fff',
        }}
      />

      <button
        onClick={handleLookup}
        style={{
          marginTop: 12,
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: 'none',
          background: '#07163f',
          color: '#fff',
          fontWeight: 900,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {loading ? t.lookupLoading : t.lookupButton}
      </button>

      {errorText ? (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            color: '#991b1b',
          }}
        >
          {errorText}
        </div>
      ) : null}

      {result ? (
        <div
          style={{
            marginTop: 14,
            padding: 16,
            borderRadius: 16,
            background: 'rgba(15, 23, 42, 0.035)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            display: 'grid',
            gap: 10,
          }}
        >
          <div><strong>{t.lookupOrderNo}:</strong> {result.order_no}</div>
          <div><strong>{t.lookupStatus}:</strong> {getStatusLabel(result.status, t)}</div>
          <div><strong>{t.lookupProduct}:</strong> {productLabel}</div>
          <div><strong>{t.lookupAmount}:</strong> ${result.price_usd ?? result.amount ?? 0}</div>
          <div><strong>{t.lookupNetwork}:</strong> {result.payment_network || '-'}</div>
          <div>
            <strong>{t.lookupCreatedAt}:</strong>{' '}
            {result.created_at ? new Date(result.created_at).toLocaleString() : '-'}
          </div>
          {result.admin_note ? (
            <div><strong>{t.lookupNote}:</strong> {result.admin_note}</div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default function Page() {
  const [lang, setLang] = useState<LangType>('en')
  const [tab, setTab] = useState<ProductType>('premium')
  const [duration, setDuration] = useState<DurationType>('12m')
  const [stars, setStars] = useState(50)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const t = messages[lang]
  const currentYear = new Date().getFullYear()

  const safeStars = useMemo(() => {
    if (!Number.isFinite(stars)) return 50
    if (stars < 50) return 50
    return Math.floor(stars)
  }, [stars])

  const selectedPrice = useMemo(() => {
    if (tab === 'premium') {
      if (duration === '3m') return prices.tg_premium_3m
      if (duration === '6m') return prices.tg_premium_6m
      return prices.tg_premium_12m
    }
    return Number((safeStars * prices.tg_stars_rate).toFixed(2))
  }, [tab, duration, safeStars])

  const selectedTitle = useMemo(() => {
    if (tab === 'premium') {
      const durationText =
        duration === '3m' ? t.plan3m : duration === '6m' ? t.plan6m : t.plan12m
      return `${t.selectedPremium} ${durationText}`
    }
    return `${t.selectedStars} ${safeStars}`
  }, [tab, duration, safeStars, t])

  function goPay() {
    const params = new URLSearchParams()
    params.set('lang', lang)
    params.set('username', username)
    params.set('email', email)
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

  function topTabStyle(active: boolean): CSSProperties {
    return {
      flex: 1,
      minWidth: 0,
      padding: '12px 14px',
      borderRadius: 14,
      border: active ? '1px solid #0f234f' : '1px solid rgba(15, 23, 42, 0.08)',
      background: active ? '#0b1733' : 'rgba(255,255,255,0.72)',
      color: active ? '#ffffff' : '#0f172a',
      fontWeight: 800,
      fontSize: 15,
      cursor: 'pointer',
      boxShadow: active ? '0 8px 24px rgba(11, 23, 51, 0.16)' : '0 4px 18px rgba(15, 23, 42, 0.04)',
      backdropFilter: 'blur(10px)',
    }
  }

  function planCardStyle(active: boolean): CSSProperties {
    return {
      padding: 18,
      borderRadius: 18,
      border: active ? '1px solid #0f234f' : '1px solid rgba(15, 23, 42, 0.08)',
      background: active ? '#0b1733' : 'rgba(255,255,255,0.82)',
      color: active ? '#ffffff' : '#111827',
      cursor: 'pointer',
      minHeight: 106,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      boxShadow: active ? '0 10px 28px rgba(11, 23, 51, 0.18)' : '0 8px 24px rgba(15, 23, 42, 0.04)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
    }
  }

  return (
    <main
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '22px 14px 36px',
        fontFamily: 'system-ui, Arial, sans-serif',
        background:
          'radial-gradient(circle at top, rgba(224,231,255,0.45), rgba(247,248,250,0) 38%), linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%)',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .agnopol-container {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .agnopol-hero {
          text-align: center;
          margin-bottom: 22px;
        }

        .agnopol-lang-wrap {
          display: flex;
          justify-content: center;
          margin-top: 12px;
        }

        .agnopol-lang {
          width: 104px;
        }

        .agnopol-tabs {
          display: flex;
          gap: 10px;
          margin: 0 auto 14px;
          max-width: 420px;
        }

        .agnopol-plan-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .agnopol-footer-links {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }

        .agnopol-footer-links a {
          color: #475569;
          text-decoration: none;
        }

        .agnopol-footer-links a:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        .agnopol-email-link {
          color: #64748b;
          text-decoration: none;
        }

        .agnopol-email-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        @media (min-width: 900px) {
          .agnopol-plan-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .agnopol-lang {
            width: 98px;
          }
        }
      `}</style>

      <div className="agnopol-container">
        <section className="agnopol-hero">
          <h1
            style={{
              fontSize: 'clamp(58px, 12vw, 108px)',
              fontWeight: 900,
              margin: 0,
              color: '#0f172a',
              lineHeight: 0.92,
              letterSpacing: '-0.06em',
            }}
          >
            {t.brand}
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: '#64748b',
              fontSize: 'clamp(14px, 2vw, 18px)',
              fontWeight: 500,
            }}
          >
            {t.slogan}
          </p>

          <div className="agnopol-lang-wrap">
            <div className="agnopol-lang">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LangType)}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: 'rgba(255,255,255,0.72)',
                  fontSize: 11,
                  color: '#475569',
                }}
              >
                {languageOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="agnopol-tabs">
          <button type="button" onClick={() => setTab('premium')} style={topTabStyle(tab === 'premium')}>
            {t.tabPremium}
          </button>
          <button type="button" onClick={() => setTab('stars')} style={topTabStyle(tab === 'stars')}>
            {t.tabStars}
          </button>
        </div>

        {tab === 'premium' ? (
          <>
            <p
              style={{
                fontSize: 'clamp(18px, 2.2vw, 22px)',
                marginTop: 0,
                marginBottom: 12,
                color: '#475569',
                textAlign: 'center',
              }}
            >
              {t.premiumTitle}
            </p>

            <div className="agnopol-plan-grid">
              <div onClick={() => setDuration('3m')} style={planCardStyle(duration === '3m')}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.plan3m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${prices.tg_premium_3m}
                </div>
              </div>

              <div onClick={() => setDuration('6m')} style={planCardStyle(duration === '6m')}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.plan6m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${prices.tg_premium_6m}
                </div>
              </div>

              <div onClick={() => setDuration('12m')} style={planCardStyle(duration === '12m')}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{t.plan12m}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900 }}>
                  ${prices.tg_premium_12m}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 'clamp(18px, 2.2vw, 22px)',
                marginTop: 0,
                marginBottom: 12,
                color: '#475569',
                textAlign: 'center',
              }}
            >
              {t.starsTitle}
            </p>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                background: 'rgba(255,255,255,0.82)',
                maxWidth: 720,
                margin: '0 auto',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  marginBottom: 10,
                  color: '#111827',
                }}
              >
                {t.starsInputLabel}
              </div>

              <input
                type="number"
                min={50}
                step={1}
                value={stars}
                onChange={(e) => setStars(Number(e.target.value))}
                placeholder={t.starsInputPlaceholder}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 13,
                  borderRadius: 12,
                  border: '1px solid #d1d5db',
                  fontSize: 16,
                  background: '#fff',
                }}
              />

              <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>{t.starsMinHint}</div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#6b7280' }}>{t.starsPriceHint}</div>
            </div>
          </>
        )}

        <div
          style={{
            marginTop: 18,
            padding: 18,
            borderRadius: 18,
            border: '1px solid rgba(15, 23, 42, 0.07)',
            background: 'rgba(255,255,255,0.78)',
            maxWidth: 760,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.035)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            {t.currentSelection}
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
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <input
            placeholder={t.usernamePlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              marginTop: 18,
              width: '100%',
              boxSizing: 'border-box',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #d1d5db',
              fontSize: 16,
              background: '#fff',
            }}
          />

          <input
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              marginTop: 14,
              width: '100%',
              boxSizing: 'border-box',
              padding: 14,
              borderRadius: 12,
              border: '1px solid #d1d5db',
              fontSize: 16,
              background: '#fff',
            }}
          />

          <button
            onClick={goPay}
            style={{
              marginTop: 16,
              width: '100%',
              padding: 15,
              background: '#07163f',
              color: '#ffffff',
              borderRadius: 14,
              border: 'none',
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 10px 26px rgba(7, 22, 63, 0.18)',
            }}
          >
            {t.createOrder}
          </button>
        </div>

        <div style={{ marginTop: 28 }}>
          <OrderLookupSection lang={lang} t={t} />
        </div>

        <footer
          style={{
            marginTop: 30,
            paddingTop: 16,
            borderTop: '1px solid #e5e7eb',
            fontSize: 12,
            color: '#6b7280',
            lineHeight: 1.75,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
          }}
        >
          <p>{t.rights.replace('{year}', String(currentYear))}</p>

          <p style={{ marginTop: 4 }}>
            <span style={{ marginRight: 6 }}>{t.officialEmail}:</span>
            <a href="mailto:hello@agnopol.com" className="agnopol-email-link">
              hello@agnopol.com
            </a>
          </p>

          <div className="agnopol-footer-links">
            <a href={`/legal?lang=${lang}#terms`}>{t.footerTerms}</a>
            <a href={`/legal?lang=${lang}#privacy`}>{t.footerPrivacy}</a>
            <a href={`/legal?lang=${lang}#risk`}>{t.footerRisk}</a>
          </div>
        </footer>
      </div>
    </main>
  )
}
