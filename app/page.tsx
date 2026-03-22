'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [price, setPrice] = useState<any>(null)

  useEffect(() => {
    fetch('/api/getPrices')
      .then(res => res.json())
      .then(setPrice)
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Agnopol</h1>
      <p>Price: {price?.tg_premium_3m || 'Loading...'}</p>
    </div>
  )
}
