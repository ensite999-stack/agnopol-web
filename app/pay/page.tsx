'use client'

import { useSearchParams } from 'next/navigation'

export default function PayPage() {
  const searchParams = useSearchParams()

  const lang = searchParams.get('lang') || 'zh-cn'
  const username = searchParams.get('username') || ''
  const email = searchParams.get('email') || ''
  const productType = searchParams.get('product_type') || ''
  const duration = searchParams.get('duration') || ''
  const starsAmount = searchParams.get('stars_amount') || ''
  const priceUsd = searchParams.get('price_usd') || '0'

  return (
    <main
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: 20,
        fontFamily: 'system-ui, Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 40, fontWeight: 900 }}>Agnopol</h1>
      <p>Pay Page</p>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 16,
          border: '1px solid #ddd',
          background: '#fff',
        }}
      >
        <p><strong>lang:</strong> {lang}</p>
        <p><strong>username:</strong> {username || '-'}</p>
        <p><strong>email:</strong> {email || '-'}</p>
        <p><strong>product_type:</strong> {productType || '-'}</p>
        <p><strong>duration:</strong> {duration || '-'}</p>
        <p><strong>stars_amount:</strong> {starsAmount || '-'}</p>
        <p><strong>price_usd:</strong> ${priceUsd}</p>
      </div>
    </main>
  )
}
