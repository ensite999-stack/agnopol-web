'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [price, setPrice] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/getPrices')
      .then(res => res.json())
      .then(setPrice)
  }, [])

  async function submit() {
    const res = await fetch('/api/createOrder', {
      method: 'POST',
      body: JSON.stringify({
        email,
        product_type: 'tg_premium',
        duration: '3m',
        price_usd: price.tg_premium_3m
      })
    })

    const data = await res.json()
    setStatus(JSON.stringify(data))
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Agnopol</h1>

      <p>Price: {price?.tg_premium_3m}$</p>

      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <button onClick={submit}>Create Order</button>

      <p>{status}</p>
    </div>
  )
}
