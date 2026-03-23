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
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)

  return `AGN-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`
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

    const order_no = generateOrderNo()

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_no,
          username,
          email,
          product_type,
          duration,
          stars_amount: product_type === 'tg_stars' ? Number(stars_amount || 0) : null,

          // 兼容旧表字段
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

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: data.id,
      order_no: data.order_no,
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
