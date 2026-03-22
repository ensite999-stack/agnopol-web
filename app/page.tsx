'use client'

import { useEffect, useMemo, useState } from 'react'

type PriceData = {
  tg_premium_3m: number
  tg_premium_6m: number
  tg_premium_12m: number
  tg_stars_rate: number
}

type DurationType = '3m' | '6m' | '12m'

export default function Page() {
  const [prices, setPrices] = useState<PriceData | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<DurationType>('3m')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/getPrices')
      .then((res) => res.json())
      .then((data) => {
        setPrices({
          tg_premium_3m: Number(data.tg_premium_3m),
          tg_premium_6m: Number(data.tg_premium_6m),
          tg_premium_12m: Number(data.tg_premium_12m),
          tg_stars_rate: Number(data.tg_stars_rate),
        })
      })
      .catch(() => {
        setMessage('价格加载失败')
      })
  }, [])

  const currentPrice = useMemo(() => {
    if (!prices) return null
    if (selectedDuration === '3m') return prices.tg_premium_3m
    if (selectedDuration === '6m') return prices.tg_premium_6m
    return prices.tg_premium_12m
  }, [prices, selectedDuration])

  async function handleCreateOrder() {
    if (!email.trim()) {
      setMessage('请输入电子邮件')
      return
    }

    if (currentPrice === null) {
      setMessage('价格尚未加载完成')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          product_type: 'tg_premium',
          duration: selectedDuration,
          stars_amount: null,
          price_usd: currentPrice,
          status: 'pending',
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage('订单创建成功')
        setEmail('')
      } else {
        setMessage(data.error || '订单创建失败')
      }
    } catch {
      setMessage('网络错误')
    }

    setLoading(false)
  }

  function planButtonStyle(active: boolean): React.CSSProperties {
    return {
      padding: '12px 14px',
      borderRadius: '10px',
      border: active ? '2px solid #111827' : '1px solid #d1d5db',
      background: active ? '#111827' : '#ffffff',
      color: active ? '#ffffff' : '#111827',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
    }
  }

  return (
    <main
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '24px 16px 60px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '40px',
          lineHeight: 1.1,
          marginBottom: 12,
        }}
      >
        阿格诺波尔
      </h1>

      <p
        style={{
          color: '#4b5563',
          fontSize: '16px',
          marginBottom: 24,
        }}
      >
        TG Premium 会员套餐
      </p>

      <div
        style={{
          display: 'grid',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedDuration('3m')}
          style={planButtonStyle(selectedDuration === '3m')}
        >
          <div>3个月</div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
            {prices ? `$${prices.tg_premium_3m}` : '加载中...'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDuration('6m')}
          style={planButtonStyle(selectedDuration === '6m')}
        >
          <div>6个月</div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
            {prices ? `$${prices.tg_premium_6m}` : '加载中...'}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedDuration('12m')}
          style={planButtonStyle(selectedDuration === '12m')}
        >
          <div>12个月</div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
            {prices ? `$${prices.tg_premium_12m}` : '加载中...'}
          </div>
        </button>
      </div>

      <div
        style={{
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          marginBottom: 20,
          background: '#f9fafb',
        }}
      >
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          当前选择
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          TG Premium {selectedDuration === '3m' ? '3个月' : selectedDuration === '6m' ? '6个月' : '12个月'}
        </div>
        <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>
          {currentPrice === null ? '加载中...' : `$${currentPrice}`}
        </div>
      </div>

      <input
        placeholder="电子邮件"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '14px 12px',
          borderRadius: 10,
          border: '1px solid #d1d5db',
          fontSize: 16,
          marginBottom: 14,
        }}
      />

      <button
        type="button"
        onClick={handleCreateOrder}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 10,
          border: 'none',
          background: loading ? '#9ca3af' : '#111827',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '提交中...' : '创建订单'}
      </button>

      {message ? (
        <p
          style={{
            marginTop: 14,
            fontSize: 14,
            color: message.includes('成功') ? '#065f46' : '#b91c1c',
          }}
        >
          {message}
        </p>
      ) : null}
    </main>
  )
}
