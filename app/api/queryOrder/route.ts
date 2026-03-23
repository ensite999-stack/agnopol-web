import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { consumeRateLimit } from '../../../lib/request-rate'
import { expirePendingOrders } from '../../../lib/order-maintenance'

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

function getDeviceId(req: Request, body: any) {
  const bodyDevice = String(body?.device_id || '').trim()
  if (bodyDevice) return bodyDevice

  const forwarded = req.headers.get('x-forwarded-for') || ''
  const ua = req.headers.get('user-agent') || ''
  return `${forwarded}__${ua}`.slice(0, 240)
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const deviceId = getDeviceId(req, body)

    if (!email) {
      return noStoreJson({ error: 'Email is required' }, { status: 400 })
    }

    await expirePendingOrders(supabase)

    try {
      await consumeRateLimit(
        supabase,
        'query_order',
        `${email}__${deviceId}`,
        4,
        5
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        return noStoreJson(
          { error: '查询过于频繁，5 分钟内最多查询 4 次，请稍后再试。' },
          { status: 429 }
        )
      }
      throw error
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
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
