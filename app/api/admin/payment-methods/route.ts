import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PaymentMethodInput = {
  id?: number
  display_name?: string
  chain_name?: string
  token_name?: string
  address?: string
  sort_order?: number
  is_enabled?: boolean
}

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

function normalizeItem(item: PaymentMethodInput, index: number) {
  const displayName = String(item?.display_name || '').trim()
  const chainName = String(item?.chain_name || '').trim()
  const tokenName = String(item?.token_name || '').trim()
  const address = String(item?.address || '').trim()
  const sortOrder = Number.isFinite(Number(item?.sort_order))
    ? Number(item?.sort_order)
    : index + 1

  return {
    id: item?.id,
    display_name: displayName,
    chain_name: chainName,
    token_name: tokenName,
    address,
    sort_order: sortOrder,
    is_enabled: item?.is_enabled !== false,
  }
}

function validateItem(item: ReturnType<typeof normalizeItem>) {
  if (!item.display_name) return 'display_name is required'
  if (!item.chain_name) return 'chain_name is required'
  if (!item.token_name) return 'token_name is required'
  if (!item.address) return 'address is required'
  if (!Number.isFinite(item.sort_order)) return 'sort_order is invalid'
  return ''
}

export async function GET() {
  try {
    requireAdminSession()
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
      items: data || [],
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      }
    )
  }
}

export async function PUT(req: Request) {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const body = await req.json()

    const items = Array.isArray(body?.items) ? body.items : null
    if (!items) {
      return noStoreJson({ error: 'items is required' }, { status: 400 })
    }

    const normalized = items.map((item: PaymentMethodInput, index: number) =>
      normalizeItem(item, index)
    )

    for (const item of normalized) {
      const err = validateItem(item)
      if (err) {
        return noStoreJson({ error: err }, { status: 400 })
      }
    }

    const existingItems = normalized.filter((item) => item.id)
    const newItems = normalized.filter((item) => !item.id)

    for (const item of existingItems) {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          display_name: item.display_name,
          chain_name: item.chain_name,
          token_name: item.token_name,
          address: item.address,
          sort_order: item.sort_order,
          is_enabled: item.is_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) {
        throw new Error(error.message)
      }
    }

    if (newItems.length > 0) {
      const { error } = await supabase.from('payment_methods').insert(
        newItems.map((item) => ({
          display_name: item.display_name,
          chain_name: item.chain_name,
          token_name: item.token_name,
          address: item.address,
          sort_order: item.sort_order,
          is_enabled: item.is_enabled,
          updated_at: new Date().toISOString(),
        }))
      )

      if (error) {
        throw new Error(error.message)
      }
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
      items: data || [],
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    requireAdminSession()
    const supabase = getSupabase()
    const body = await req.json()

    const id = Number(body?.id)
    if (!Number.isFinite(id) || id <= 0) {
      return noStoreJson({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase.from('payment_methods').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
      }
    )
  }
}
