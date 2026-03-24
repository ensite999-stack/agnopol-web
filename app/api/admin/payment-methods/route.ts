import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '../../../../lib/admin-auth'

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

const defaultMethods = [
  {
    display_name: 'TON / Toncoin',
    chain_name: 'TON',
    token_name: 'Toncoin',
    address: 'UQC8kp8-ownfGWJdjf4XNteyMHPCkzGr5ZHX28wJjcPaX7dW',
    sort_order: 1,
    is_enabled: true,
  },
  {
    display_name: 'TRC20 / USDT',
    chain_name: 'TRC20',
    token_name: 'USDT',
    address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
    sort_order: 2,
    is_enabled: true,
  },
  {
    display_name: 'Base / USDC',
    chain_name: 'Base',
    token_name: 'USDC',
    address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
    sort_order: 3,
    is_enabled: true,
  },
]

async function seedIfEmpty(supabase: ReturnType<typeof getSupabase>) {
  const { count, error } = await supabase
    .from('payment_methods')
    .select('id', { count: 'exact', head: true })

  if (error) throw new Error(error.message)

  if ((count || 0) > 0) return

  const { error: insertError } = await supabase
    .from('payment_methods')
    .insert(defaultMethods.map((item) => ({ ...item, updated_at: new Date().toISOString() })))

  if (insertError) throw new Error(insertError.message)
}

async function listMethods(supabase: ReturnType<typeof getSupabase>) {
  await seedIfEmpty(supabase)

  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, display_name, chain_name, token_name, address, sort_order, is_enabled, updated_at')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function GET() {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const items = await listMethods(supabase)
    return noStoreJson({ success: true, items })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const body = await req.json()

    const payload = {
      display_name: String(
        body?.display_name ||
          `${String(body?.chain_name || '').trim()} / ${String(body?.token_name || '').trim()}`
      ).trim(),
      chain_name: String(body?.chain_name || '').trim(),
      token_name: String(body?.token_name || '').trim(),
      address: String(body?.address || '').trim(),
      sort_order: Number(body?.sort_order || 0),
      is_enabled: Boolean(body?.is_enabled),
      updated_at: new Date().toISOString(),
    }

    if (!payload.chain_name || !payload.token_name || !payload.address) {
      return noStoreJson({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert(payload)
      .select('id, display_name, chain_name, token_name, address, sort_order, is_enabled, updated_at')
      .single()

    if (error) throw new Error(error.message)
    return noStoreJson({ success: true, item: data })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const body = await req.json()
    const id = Number(body?.id || 0)

    if (!id) return noStoreJson({ error: 'Missing id' }, { status: 400 })

    const patch = {
      display_name: String(
        body?.display_name ||
          `${String(body?.chain_name || '').trim()} / ${String(body?.token_name || '').trim()}`
      ).trim(),
      chain_name: String(body?.chain_name || '').trim(),
      token_name: String(body?.token_name || '').trim(),
      address: String(body?.address || '').trim(),
      sort_order: Number(body?.sort_order || 0),
      is_enabled: Boolean(body?.is_enabled),
      updated_at: new Date().toISOString(),
    }

    if (!patch.chain_name || !patch.token_name || !patch.address) {
      return noStoreJson({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .update(patch)
      .eq('id', id)
      .select('id, display_name, chain_name, token_name, address, sort_order, is_enabled, updated_at')
      .single()

    if (error) throw new Error(error.message)
    return noStoreJson({ success: true, item: data })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const body = await req.json()
    const id = Number(body?.id || 0)

    if (!id) return noStoreJson({ error: 'Missing id' }, { status: 400 })

    const { error } = await supabase.from('payment_methods').delete().eq('id', id)
    if (error) throw new Error(error.message)

    return noStoreJson({ success: true, id })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
