import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function generateOrderNo() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const time = Date.now().toString(36).toUpperCase()
  return `AP${time}${random}`
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const username = String(body?.username || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const productType = String(body?.product_type || '').trim()
    const duration = body?.duration ? String(body.duration).trim() : null
    const starsAmount =
      body?.stars_amount === null || body?.stars_amount === undefined || body?.stars_amount === ''
        ? null
        : Number(body.stars_amount)
    const priceUsd = Number(body?.price_usd || 0)
    const paymentNetwork = String(body?.payment_network || '').trim()
    const txHash = body?.tx_hash ? String(body.tx_hash).trim() : null
    const proofImageBase64 = body?.proof_image_base64
      ? String(body.proof_image_base64)
      : null

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!productType) {
      return NextResponse.json({ error: 'Product type is required' }, { status: 400 })
    }

    if (!priceUsd || Number.isNaN(priceUsd) || priceUsd <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const orderNo = generateOrderNo()

    const insertData: Record<string, any> = {
      order_no: orderNo,
      username: username || null,
      email,
      product_type: productType,
      duration,
      stars_amount: starsAmount,
      amount: priceUsd,
      price_usd: priceUsd,
      payment_network: paymentNetwork || null,
      tx_hash: txHash,
      status: 'pending_payment',
      public_note: null,
      admin_note: null,
      updated_at: new Date().toISOString(),
    }

    if (proofImageBase64) {
      insertData.proof_image_base64 = proofImageBase64
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertData)
      .select('id, order_no, status')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      order_no: data.order_no,
      status: data.status,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
