import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '../../../../lib/admin-auth'
import { expirePendingOrders } from '../../../../lib/order-maintenance'

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

function unauthorizedOr500(error: unknown) {
  const message = error instanceof Error ? error.message : 'Server error'
  const status = error instanceof Error && error.message === 'Unauthorized' ? 401 : 500
  return noStoreJson({ error: message }, { status })
}

export async function GET(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    await expirePendingOrders(supabase)

    const { searchParams } = new URL(req.url)
    const status = String(searchParams.get('status') || 'all')
    const q = String(searchParams.get('q') || '').trim()
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('page_size') || 20)))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('orders')
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, tx_hash, proof_image_base64, status, public_note, admin_note, created_at, updated_at',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (q) {
      query = query.or(`order_no.ilike.%${q}%,email.ilike.%${q}%,username.ilike.%${q}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return noStoreJson({ error: error.message }, { status: 500 })
    }

    return noStoreJson({
      success: true,
      items: data || [],
      total: count || 0,
      page,
      page_size: pageSize,
    })
  } catch (error) {
    return unauthorizedOr500(error)
  }
}

export async function PATCH(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()

    const orderNo = String(body?.order_no || '').trim()
    if (!orderNo) {
      return noStoreJson({ error: 'Missing order_no' }, { status: 400 })
    }

    const patch = {
      username: String(body?.username || '').trim() || null,
      email: String(body?.email || '').trim() || null,
      payment_network: String(body?.payment_network || '').trim() || null,
      tx_hash: String(body?.tx_hash || '').trim() || null,
      public_note: String(body?.public_note || '').trim() || null,
      admin_note: String(body?.admin_note || '').trim() || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('orders')
      .update(patch)
      .eq('order_no', orderNo)
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, tx_hash, proof_image_base64, status, public_note, admin_note, created_at, updated_at'
      )
      .single()

    if (error) {
      return noStoreJson({ error: error.message }, { status: 500 })
    }

    return noStoreJson({
      success: true,
      item: data,
    })
  } catch (error) {
    return unauthorizedOr500(error)
  }
}

export async function POST(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()

    const orderNo = String(body?.order_no || '').trim()
    const action = String(body?.action || '').trim()

    if (!orderNo) {
      return noStoreJson({ error: 'Missing order_no' }, { status: 400 })
    }

    let patch: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (action === 'completed') {
      patch.status = 'completed'
      patch.public_note =
        String(body?.public_note || '').trim() || 'Completed'
    } else if (action === 'restore_paid') {
      patch.status = 'paid'
      patch.public_note =
        String(body?.public_note || '').trim() || 'Payment restored'
    } else if (action === 'cancelled') {
      patch.status = 'cancelled'
      patch.public_note =
        String(body?.public_note || '').trim() || 'Order cancelled'
    } else {
      return noStoreJson({ error: 'Unsupported action' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(patch)
      .eq('order_no', orderNo)
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, tx_hash, proof_image_base64, status, public_note, admin_note, created_at, updated_at'
      )
      .single()

    if (error) {
      return noStoreJson({ error: error.message }, { status: 500 })
    }

    return noStoreJson({
      success: true,
      item: data,
    })
  } catch (error) {
    return unauthorizedOr500(error)
  }
}

export async function DELETE(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()
    const orderNo = String(body?.order_no || '').trim()

    if (!orderNo) {
      return noStoreJson({ error: 'Missing order_no' }, { status: 400 })
    }

    const { error } = await supabase.from('orders').delete().eq('order_no', orderNo)

    if (error) {
      return noStoreJson({ error: error.message }, { status: 500 })
    }

    return noStoreJson({
      success: true,
      order_no: orderNo,
    })
  } catch (error) {
    return unauthorizedOr500(error)
  }
}
