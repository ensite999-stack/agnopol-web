import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '../../../../../lib/admin-auth'

export const runtime = 'nodejs'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()
    const id = Number(params.id)

    if (!id) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const allowedStatuses = ['pending_payment', 'paid', 'cancelled']
    const nextStatus =
      typeof body?.status === 'string' ? body.status.trim() : undefined

    if (nextStatus && !allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const patch: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body?.username === 'string') patch.username = body.username.trim()
    if (typeof body?.email === 'string') patch.email = body.email.trim().toLowerCase()
    if (typeof body?.public_note === 'string') patch.public_note = body.public_note
    if (typeof body?.admin_note === 'string') patch.admin_note = body.admin_note
    if (typeof body?.tx_hash === 'string') patch.tx_hash = body.tx_hash.trim()
    if (typeof body?.payment_network === 'string') patch.payment_network = body.payment_network
    if (typeof body?.status === 'string') patch.status = nextStatus

    const { data, error } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', id)
      .select(
        'id, order_no, username, email, product_type, duration, stars_amount, amount, price_usd, payment_network, tx_hash, status, public_note, admin_note, created_at, updated_at'
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const id = Number(params.id)

    if (!id) {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const { error } = await supabase.from('orders').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted_id: id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
