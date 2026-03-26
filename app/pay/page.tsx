'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'
import ThemeToggle from '../../components/theme-toggle'
import { withLang } from '../../lib/i18n'

type DurationType = '3m' | '6m' | '12m'
type PaymentNetwork = 'TRC20' | 'BASE'

type PublicConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  trc20_address: string
  base_address: string
  updated_at?: string
}

const CREATE_ORDER_ENDPOINT = '/api/createOrder'

const defaultConfig: PublicConfig = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  trc20_address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  base_address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
}

type PayUi = {
  back: string
  title: string
  subtitle: string
  invalidParams: string
  invalidParamsHint: string
  summaryTitle: string
  product: string
  username: string
  email: string
  amountDue: string
  networkTitle: string
  addressTitle: string
  copy: string
  copied: string
  warningTitle: string
  warningText: string
  introTitle: string
  introText: string
  deliveryTitle: string
  deliveryText: string
  txHash: string
  txPlaceholder: string
  proofTitle: string
  proofHint: string
  proofReady: string
  proofRequired: string
  submit: string
  submitting: string
  successTitle: string
  successText: string
  trackOrder: string
  createError: string
}

const PAY_UI: Record<string, PayUi> = {
  en: {
    back: 'Back to home',
    title: 'Complete payment',
    subtitle:
      'Review your order, choose the payment network, then submit your payment proof.',
    invalidParams: 'Order information is incomplete or invalid.',
    invalidParamsHint:
      'Please go back to the home page and create the order again with a valid TG username and email.',
    summaryTitle: 'Order summary',
    product: 'Product',
    username: 'TG Username',
    email: 'Email',
    amountDue: 'Amount due',
    networkTitle: 'Choose payment network',
    addressTitle: 'Payment address',
    copy: 'Copy address',
    copied: 'Copied',
    warningTitle: 'Important payment notice',
    warningText:
      'For TRC20 payments, please use the correct TRC20 USDT chain and token. Do not use any other chain. The amount received must exactly match the amount shown in your order.',
    introTitle: 'About Agnopol',
    introText:
      'One world, one breath.',
    deliveryTitle: 'Delivery time',
    deliveryText:
      'To ensure fund safety and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it will not exceed 2 hours.',
    txHash: 'Transaction hash',
    txPlaceholder: 'Paste your transaction hash (optional)',
    proofTitle: 'Upload payment proof',
    proofHint: 'Upload your screenshot or payment receipt.',
    proofReady: 'Proof ready:',
    proofRequired: 'Please upload payment proof or fill in the transaction hash.',
    submit: 'Submit payment proof',
    submitting: 'Submitting...',
    successTitle: 'Payment proof submitted',
    successText:
      'Your order has been created and the payment proof has been submitted successfully.',
    trackOrder: 'Track order',
    createError: 'Failed to create the order.',
  },
  'zh-cn': {
    back: '返回首页',
    title: '完成付款',
    subtitle: '核对订单信息，选择支付网络，然后提交付款凭证。',
    invalidParams: '订单信息不完整或格式无效。',
    invalidParamsHint: '请返回首页重新下单，并确认 TG 用户名与邮箱格式正确。',
    summaryTitle: '订单摘要',
    product: '商品',
    username: 'TG 用户名',
    email: '邮箱',
    amountDue: '应付金额',
    networkTitle: '选择支付网络',
    addressTitle: '收款地址',
    copy: '复制地址',
    copied: '已复制',
    warningTitle: '重要支付提示',
    warningText:
      '转账请使用 TRC20 USDT 正确链桥及币种，不要使用其余链桥，支付到账金额必须与订单显示金额一致。',
    introTitle: '关于 Agnopol',
    introText: 'One world, one breath.',
    deliveryTitle: '交付时效',
    deliveryText:
      '为了确保资金安全与合规审查，我们的标准交付时间为 5 - 15 分钟。在网络拥堵时，最迟不超过 2 小时。',
    txHash: '交易哈希',
    txPlaceholder: '填写交易哈希（可选）',
    proofTitle: '上传付款凭证',
    proofHint: '上传付款截图或收据。',
    proofReady: '凭证已就绪：',
    proofRequired: '请上传付款凭证，或填写交易哈希。',
    submit: '提交付款凭证',
    submitting: '提交中...',
    successTitle: '付款凭证已提交',
    successText: '你的订单已创建，付款凭证也已成功提交。',
    trackOrder: '追踪订单',
    createError: '创建订单失败。',
  },
  'zh-tw': {
    back: '返回首頁',
    title: '完成付款',
    subtitle: '核對訂單資訊，選擇支付網路，然後提交付款憑證。',
    invalidParams: '訂單資訊不完整或格式無效。',
    invalidParamsHint: '請返回首頁重新下單，並確認 TG 用戶名與電子郵件格式正確。',
    summaryTitle: '訂單摘要',
    product: '商品',
    username: 'TG 用戶名',
    email: '電子郵件',
    amountDue: '應付金額',
    networkTitle: '選擇支付網路',
    addressTitle: '收款地址',
    copy: '複製地址',
    copied: '已複製',
    warningTitle: '重要支付提示',
    warningText:
      '轉帳請使用 TRC20 USDT 正確鏈橋及幣種，不要使用其餘鏈橋，支付到帳金額必須與訂單顯示金額一致。',
    introTitle: '關於 Agnopol',
    introText: 'One world, one breath.',
    deliveryTitle: '交付時效',
    deliveryText:
      '為了確保資金安全與合規審查，我們的標準交付時間為 5 - 15 分鐘。在網路壅塞時，最遲不超過 2 小時。',
    txHash: '交易雜湊',
    txPlaceholder: '填寫交易雜湊（可選）',
    proofTitle: '上傳付款憑證',
    proofHint: '上傳付款截圖或收據。',
    proofReady: '憑證已就緒：',
    proofRequired: '請上傳付款憑證，或填寫交易雜湊。',
    submit: '提交付款憑證',
    submitting: '提交中...',
    successTitle: '付款憑證已提交',
    successText: '你的訂單已建立，付款憑證也已成功提交。',
    trackOrder: '追蹤訂單',
    createError: '建立訂單失敗。',
  },
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidTelegramUsername(value: string) {
  return /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value.trim())
}

function formatMoney(value: number) {
  const fixed = Number(value.toFixed(2))
  return Number.isInteger(fixed) ? String(fixed) : fixed.toFixed(2).replace(/\.?0+$/, '')
}

function scheduleFieldIntoView(target: HTMLInputElement) {
  ;[0, 120, 260].forEach((delay) => {
    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: 'auto',
        block: 'start',
        inline: 'nearest',
      })
    }, delay)
  })
}

function PayPageInner() {
  const { lang, t } = useI18n()
  const ui = PAY_UI[lang] || PAY_UI.en
  const searchParams = useSearchParams()

  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
  const [network, setNetwork] = useState<PaymentNetwork>('TRC20')
  const [txHash, setTxHash] = useState('')
  const [proofName, setProofName] = useState('')
  const [proofBase64, setProofBase64] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdOrderNo, setCreatedOrderNo] = useState('')
  const [successVisible, setSuccessVisible] = useState(false)

  const username = searchParams.get('username')?.trim() || ''
  const email = searchParams.get('email')?.trim().toLowerCase() || ''
  const priceUsd = Number(searchParams.get('price_usd') || 0)
  const productType = searchParams.get('product_type') || ''
  const duration = (searchParams.get('duration') || '') as DurationType
  const starsAmount = Number(searchParams.get('stars_amount') || 0)

  const isOrderContextValid = useMemo(() => {
    if (!isValidTelegramUsername(username)) return false
    if (!isValidEmail(email)) return false
    if (!(priceUsd > 0)) return false

    if (productType === 'tg_premium') {
      return ['3m', '6m', '12m'].includes(duration)
    }

    if (productType === 'tg_stars') {
      return starsAmount >= 50
    }

    return false
  }, [username, email, priceUsd, productType, duration, starsAmount])

  useEffect(() => {
    let active = true

    async function loadConfig() {
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
      }
    }

    loadConfig()

    return () => {
      active = false
    }
  }, [])

  const selectedAddress = network === 'TRC20' ? config.trc20_address : config.base_address

  const productTitle = useMemo(() => {
    if (productType === 'tg_premium') {
      const durationText =
        duration === '3m' ? t.home.months3 : duration === '6m' ? t.home.months6 : t.home.months12
      return `${t.home.tgPremium} ${durationText}`
    }

    if (productType === 'tg_stars') {
      return `${t.home.tgStars} ${starsAmount}`
    }

    return '-'
  }, [duration, productType, starsAmount, t])

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(selectedAddress)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1600)
    } catch {
      // ignore clipboard errors
    }
  }

  function handleProofChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setProofName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      setProofBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleFieldFocus(event: FocusEvent<HTMLInputElement>) {
    scheduleFieldIntoView(event.currentTarget)
  }

  async function handleSubmit() {
    setSubmitError('')

    if (!isOrderContextValid) {
      setSubmitError(ui.invalidParamsHint)
      return
    }

    if (!proofBase64 && !txHash.trim()) {
      setSubmitError(ui.proofRequired)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(CREATE_ORDER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          product_type: productType,
          duration: productType === 'tg_premium' ? duration : null,
          stars_amount: productType === 'tg_stars' ? starsAmount : null,
          price_usd: priceUsd,
          payment_network: network,
          tx_hash: txHash.trim() || null,
          proof_image_base64: proofBase64 || null,
        }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.createError)
      }

      setCreatedOrderNo(data?.order_no || data?.order?.order_no || '')
      setSuccessVisible(true)
      setTxHash('')
      setProofName('')
      setProofBase64('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : ui.createError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="site-shell pay-page-shell">
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

        <div className="pay-back-wrap">
          <a href={withLang('/', lang)} className="back-link back-link-pill">
            <span className="back-link-arrow">←</span>
            <span>{ui.back}</span>
          </a>
        </div>

        {!isOrderContextValid ? (
          <section className="pay-main-card card-soft">
            <div className="pay-title">{ui.invalidParams}</div>
            <div className="status-box-error">{ui.invalidParamsHint}</div>
          </section>
        ) : (
          <>
            <section className="pay-main-card card-soft">
              <div className="pay-title">{ui.title}</div>
              <div className="small-muted pay-subtitle">{ui.subtitle}</div>

              {configError ? <div className="status-box-error">{configError}</div> : null}

              <div className="pay-grid">
                <div className="pay-info-card card-soft-sub">
                  <div className="section-mini-title">{ui.summaryTitle}</div>
                  <div className="summary-row">
                    <span>{ui.product}</span>
                    <strong>{productTitle}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{ui.username}</span>
                    <strong>{username}</strong>
                  </div>
                  <div className="summary-row">
                    <span>{ui.email}</span>
                    <strong>{email}</strong>
                  </div>
                  <div className="summary-row summary-row-amount">
                    <span>{ui.amountDue}</span>
                    <strong>${formatMoney(priceUsd)}</strong>
                  </div>
                </div>

                <div className="pay-info-card card-soft-sub">
                  <div className="section-mini-title">{ui.networkTitle}</div>
                  <div className="network-switch">
                    <button
                      type="button"
                      className={`network-option ${network === 'TRC20' ? 'active' : ''}`}
                      onClick={() => setNetwork('TRC20')}
                    >
                      TRC20
                    </button>
                    <button
                      type="button"
                      className={`network-option ${network === 'BASE' ? 'active' : ''}`}
                      onClick={() => setNetwork('BASE')}
                    >
                      BASE
                    </button>
                  </div>

                  <div className="address-card">
                    <div className="address-label">{ui.addressTitle}</div>
                    <div className="address-value">{selectedAddress}</div>
                    <button type="button" className="btn-secondary small-line-button" onClick={copyAddress}>
                      {copyState === 'copied' ? ui.copied : ui.copy}
                    </button>
                  </div>
                </div>
              </div>

              <div className="notice-grid">
                <div className="notice-card notice-card-warning">
                  <div className="section-mini-title">{ui.warningTitle}</div>
                  <div className="notice-text">{ui.warningText}</div>
                </div>

                <div className="notice-card">
                  <div className="section-mini-title">{ui.introTitle}</div>
                  <div className="notice-text">{ui.introText}</div>
                </div>

                <div className="notice-card">
                  <div className="section-mini-title">{ui.deliveryTitle}</div>
                  <div className="notice-text">{ui.deliveryText}</div>
                </div>
              </div>

              <div className="proof-card card-soft-sub">
                <div className="section-mini-title">{ui.proofTitle}</div>
                <div className="small-muted proof-hint">{ui.proofHint}</div>

                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  onFocus={handleFieldFocus}
                  placeholder={ui.txPlaceholder}
                  className="input"
                />

                <input type="file" accept="image/*" onChange={handleProofChange} />

                {proofName ? (
                  <div className="small-muted proof-ready">
                    {ui.proofReady} {proofName}
                  </div>
                ) : null}

                {submitError ? <div className="status-box-error">{submitError}</div> : null}

                <button type="button" className="btn-primary" onClick={handleSubmit}>
                  {submitting ? ui.submitting : ui.submit}
                </button>
              </div>

              {successVisible ? (
                <div className="status-box-success success-box">
                  <div className="success-title">{ui.successTitle}</div>
                  <div className="success-text">{ui.successText}</div>
                  {createdOrderNo ? <div className="success-order-no">#{createdOrderNo}</div> : null}
                  <a href={withLang('/lookup', lang)} className="btn-secondary link-button success-link">
                    {ui.trackOrder}
                  </a>
                </div>
              ) : null}
            </section>
          </>
        )}

        <footer className="footer">
          <p>© 2026 Agnopol. All rights reserved.</p>

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

      <style jsx global>{`
        .pay-page-shell {
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

        .card-soft,
        .card-soft-sub {
          border-radius: 28px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          backdrop-filter: blur(14px);
        }

        .card-soft-sub {
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
          border-radius: 22px;
          box-shadow: none;
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

        .pay-back-wrap {
          max-width: 700px;
          margin: 0 auto 16px;
        }

        .back-link {
          color: var(--text-main, #0a1736);
          text-decoration: none;
          box-shadow: var(--shadow-soft, 0 18px 40px rgba(10, 23, 54, 0.08));
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease;
        }

        .back-link:hover {
          transform: translateY(-1px);
        }

        .back-link-pill {
          width: 100%;
          min-height: 52px;
          padding: 0 18px;
          border-radius: 20px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-sizing: border-box;
          font-size: 15px;
          font-weight: 800;
        }

        .back-link-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          line-height: 1;
        }

        .pay-main-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
        }

        .pay-title {
          font-size: clamp(26px, 4.8vw, 34px);
          font-weight: 900;
          color: var(--text-main, #0a1736);
        }

        .pay-subtitle {
          margin-top: 8px;
          margin-bottom: 16px;
          color: var(--text-soft, #7b8798);
          line-height: 1.7;
        }

        .pay-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .pay-info-card,
        .proof-card {
          padding: 16px;
        }

        .section-mini-title {
          font-size: 16px;
          font-weight: 900;
          color: var(--text-main, #0a1736);
          margin-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(10, 23, 54, 0.06);
          color: var(--text-main, #0a1736);
          font-size: 14px;
        }

        .summary-row:last-child {
          border-bottom: 0;
        }

        .summary-row-amount strong {
          font-size: 20px;
          color: var(--brand, #0b2570);
        }

        .network-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .network-option {
          min-height: 48px;
          border-radius: 16px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card-soft, rgba(255, 255, 255, 0.88));
          color: var(--text-main, #0a1736);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            border-color 0.16s ease;
        }

        .network-option:hover {
          transform: translateY(-1px);
        }

        .network-option.active {
          background: var(--brand, #0b2570);
          color: var(--brand-contrast, #fff);
          border-color: var(--brand, #0b2570);
        }

        .address-card {
          margin-top: 14px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(11, 37, 112, 0.04);
          border: 1px solid rgba(11, 37, 112, 0.1);
        }

        .address-label {
          font-size: 13px;
          color: var(--text-soft, #7b8798);
          margin-bottom: 8px;
        }

        .address-value {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-main, #0a1736);
          word-break: break-all;
          margin-bottom: 12px;
        }

        .notice-grid {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        .notice-card {
          padding: 16px;
          border-radius: 22px;
          border: 1px solid var(--border-soft, rgba(10, 23, 54, 0.08));
          background: var(--bg-card, rgba(255, 255, 255, 0.96));
        }

        .notice-card-warning {
          background: rgba(255, 179, 0, 0.08);
          border-color: rgba(255, 179, 0, 0.22);
        }

        .notice-text {
          color: var(--text-main, #0a1736);
          line-height: 1.7;
          font-size: 14px;
        }

        .proof-card {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .proof-hint,
        .proof-ready {
          color: var(--text-soft, #7b8798);
        }

        .input {
          width: 100%;
          min-height: 52px;
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
        .small-line-button {
          appearance: none;
          border: 0;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            background 0.16s ease,
            color 0.16s ease,
            opacity 0.16s ease,
            border-color 0.16s ease;
        }

        .btn-primary:hover,
        .btn-secondary:hover,
        .small-line-button:hover {
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
        .small-line-button,
        .link-button {
          width: 100%;
          min-height: 48px;
          border-radius: 16px;
          background: rgba(11, 37, 112, 0.04);
          color: var(--brand, #0b2570);
          border: 1.5px solid var(--brand, #0b2570);
          font-size: 14px;
          font-weight: 800;
          box-sizing: border-box;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-secondary:hover,
        .small-line-button:hover,
        .link-button:hover {
          background: rgba(11, 37, 112, 0.08);
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

        .success-box {
          margin-top: 14px;
        }

        .success-title {
          font-size: 16px;
          font-weight: 900;
        }

        .success-text {
          margin-top: 6px;
        }

        .success-order-no {
          margin-top: 8px;
          font-weight: 900;
        }

        .success-link {
          margin-top: 12px;
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

        @media (min-width: 768px) {
          .hero-tools {
            transform: translateX(-18px);
          }

          .hero-mode {
            transform: translateX(18px);
          }
        }

        @media (max-width: 767px) {
          .pay-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .pay-page-shell {
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

          .pay-main-card {
            padding: 16px;
          }

          .footer-links {
            gap: 10px 14px;
          }
        }

        @media (max-width: 420px) {
          .pay-page-shell {
            padding-left: 10px;
            padding-right: 10px;
          }

          .brand-title {
            font-size: clamp(42px, 15vw, 60px);
          }
        }
      `}</style>
    </main>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={null}>
      <PayPageInner />
    </Suspense>
  )
}
