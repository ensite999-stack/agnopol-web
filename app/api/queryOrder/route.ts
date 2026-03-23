import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function noStoreJson(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email) {
      return noStoreJson({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .select(
        'order_no, status, product_type, duration, stars_amount, amount, price_usd, payment_network, created_at, public_note, tx_hash'
      )
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      return noStoreJson({ error: 'No orders found for this email.' }, { status: 404 })
    }

    return noStoreJson({
      success: true,
      orders: data,
    })
  } catch (error) {
    return noStoreJson(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
