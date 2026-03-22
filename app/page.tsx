'use client'

import { useEffect, useState } from 'react'

const languages = [
  'English',
  'Français',
  'Deutsch',
  'Español',
  '日本語',
  '한국어',
  '繁體中文',
  '简体中文',
]

export default function Home() {
  const [price, setPrice] = useState<any>(null)
  const [selected, setSelected] = useState<'3m' | '6m' | '12m'>('12m')

  useEffect(() => {
    fetch('/api/getPrices')
      .then((res) => res.json())
      .then((data) => setPrice(data))
  }, [])

  const getPrice = () => {
    if (!price) return '...'
    if (selected === '3m') return price.tg_premium_3m
    if (selected === '6m') return price.tg_premium_6m
    return price.tg_premium_12m
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: 20,
        fontFamily: 'system-ui',
      }}
    >
      {/* 🌍 语言选择 */}
      <div style={{ marginBottom: 20 }}>
        <select style={{ padding: 6 }}>
          {languages.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* 🧠 品牌 */}
      <h1 style={{ fontSize: 36, fontWeight: 'bold' }}>
        Agnopol
      </h1>

      <p style={{ color: '#6b7280', marginBottom: 20 }}>
        One world, one breath.
      </p>

      {/* 📦 标题 */}
      <p style={{ fontSize: 18, marginBottom: 12 }}>
        TG Premium Plans
      </p>

      {/* 💳 套餐 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 3个月 */}
        <div
          onClick={() => setSelected('3m')}
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #ddd',
            background: selected === '3m' ? '#111827' : '#fff',
            color: selected === '3m' ? '#fff' : '#000',
            cursor: 'pointer',
          }}
        >
          <div>3 Months</div>
          <div>${price?.tg_premium_3m ?? '...'}</div>
        </div>

        {/* 6个月 */}
        <div
          onClick={() => setSelected('6m')}
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #ddd',
            background: selected === '6m' ? '#111827' : '#fff',
            color: selected === '6m' ? '#fff' : '#000',
            cursor: 'pointer',
          }}
        >
          <div>6 Months</div>
          <div>${price?.tg_premium_6m ?? '...'}</div>
        </div>

        {/* 12个月 */}
        <div
          onClick={() => setSelected('12m')}
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #ddd',
            background: selected === '12m' ? '#111827' : '#fff',
            color: selected === '12m' ? '#fff' : '#000',
            cursor: 'pointer',
          }}
        >
          <div>12 Months</div>
          <div>${price?.tg_premium_12m ?? '...'}</div>
        </div>
      </div>

      {/* 🧾 当前选择 */}
      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: '#f3f4f6',
        }}
      >
        <div style={{ fontSize: 14 }}>Selected</div>
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>
          TG Premium {selected}
        </div>
        <div style={{ fontSize: 28, fontWeight: 'bold' }}>
          ${getPrice()}
        </div>
      </div>

      {/* 📧 输入 */}
      <input
        placeholder="Email"
        style={{
          marginTop: 20,
          width: '100%',
          padding: 12,
          borderRadius: 10,
          border: '1px solid #ddd',
        }}
      />

      {/* 🚀 按钮 */}
      <button
        onClick={() => {
          window.location.href = '/pay'
        }}
        style={{
          marginTop: 20,
          width: '100%',
          padding: 14,
          background: '#111827',
          color: 'white',
          borderRadius: 10,
          border: 'none',
          fontWeight: 'bold',
        }}
      >
        Create Order
      </button>

      {/* ⚖️ 底部声明 */}
      <p
        style={{
          fontSize: 12,
          color: '#9ca3af',
          marginTop: 30,
          lineHeight: 1.6,
        }}
      >
        Disclaimer: This service is an independent platform and is not affiliated
        with Telegram. All digital products are delivered virtually and are
        non-refundable once processed.
      </p>
    </main>
  )
}
