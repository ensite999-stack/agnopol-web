'use client'

import { useMemo, useState } from 'react'

type LangType =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ja'
  | 'ko'
  | 'zh-cn'
  | 'zh-tw'

type OrderLookupProps = {
  lang: LangType
}

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

const messages: Record<
  'en' | 'zh-cn' | 'zh-tw',
  {
    title: string
    subtitle: string
    placeholder: string
    button: string
    loading: string
    notFound: string
    orderNo: string
    status: string
    product: string
    amount: string
    network: string
    createdAt: string
    note: string
    pending: string
    processing: string
    completed: string
    failed: string
    premium: string
    stars: string
    months3: string
    months6: string
    months12: string
  }
> = {
  en: {
    title: 'Order Lookup',
    subtitle: 'Enter your order number to check the latest status.',
    placeholder: 'Enter order number, e.g. APXXXXXX',
    button: 'Check Order',
    loading: 'Checking...',
    notFound: 'Order not found.',
    orderNo: 'Order No',
    status: 'Status',
    product: 'Product',
    amount: 'Amount',
    network: 'Payment Network',
    createdAt: 'Created At',
    note: 'Note',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    premium: 'TG Premium',
    stars: 'TG Stars',
    months3: '3 Months',
    months6: '6 Months',
    months12: '12 Months',
  },
  'zh-cn': {
    title: '订单查询',
    subtitle: '输入订单号，查看最新处理状态。',
    placeholder: '输入订单号，例如 APXXXXXX',
    button: '查询订单',
    loading: '查询中...',
    notFound: '未找到该订单。',
    orderNo: '订单号',
    status: '状态',
    product: '产品',
    amount: '金额',
    network: '支付网络',
    createdAt: '创建时间',
    note: '备注',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    premium: 'TG Premium',
    stars: 'TG Stars',
    months3: '3个月',
    months6: '6个月',
    months12: '12个月',
  },
  'zh-tw': {
    title: '訂單查詢',
    subtitle: '輸入訂單號，查看最新處理狀態。',
    placeholder: '輸入訂單號，例如 APXXXXXX',
    button: '查詢訂單',
    loading: '查詢中...',
    notFound: '未找到該訂單。',
    orderNo: '訂單號',
    status: '狀態',
    product: '產品',
    amount: '金額',
    network: '支付網路',
    createdAt: '建立時間',
    note: '備註',
    pending: '待處理',
    processing: '處理中',
    completed: '已完成',
    failed: '失敗',
    premium: 'TG Premium',
    stars: 'TG Stars',
    months3: '3個月',
    months6: '6個月',
    months12: '12個月',
  },
}

function getText(lang: LangType) {
  if (lang === 'zh-cn') return messages['zh-cn']
  if (lang === 'zh-tw') return messages['zh-tw']
  return messages.en
}

export default function OrderLookup({ lang }: OrderLookupProps) {
  const t = getText(lang)
  const [orderNo, setOrderNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [result, setResult] = useState<OrderResult | null>(null)

  const productLabel = useMemo(() => {
    if (!result) return ''
    if (result.product_type === 'tg_stars') {
      return `${t.stars} ${result.stars_amount ?? 0}`
    }
    if (result.duration === '3m') return `${t.premium} ${t.months3}`
    if (result.duration === '6m') return `${t.premium} ${t.months6}`
    return `${t.premium} ${t.months12}`
  }, [result, t])

  const statusLabel = useMemo(() => {
    if (!result?.status) return '-'
    const status = result.status.toLowerCase()
    if (status === 'pending') return t.pending
    if (status === 'processing') return t.processing
    if (status === 'completed') return t.completed
    if (status === 'failed') return t.failed
    return result.status
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
        throw new Error(data?.error || t.notFound)
      }

      setResult(data.order)
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : t.notFound)
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
        {t.title}
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#6b7280',
          marginBottom: 12,
        }}
      >
        {t.subtitle}
      </div>

      <input
        value={orderNo}
        onChange={(e) => setOrderNo(e.target.value)}
        placeholder={t.placeholder}
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
        {loading ? t.loading : t.button}
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
          <div><strong>{t.orderNo}:</strong> {result.order_no}</div>
          <div><strong>{t.status}:</strong> {statusLabel}</div>
          <div><strong>{t.product}:</strong> {productLabel}</div>
          <div><strong>{t.amount}:</strong> ${result.price_usd ?? result.amount ?? 0}</div>
          <div><strong>{t.network}:</strong> {result.payment_network || '-'}</div>
          <div>
            <strong>{t.createdAt}:</strong>{' '}
            {result.created_at ? new Date(result.created_at).toLocaleString() : '-'}
          </div>
          {result.admin_note ? (
            <div><strong>{t.note}:</strong> {result.admin_note}</div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
