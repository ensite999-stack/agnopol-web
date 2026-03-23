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

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const order_no = String(body?.order_no || '').trim().toUpperCase()

    if (!order_no) {
      return NextResponse.json(
        { error: 'Missing order number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, status, admin_note, created_at'
      )
      .eq('order_no', order_no)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order: data,
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
