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

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'createOrder',
    message: 'Use POST to create an order.',
  })
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const username = String(body?.username || '').trim()
    const email = String(body?.email || '')
      .trim()
      .toLowerCase()

    const product_type = body?.product_type || null
    const duration = body?.duration || null
    const stars_amount = body?.stars_amount ?? null
    const price_usd = Number(body?.price_usd || 0)
    const payment_network = body?.payment_network || null
    const payment_address = body?.payment_address || null
    const proof_image_base64 = body?.proof_image_base64 || null
    const tx_hash = String(body?.tx_hash || '').trim() || null

    if (!email || !payment_network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!price_usd || Number.isNaN(price_usd) || price_usd <= 0) {
      return NextResponse.json(
        { error: 'Invalid price_usd' },
        { status: 400 }
      )
    }

    let insertedData: any = null
    let insertError: any = null

    for (let i = 0; i < 5; i++) {
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
            stars_amount:
              product_type === 'tg_stars'
                ? Number(stars_amount || 0)
                : null,

            amount: price_usd,
            price_usd,

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
