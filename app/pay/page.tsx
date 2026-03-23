'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

type PaymentNetwork = 'trc20_usdt' | 'base_usdc'

type PayParams = {
  username: string
  email: string
  productType: string
  duration: string
  starsAmount: string
  priceUsd: string
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

function buildUi(lang: string) {
  if (lang === 'zh-cn') {
    return {
      title: '付款',
      subtitle: '安全完成您的订单付款。',
      back: '返回',
      summary: '订单摘要',
      product: '产品',
      amount: '金额',
      username: 'Telegram 用户名',
      email: '邮箱',
      warningTitle: '重要提示',
      warningBody:
        '转账请使用正确的 TRC20 USDT 或 Base USDC 网络与币种，不要使用其他网络。实际到账金额必须与订单金额完全一致。',
      eta: '为了确保资金安全与合规审查，我们的标准处理时间为 5 - 15 分钟。在网络拥堵时，最迟不超过 2 小时。',
      paymentMethod: '支付方式',
      trc20Label: 'TRC20 USDT',
      baseLabel: 'Base USDC',
      network: '网络',
      copy: '复制',
      copied: '已复制',
      copySuccess: '收款地址已复制。',
      uploadTitle: '支付凭证',
      uploadHint: '上传您已完成支付的截图凭证。',
      selectFile: '选择文件',
      proofReady: '凭证文件已就绪。',
      noProof: '暂未上传凭证。',
      preview: '预览',
      txHashTitle: '交易哈希',
      txHashPlaceholder: '可选填写交易哈希',
      proofOrHashHint: '您可以上传截图，和/或填写交易哈希。',
      submit: '确认付款',
      submitting: '确认中...',
      orderCreated: '付款信息已提交成功。',
      orderNo: '订单号',
      successDesc: '您的订单已进入处理流程。预计五分钟内处理完成，请稍后通过首页订单查询功能查看订单详细信息。',
      invalidOrder: '订单信息无效。',
      createError: '提交付款失败。',
    }
  }

  if (lang === 'zh-tw') {
    return {
      title: '付款',
      subtitle: '安全完成您的訂單付款。',
      back: '返回',
      summary: '訂單摘要',
      product: '產品',
      amount: '金額',
      username: 'Telegram 用戶名',
      email: '電子郵件',
      warningTitle: '重要提示',
      warningBody:
        '轉帳請使用正確的 TRC20 USDT 或 Base USDC 網路與幣種，不要使用其他網路。實際到帳金額必須與訂單金額完全一致。',
      eta: '為了確保資金安全與合規審查，我們的標準處理時間為 5 - 15 分鐘。在網路擁堵時，最遲不超過 2 小時。',
      paymentMethod: '支付方式',
      trc20Label: 'TRC20 USDT',
      baseLabel: 'Base USDC',
      network: '網路',
      copy: '複製',
      copied: '已複製',
      copySuccess: '收款地址已複製。',
      uploadTitle: '支付憑證',
      uploadHint: '上傳您已完成支付的截圖憑證。',
      selectFile: '選擇文件',
      proofReady: '憑證文件已就緒。',
      noProof: '暫未上傳憑證。',
      preview: '預覽',
      txHashTitle: '交易哈希',
      txHashPlaceholder: '可選填寫交易哈希',
      proofOrHashHint: '您可以上傳截圖，和/或填寫交易哈希。',
      submit: '確認付款',
      submitting: '確認中...',
      orderCreated: '付款資訊已提交成功。',
      orderNo: '訂單號',
      successDesc: '您的訂單已進入處理流程。預計五分鐘內處理完成，請稍後透過首頁訂單查詢功能查看訂單詳細資訊。',
      invalidOrder: '訂單資訊無效。',
      createError: '提交付款失敗。',
    }
  }

  return {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    username: 'Telegram Username',
    email: 'Email',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. The received amount must exactly match the order amount.',
    eta: 'For fund security and compliance review, our standard processing time is 5 - 15 minutes. During network congestion, it may take up to 2 hours.',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    network: 'Network',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    proofReady: 'Proof file ready.',
    noProof: 'No proof uploaded yet.',
    preview: 'Preview',
    txHashTitle: 'Transaction Hash',
    txHashPlaceholder: 'Optional transaction hash',
    proofOrHashHint: 'You may upload a screenshot and/or enter a transaction hash.',
    submit: 'Confirm Payment',
    submitting: 'Submitting...',
    orderCreated: 'Payment information submitted successfully.',
    orderNo: 'Order No',
    successDesc: 'Your order has entered processing. Please check the order details later from the homepage lookup.',
    invalidOrder: 'Invalid order information.',
    createError: 'Failed to submit payment.',
  }
}

export default function PayPage() {
  const { lang, t } = useI18n()
  const ui = useMemo(() => buildUi(lang), [lang])

  const [params, setParams] = useState<PayParams>({
    username: '',
    email: '',
    productType: 'tg_premium',
    duration: '12m',
    starsAmount: '50',
    priceUsd: '0',
  })

  const [config, setConfig] = useState<PublicConfig>(defaultConfig)
  const [configError, setConfigError] = useState('')
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
    let active = true

    async function boot() {
      setParams(getQueryParams())

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
          setReady(true)
        }
      }
    }

    boot()

    return () => {
      active = false
    }
  }, [])

  const networkAddress =
    selectedNetwork === 'trc20_usdt' ? config.trc20_address : config.base_address

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
        throw new Error(ui.invalidOrder)
      }

      if (!proofBase64 && !txHash.trim()) {
        throw new Error(lang === 'zh-cn' ? '请先上传付款截图或填写交易哈希。' : lang === 'zh-tw' ? '請先上傳付款截圖或填寫交易哈希。' : 'Please upload payment proof or enter a transaction hash.')
      }

      const payload = {
        username: params.username,
        email: params.email,
        product_type: params.productType,
        duration: params.productType === 'tg_premium' ? params.duration : null,
        stars_amount: params.productType === 'tg_stars' ? Number(params.starsAmount) : null,
        price_usd: Number(params.priceUsd),
        payment_network: selectedNetwork,
        payment_address: networkAddress,
        proof_image_base64: proofBase64 || null,
        tx_hash: txHash.trim() || null,
      }

      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || ui.createError)
      }

      setSuccessOrderNo(data?.order_no || '')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : ui.createError)
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
      <div className="site-container" style={{ minWidth: 0 }}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <a href={`/?lang=${lang}`} style={{ textDecoration: 'none', color: '#475569', fontSize: 14 }}>
            ← {ui.back}
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
            {ui.title}
          </p>

          <p style={{ marginTop: 8, color: '#64748b', fontSize: 15 }}>
            {ui.subtitle}
          </p>
        </header>

        {configError ? (
          <div className="status-box-error" style={{ maxWidth: 1120, margin: '0 auto 16px' }}>
            {configError}
          </div>
        ) : null}

        <div className="two-col">
          <section className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              {ui.summary}
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
                <div className="small-muted">{ui.product}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{productLabel}</div>
              </div>

              <div>
                <div className="small-muted">{ui.amount}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>${params.priceUsd}</div>
              </div>

              <div>
                <div className="small-muted">{ui.username}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {params.username || '-'}
                </div>
              </div>

              <div>
                <div className="small-muted">{ui.email}</div>
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
                {ui.warningTitle}
              </div>

              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
                {ui.warningBody}
              </div>
            </div>

            <div style={{ marginTop: 16, fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 8px 0' }}>{t.common.slogan}</p>
              <p style={{ margin: 0 }}>{ui.eta}</p>
            </div>
          </section>

          <section className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, color: '#64748b' }}>{ui.paymentMethod}</div>

            <div className="network-tabs">
              <button
                type="button"
                className={`network-tab ${selectedNetwork === 'trc20_usdt' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('trc20_usdt')}
              >
                {ui.trc20Label}
              </button>

              <button
                type="button"
                className={`network-tab ${selectedNetwork === 'base_usdc' ? 'active' : ''}`}
                onClick={() => setSelectedNetwork('base_usdc')}
              >
                {ui.baseLabel}
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
                {ui.network}
              </div>

              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                {selectedNetwork === 'trc20_usdt' ? ui.trc20Label : ui.baseLabel}
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
                {networkAddress}
              </div>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleCopy(networkAddress, selectedNetwork)}
                style={{ marginTop: 10 }}
              >
                {copiedNetwork === selectedNetwork ? `${ui.copied} ✓` : ui.copy}
              </button>

              {copiedNetwork === selectedNetwork ? (
                <div className="status-box-success" style={{ textAlign: 'center' }}>
                  {ui.copySuccess}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                {ui.uploadTitle}
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: '1px dashed rgba(15, 23, 42, 0.18)',
                  background: 'rgba(255,255,255,0.62)',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
                  {ui.uploadHint}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <button type="button" className="btn-secondary" onClick={handleChooseFile}>
                  {ui.selectFile}
                </button>

                <div style={{ marginTop: 10, fontSize: 13, color: '#475569', wordBreak: 'break-all' }}>
                  {proofName ? `${ui.proofReady} ${proofName}` : ui.noProof}
                </div>

                {proofPreview ? (
                  <div style={{ marginTop: 12 }}>
                    <div className="small-muted" style={{ marginBottom: 6 }}>
                      {ui.preview}
                    </div>

                    <img
                      src={proofPreview}
                      alt="proof preview"
                      style={{
                        width: '100%',
                        borderRadius: 14,
                        border: '1px solid rgba(15, 23, 42, 0.08)',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ marginTop: 14, fontSize: 13, color: '#475569', marginBottom: 8 }}>
                  {ui.txHashTitle}
                </div>

                <input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder={ui.txHashPlaceholder}
                  className="input"
                  style={{ padding: 12, fontSize: 14 }}
                />

                <div style={{ marginTop: 10, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                  {ui.proofOrHashHint}
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
              {submitting ? ui.submitting : ui.submit}
            </button>

            {successOrderNo ? (
              <div className="status-box-success">
                <div style={{ fontWeight: 800 }}>{ui.orderCreated}</div>
                <div style={{ marginTop: 6 }}>
                  {ui.orderNo}: {successOrderNo}
                </div>
                <div style={{ marginTop: 8 }}>{ui.successDesc}</div>
              </div>
            ) : null}

            {errorText ? <div className="status-box-error">{errorText}</div> : null}
          </section>
        </div>
      </div>
    </main>
  )
}
