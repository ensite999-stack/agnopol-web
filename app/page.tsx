'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [price, setPrice] = useState(0)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/getPrices')
      .then(res => res.json())
      .then(data => {
        setPrice(data.tg_premium_1m || 10)
      })
  }, [])

  async function handleOrder() {
    setLoading(true)

    const res = await fetch('/api/createOrder', {
      method: 'POST',
      body: JSON.stringify({
        email,
        product: 'TG Premium 1M',
        amount: price,
        status: 'pending'
      })
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      alert('Order created')
    } else {
      alert('Error')
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Agnopol</h1>

      <p>Price: ${price}</p>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <br /><br />

      <button onClick={handleOrder} disabled={loading}>
        {loading ? 'Processing...' : 'Create Order'}
      </button>
    </main>
  )
}
