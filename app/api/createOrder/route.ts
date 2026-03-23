import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function generateOrderNo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomPart = ''

  for (let i = 0; i < 10; i++) {
    randomPart += chars[Math.floor(Math.random() * chars.length)]
  }

  return `AP${randomPart}`
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const {
      username,
      email,
      product_type,
      duration,
      stars_amount,
      price_usd,
      payment_network,
      payment_address,
      proof_image_base64,
      tx_hash,
    } = body

    if (!email || !payment_network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const numericPrice = Number(price_usd || 0)

    if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid price_usd' },
        { status: 400 }
      )
    }

    let orderNo = generateOrderNo()
    let insertError: any = null
    let insertedData: any = null

    for (let i = 0; i < 3; i++) {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            order_no: orderNo,
            username,
            email,
            product_type,
            duration,
            stars_amount:
              product_type === 'tg_stars' ? Number(stars_amount || 0) : null,

            // 兼容旧表
            amount: numericPrice,

            // 新字段
            price_usd: numericPrice,

            payment_network,
            payment_address,
            proof_image_base64,
            tx_hash,
            status: 'pending',
          },
        ])
        .select()
        .single()

      if (!error) {
        insertedData = data
        insertError = null
        break
      }

      insertError = error
      orderNo = generateOrderNo()
    }

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: insertedData.id,
      order_no: insertedData.order_no,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
