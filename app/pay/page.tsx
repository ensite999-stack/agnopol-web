'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/components/language-provider'
import LanguageSwitcher from '@/components/language-switcher'

type PaymentNetwork = 'trc20_usdt' | 'base_usdc'

type PayParams = {
  username: string
  email: string
  productType: string
  duration: string
  starsAmount: string
  priceUsd: string
}

const NETWORKS: Record<PaymentNetwork, { label: string; address: string }> = {
  trc20_usdt: {
    label: 'TRC20 USDT',
    address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
  },
  base_usdc: {
    label: 'Base USDC',
    address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
  },
}

function getQueryParams(): PayParams {
  if (typeof window === 'undefined') {
    return {
      username: '',
      email: '',
      productType: 'tg_premium',
      duration: '12m',
      starsAmount: '50',
      priceUsd: '0',
    }
  }

  const searchParams = new URLSearchParams(window.location.search)

  return {
    username: searchParams.get('username') || '',
    email: searchParams.get('email') || '',
    productType: searchParams.get('product_type') || 'tg_premium',
    duration: searchParams.get('duration') || '12m',
    starsAmount: searchParams.get('stars_amount') || '50',
    priceUsd: searchParams.get('price_usd') || '0',
  }
}

export default function PayPage() {
  const { lang, t } = useI18n()
  const [params, setParams] = useState<PayParams>({
    username: '',
    email: '',
    productType: 'tg_premium',
    duration: '12m',
    starsAmount: '50',
    priceUsd: '0',
  })

  const [ready, setReady] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork>('trc20_usdt')
  const [copiedNetwork, setCopiedNetwork] = useState<PaymentNetwork | null>(null)
  const [proofName, setProofName] = useState('')
  const [proofBase64, setProofBase64] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [txHash, setTxHash] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrderNo, setSuccessOrderNo] = useState('')
  const [errorText, setErrorText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setParams(getQueryParams())
    setReady(true)
  }, [])

  const selectedAddress = NETWORKS[selectedNetwork].address

  const productLabel = useMemo(() => {
    if (params.productType === 'tg_stars') {
      return `${t.home.tgStars} ${params.starsAmount}`
    }
    if (params.duration === '3m') return `${t.home.tgPremium} ${t.home.months3}`
    if (params.duration === '6m') return `${t.home.tgPremium} ${t.home.months6}`
    return `${t.home.tgPremium} ${t.home.months12}`
  }, [params.productType, params.duration, params.starsAmount, t])

  async function handleCopy(text: string, network: PaymentNetwork) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedNetwork(network)
      setTimeout(() => setCopiedNetwork(null), 1800)
    } catch {
      setCopiedNetwork(null)
    }
  }

  function handleChooseFile() {
    fileRef.current?.click()
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setProofName(file.name)

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setProofBase64(result)
      setProofPreview(result)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setErrorText('')
    setSuccessOrderNo('')

    try {
      if (!params.email || !params.priceUsd || Number(params.priceUsd) <= 0) {
        throw new Error(t.pay.invalidOrder)
      }

      const payload = {
        username: params.username,
        email: params.email,
        product_type: params.productType,
        duration: params.productType === 'tg_premium' ? params.duration : null,
        stars_amount: params.productType === 'tg_stars' ? Number(params.starsAmount) : null,
        price_usd: Number(params.priceUsd),
        payment_network: selectedNetwork,
        payment_address: selectedAddress,
        proof_image_base64: proofBase64 || null,
        tx_hash: txHash.trim() || null,
      }

      const response = await fetch(`${window.location.origin}/api/createOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || t.pay.createError)
      }

      setSuccessOrderNo(data?.order_no || '')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t.pay.createError)
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <main className="site-shell">
        <div className="site-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="card">{t.common.loading}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="site-shell">
      <div className="site-container">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <a href={`/?lang=${lang}`} style={{ textDecoration: 'none', color: '#475569', fontSize: 14 }}>
            ← {t.common.back}
          </a>
          <LanguageSwitcher />
        </div>

        <header className="hero-center" style={{ marginBottom: 18 }}>
          <h1 className="brand-title" style={{ fontSize: 'clamp(42px, 8vw, 76px)' }}>
            {t.common.brand}
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: '#64748b',
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 700,
            }}
          >
            {t.pay.title}
          </p>

          <p style={{ marginTop: 8, color: '#64748b', fontSize: 15 }}>
            {t.pay.subtitle}
          </p>
        </header>

        <div className="two-col">
          <section className="card">
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              {t.pay.summary}
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 14,
              }}
            >
              ${params.priceUsd}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div className="small-muted">{t.pay.product}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{productLabel}</div>
              </div>

              <div>
                <div className="small-muted">{t.pay.amount}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>${params.priceUsd}</div>
              </div>

              <div>
                <div className="small-muted">{t.common.username}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {params.username || '-'}
                </div>
              </div>

              <div>
                <div className="small-muted">{t.common.email}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {params.email || '-'}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                borderRadius: 16,
                padding: 14,
                background: 'rgba(15, 23, 42, 0.035)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: 8,
                }}
              >
                {t.pay.warningTitle}
              </div>

              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                {t.pay.warningBody}
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px 0' }}>{t.common.slogan}</p>
              <p style={{ margin: 0 }}>{t.pay.eta}</p>
            </div>
          </section>

          <section className="card">
            <div style={{ fontSize: 14, color: '#64748b' }}>{t.pay.paymentMethod}</div>

            <div className="network-tabs">
              <button
                type="button"
                className={`network-tab ${selectedNetwork === 'trc20_usdt' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('trc20_usdt')}
              >
                {t.pay.trc20Label}
              </button>

              <button
                type="button"
                className={`network-tab ${selectedNetwork === 'base_usdc' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('base_usdc')}
              >
                {t.pay.baseLabel}
              </button>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: 14,
                borderRadius: 16,
                background: 'rgba(15, 23, 42, 0.035)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
              }}
            >
              <div className="small-muted" style={{ marginBottom: 6 }}>
                {t.pay.network}
              </div>

              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                {selectedNetwork === 'trc20_usdt' ? t.pay.trc20Label : t.pay.baseLabel}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: '#0f172a',
                  wordBreak: 'break-all',
                  lineHeight: 1.7,
                  padding: 12,
                  borderRadius: 12,
                  background: '#fff',
                  border:
                    copiedNetwork === selectedNetwork
                      ? '1px solid rgba(34, 197, 94, 0.45)'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                {selectedAddress}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(selectedAddress, selectedNetwork)}
                style={{ marginTop: 10 }}
              >
                {copiedNetwork === selectedNetwork ? `${t.common.copied} ✓` : t.common.copy}
              </button>

              {copiedNetwork === selectedNetwork ? (
                <div className="status-box-success" style={{ textAlign: 'center' }}>
                  {t.pay.copySuccess}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                {t.pay.uploadTitle}
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: '1px dashed rgba(15, 23, 42, 0.18)',
                  background: 'rgba(255,255,255,0.62)',
                }}
              >
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
                  {t.pay.uploadHint}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <button type="button" className="btn-secondary" onClick={handleChooseFile}>
                  {t.pay.selectFile}
                </button>

                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                  {proofName ? `${t.pay.proofReady} ${proofName}` : t.pay.noProof}
                </div>

                {proofPreview ? (
                  <div style={{ marginTop: 12 }}>
                    <div className="small-muted" style={{ marginBottom: 6 }}>
                      {t.pay.preview}
                    </div>

                    <img
                      src={proofPreview}
                      alt="proof preview"
                      style={{
                        width: '100%',
                        borderRadius: 14,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ marginTop: 14, fontSize: 13, color: '#475569', marginBottom: 8 }}>
                  {t.pay.txHashTitle}
                </div>

                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder={t.pay.txHashPlaceholder}
                  className="input"
                  style={{ padding: 12, fontSize: 14 }}
                />

                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                  {t.pay.proofOrHashHint}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary"
              style={{ marginTop: 16, opacity: submitting ? 0.8 : 1 }}
            >
              {submitting ? t.pay.submitting : t.pay.submit}
            </button>

            {successOrderNo ? (
              <div className="status-box-success">
                <div style={{ fontWeight: 800 }}>{t.pay.orderCreated}</div>
                <div style={{ marginTop: 6 }}>
                  {t.pay.orderNo}: {successOrderNo}
                </div>
                <div style={{ marginTop: 8 }}>
                  {t.pay.successDesc}
                </div>
              </div>
            ) : null}

            {errorText ? <div className="status-box-error">{errorText}</div> : null}
          </section>
        </div>
      </div>
    </main>
  )
}
