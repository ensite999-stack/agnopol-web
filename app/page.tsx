'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [price, setPrice] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/getPrices')
      .then(res => res.json())
      .then(data => {
        setPrice(data.tg_premium_3m)
      })
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>阿格诺波尔</h1>

      <p>
        价格：
        {price === null ? '加载中...' : `${price} 美元`}
      </p>

      <input placeholder="电子邮件" />
      <br />
      <button>创建订单</button>
    </div>
  )
}
