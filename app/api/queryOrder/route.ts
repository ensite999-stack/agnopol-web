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

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'queryOrder',
    message: 'Use POST with email to query orders.',
  })
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const email = String(body?.email || '')
      .trim()
      .toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, status, admin_note, created_at'
      )
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for this email' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: data,
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
