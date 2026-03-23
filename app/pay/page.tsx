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

const NETWORKS: Record<
  PaymentNetwork,
  { label: string; address: string }
> = {
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
    back: string
    summary: string
    product: string
    amount: string
    email: string
    upload: string
    submit: string
    submitting: string
    success: string
    error: string
    copy: string
    copied: string
    copySuccess: string
  }
> = {
  en: {
    title: 'Payment',
    back: 'Back',
    summary: 'Order Summary',
    product: 'Product',
    amount: 'Amount',
    email: 'Email',
    upload: 'Upload Proof',
    submit: 'Submit Payment',
    submitting: 'Submitting...',
    success: 'Order created successfully',
    error: 'Failed',
    copy: 'Copy',
    copied: 'Copied',
    copySuccess: 'Address copied successfully',
  },
  'zh-cn': {
    title: '支付页',
    back: '返回',
    summary: '订单摘要',
    product: '产品',
    amount: '金额',
    email: '邮箱',
    upload: '上传凭证',
    submit: '提交付款',
    submitting: '提交中...',
    success: '订单创建成功',
    error: '失败',
    copy: '复制',
    copied: '已复制',
    copySuccess: '地址已复制',
  },
  'zh-tw': {
    title: '支付頁',
    back: '返回',
    summary: '訂單摘要',
    product: '產品',
    amount: '金額',
    email: '電子郵件',
    upload: '上傳憑證',
    submit: '提交付款',
    submitting: '提交中...',
    success: '訂單建立成功',
    error: '失敗',
    copy: '複製',
    copied: '已複製',
    copySuccess: '地址已複製',
  },
} as any

function normalizeLang(v: string | null): LangType {
  const allowed = ['de','en','es','fr','ja','ko','zh-cn','zh-tw']
  return allowed.includes(v || '') ? (v as LangType) : 'en'
}

export default function PayPage() {
  const searchParams = useSearchParams()
  const lang = normalizeLang(searchParams.get('lang'))
  const t = messages[lang] || messages['en']

  const price = searchParams.get('price_usd') || '0'
  const email = searchParams.get('email') || ''
  const product = searchParams.get('product_type') || 'tg_premium'

  const [network, setNetwork] = useState<PaymentNetwork>('trc20_usdt')
  const [copied, setCopied] = useState<PaymentNetwork | null>(null)
  const [file, setFile] = useState('')
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const address = NETWORKS[network].address

  async function copyAddr() {
    await navigator.clipboard.writeText(address)
    setCopied(network)
    setTimeout(() => setCopied(null), 1500)
  }

  function onFile(e: any) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setFile(reader.result as string)
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(f)
  }

  async function submit() {
    setLoading(true)
    setSuccess('')
    try {
      const res = await fetch('/api/createOrder', {
        method: 'POST',
        body: JSON.stringify({
          email,
          price_usd: price,
          payment_network: network,
          payment_address: address,
          proof: file,
        }),
      })
      const d = await res.json()
      setSuccess(d.id || 'OK')
    } catch {
      setSuccess(t.error)
    }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Agnopol {t.title}</h1>

      {/* summary */}
      <div>
        <p>{t.product}: {product}</p>
        <p>{t.amount}: ${price}</p>
        <p>{t.email}: {email}</p>
      </div>

      {/* network */}
      <div style={{ marginTop: 20 }}>
        {Object.entries(NETWORKS).map(([k,v]) => (
          <button key={k} onClick={()=>setNetwork(k as any)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* address */}
      <div
        style={{
          marginTop: 20,
          padding: 12,
          border:
            copied===network
              ? '1px solid green'
              : '1px solid #ccc'
        }}
      >
        {address}
      </div>

      <button onClick={copyAddr}>
        {copied===network ? `${t.copied} ✓` : t.copy}
      </button>

      {copied===network && (
        <div style={{ color:'green' }}>{t.copySuccess}</div>
      )}

      {/* upload */}
      <div style={{ marginTop:20 }}>
        <input
          ref={fileRef}
          type="file"
          onChange={onFile}
        />
        {preview && <img src={preview} style={{width:'100%'}} />}
      </div>

      {/* submit */}
      <button onClick={submit} disabled={loading}>
        {loading ? t.submitting : t.submit}
      </button>

      {success && <div>{t.success}: {success}</div>}
    </main>
  )
}
