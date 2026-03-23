'use client'

import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type LangType =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'

type PaymentNetwork = 'trc20_usdt' | 'base_usdc'

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

const messages: Record<
  LangType,
  {
    title: string
    subtitle: string
    back: string
    summary: string
    product: string
    amount: string
    email: string
    username: string
    paymentMethod: string
    trc20Label: string
    baseLabel: string
    copy: string
    copied: string
    copySuccess: string
    uploadTitle: string
    uploadHint: string
    selectFile: string
    submit: string
    submitting: string
    orderCreated: string
    orderId: string
    warningTitle: string
    warningBody: string
    brandIntro: string
    eta: string
    noFile: string
    fileReady: string
    preview: string
    createError: string
    network: string
    stars: string
    premium: string
    months3: string
    months6: string
    months12: string
  }
> = {
  de: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram Username',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  en: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram Username',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  es: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram Username',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  fr: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram Username',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  ja: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram ユーザー名',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  ko: {
    title: 'Payment',
    subtitle: 'Complete your order securely.',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    username: 'Telegram 사용자 이름',
    paymentMethod: 'Payment Method',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully.',
    uploadTitle: 'Payment Proof',
    uploadHint: 'Upload a screenshot of your completed payment.',
    selectFile: 'Select File',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    orderCreated: 'Order created successfully.',
    orderId: 'Order ID',
    warningTitle: 'Important',
    warningBody:
      'For transfers, please use the correct TRC20 USDT or Base USDC network and token only. Do not use any other network. The received amount must exactly match the order amount.',
    brandIntro: 'One world, one breath.',
    eta: 'For fund security and compliance review, our standard delivery time is 5–15 minutes. During network congestion, it may take up to 2 hours.',
    noFile: 'No proof uploaded yet.',
    fileReady: 'Proof file ready.',
    preview: 'Preview',
    createError: 'Failed to create order.',
    network: 'Network',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  'zh-cn': {
    title: '支付页',
    subtitle: '安全完成您的订单。',
    back: '返回',
    summary: '订单摘要',
    product: '产品',
    amount: '金额',
    email: '邮箱',
    username: 'TG 用户名',
    paymentMethod: '支付方式',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: '复制',
    copied: '已复制',
    copySuccess: '收款地址已成功复制。',
    uploadTitle: '支付凭证',
    uploadHint: '上传您已完成支付的截图凭证。',
    selectFile: '选择文件',
    submit: '提交付款',
    submitting: '提交中...',
    orderCreated: '订单创建成功。',
    orderId: '订单号',
    warningTitle: '重要提示',
    warningBody:
      '转账请仅使用正确的 TRC20 USDT 或 Base USDC 链与币种。不要使用任何其他网络。到账金额必须与订单金额完全一致。',
    brandIntro: 'One world, one breath.',
    eta: '为了确保资金安全与合规审查，我们的标准交付时间为 5–15 分钟。在网络拥堵时，最长可能达到 2 小时。',
    noFile: '暂未上传凭证。',
    fileReady: '凭证文件已就绪。',
    preview: '预览',
    createError: '创建订单失败。',
    network: '网络',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3个月',
    months6: '6个月',
    months12: '12个月',
  },
  'zh-tw': {
    title: '支付頁',
    subtitle: '安全完成您的訂單。',
    back: '返回',
    summary: '訂單摘要',
    product: '產品',
    amount: '金額',
    email: '電子郵件',
    username: 'TG 用戶名',
    paymentMethod: '支付方式',
    trc20Label: 'TRC20 USDT',
    baseLabel: 'Base USDC',
    copy: '複製',
    copied: '已複製',
    copySuccess: '收款地址已成功複製。',
    uploadTitle: '支付憑證',
    uploadHint: '上傳您已完成支付的截圖憑證。',
    selectFile: '選擇檔案',
    submit: '提交付款',
    submitting: '提交中...',
    orderCreated: '訂單建立成功。',
    orderId: '訂單號',
    warningTitle: '重要提示',
    warningBody:
      '轉帳請僅使用正確的 TRC20 USDT 或 Base USDC 鏈與幣種。不要使用任何其他網路。到帳金額必須與訂單金額完全一致。',
    brandIntro: 'One world, one breath.',
    eta: '為了確保資金安全與合規審查，我們的標準交付時間為 5–15 分鐘。在網路擁堵時，最長可能達到 2 小時。',
    noFile: '尚未上傳憑證。',
    fileReady: '憑證檔案已就緒。',
    preview: '預覽',
    createError: '建立訂單失敗。',
    network: '網路',
    stars: 'TG Stars',
    premium: 'TG Premium',
    months3: '3個月',
    months6: '6個月',
    months12: '12個月',
  },
}

function normalizeLang(value: string | null): LangType {
  const allowed: LangType[] = ['de', 'en', 'es', 'fr', 'ja', 'ko', 'zh-cn', 'zh-tw']
  return allowed.includes(value as LangType) ? (value as LangType) : 'en'
}

export default function PayPage() {
  const searchParams = useSearchParams()

  const lang = normalizeLang(searchParams.get('lang'))
  const t = messages[lang]

  const username = searchParams.get('username') || ''
  const email = searchParams.get('email') || ''
  const productType = searchParams.get('product_type') || 'tg_premium'
  const duration = searchParams.get('duration') || '12m'
  const starsAmount = searchParams.get('stars_amount') || '50'
  const priceUsd = searchParams.get('price_usd') || '0'

  const [selectedNetwork, setSelectedNetwork] = useState<PaymentNetwork>('trc20_usdt')
  const [copiedNetwork, setCopiedNetwork] = useState<PaymentNetwork | null>(null)
  const [proofName, setProofName] = useState('')
  const [proofBase64, setProofBase64] = useState('')
  const [proofPreview, setProofPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOrderId, setSuccessOrderId] = useState('')
  const [errorText, setErrorText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const selectedAddress = NETWORKS[selectedNetwork].address

  const productLabel = useMemo(() => {
    if (productType === 'tg_stars') {
      return `${t.stars} ${starsAmount}`
    }
    if (duration === '3m') return `${t.premium} ${t.months3}`
    if (duration === '6m') return `${t.premium} ${t.months6}`
    return `${t.premium} ${t.months12}`
  }, [productType, duration, starsAmount, t])

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
    setSuccessOrderId('')

    try {
      const payload = {
        username,
        email,
        product_type: productType,
        duration: productType === 'tg_premium' ? duration : null,
        stars_amount: productType === 'tg_stars' ? Number(starsAmount) : null,
        price_usd: Number(priceUsd),
        payment_network: selectedNetwork,
        payment_address: selectedAddress,
        proof_image_base64: proofBase64 || null,
      }

      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || t.createError)
      }

      setSuccessOrderId(data?.order_id || data?.id || '')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t.createError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '24px 14px 40px',
        fontFamily: 'system-ui, Arial, sans-serif',
        background:
          'radial-gradient(circle at top, rgba(224,231,255,0.45), rgba(247,248,250,0) 38%), linear-gradient(180deg, #f8fafc 0%, #f5f7fb 100%)',
      }}
    >
      <style>{`
        .pay-container {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
        }

        .pay-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 960px) {
          .pay-grid {
            grid-template-columns: 1.05fr 0.95fr;
          }
        }

        .pay-card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255,255,255,0.82);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 18px;
        }

        .network-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>

      <div className="pay-container">
        <div style={{ marginBottom: 16 }}>
          <a
            href={`/?lang=${lang}`}
            style={{
              textDecoration: 'none',
              color: '#475569',
              fontSize: 14,
            }}
          >
            ← {t.back}
          </a>
        </div>

        <header style={{ textAlign: 'center', marginBottom: 18 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(42px, 8vw, 76px)',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
            }}
          >
            Agnopol
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
            {t.title}
          </p>

          <p
            style={{
              marginTop: 8,
              color: '#64748b',
              fontSize: 15,
            }}
          >
            {t.subtitle}
          </p>
        </header>

        <div className="pay-grid">
          <section className="pay-card">
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              {t.summary}
            </div>

            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: 14,
              }}
            >
              ${priceUsd}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t.product}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{productLabel}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t.amount}</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>${priceUsd}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t.username}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {username || '-'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{t.email}</div>
                <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                  {email || '-'}
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
                {t.warningTitle}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#475569',
                  lineHeight: 1.7,
                }}
              >
                {t.warningBody}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 13,
                color: '#475569',
                lineHeight: 1.7,
              }}
            >
              <p style={{ margin: '0 0 8px 0' }}>{t.brandIntro}</p>
              <p style={{ margin: 0 }}>{t.eta}</p>
            </div>
          </section>

          <section className="pay-card">
            <div style={{ fontSize: 14, color: '#64748b' }}>{t.paymentMethod}</div>

            <div className="network-tabs">
              <button
                type="button"
                onClick={() => setSelectedNetwork('trc20_usdt')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 14,
                  border:
                    selectedNetwork === 'trc20_usdt'
                      ? '1px solid #0f234f'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                  background:
                    selectedNetwork === 'trc20_usdt' ? '#0b1733' : 'rgba(255,255,255,0.8)',
                  color: selectedNetwork === 'trc20_usdt' ? '#fff' : '#0f172a',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {t.trc20Label}
              </button>

              <button
                type="button"
                onClick={() => setSelectedNetwork('base_usdc')}
                style={{
                  padding: '12px 10px',
                  borderRadius: 14,
                  border:
                    selectedNetwork === 'base_usdc'
                      ? '1px solid #0f234f'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                  background:
                    selectedNetwork === 'base_usdc' ? '#0b1733' : 'rgba(255,255,255,0.8)',
                  color: selectedNetwork === 'base_usdc' ? '#fff' : '#0f172a',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {t.baseLabel}
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
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                {t.network}
              </div>

              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                {selectedNetwork === 'trc20_usdt' ? t.trc20Label : t.baseLabel}
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
                  boxShadow:
                    copiedNetwork === selectedNetwork
                      ? '0 0 0 3px rgba(34, 197, 94, 0.10)'
                      : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {selectedAddress}
              </div>

              <button
                type="button"
                onClick={() => handleCopy(selectedAddress, selectedNetwork)}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border:
                    copiedNetwork === selectedNetwork
                      ? '1px solid rgba(34, 197, 94, 0.28)'
                      : '1px solid rgba(15, 23, 42, 0.08)',
                  background:
                    copiedNetwork === selectedNetwork
                      ? 'rgba(34, 197, 94, 0.10)'
                      : '#fff',
                  color:
                    copiedNetwork === selectedNetwork
                      ? '#166534'
                      : '#0f172a',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copiedNetwork === selectedNetwork ? `${t.copied} ✓` : t.copy}
              </button>

              {copiedNetwork === selectedNetwork ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(34, 197, 94, 0.10)',
                    border: '1px solid rgba(34, 197, 94, 0.18)',
                    color: '#166534',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  {t.copySuccess}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                {t.uploadTitle}
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
                  {t.uploadHint}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={handleChooseFile}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {t.selectFile}
                </button>

                <div style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>
                  {proofName ? `${t.fileReady} ${proofName}` : t.noFile}
                </div>

                {proofPreview ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                      {t.preview}
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
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
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
                opacity: submitting ? 0.8 : 1,
              }}
            >
              {submitting ? t.submitting : t.submit}
            </button>

            {successOrderId ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 14,
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.18)',
                  color: '#166534',
                }}
              >
                <div style={{ fontWeight: 800 }}>{t.orderCreated}</div>
                <div style={{ marginTop: 6 }}>
                  {t.orderId}: {successOrderId}
                </div>
              </div>
            ) : null}

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
          </section>
        </div>
      </div>
    </main>
  )
}
