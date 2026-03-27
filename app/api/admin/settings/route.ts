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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

const defaultSettings = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  stars_min_amount: 50,
  order_notify_email: '',
}

async function getOrCreateSettingsRow() {
  const supabase = getSupabase()

  const { data: existing, error: findError } = await supabase
    .from('site_settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (findError) {
    throw new Error(findError.message)
  }

  if (existing) {
    return existing
  }

  const { data: inserted, error: insertError } = await supabase
    .from('site_settings')
    .insert({
      ...defaultSettings,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  return inserted
}

export async function GET() {
  try {
    requireAdminSession()

    const row = await getOrCreateSettingsRow()

    return noStoreJson({
      success: true,
      item: {
        premium_3m_price: Number(row.premium_3m_price ?? defaultSettings.premium_3m_price),
        premium_6m_price: Number(row.premium_6m_price ?? defaultSettings.premium_6m_price),
        premium_12m_price: Number(row.premium_12m_price ?? defaultSettings.premium_12m_price),
        stars_rate: Number(row.stars_rate ?? defaultSettings.stars_rate),
        stars_min_amount: Number(row.stars_min_amount ?? defaultSettings.stars_min_amount),
        order_notify_email: String(row.order_notify_email ?? defaultSettings.order_notify_email),
        updated_at: row.updated_at,
      },
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

export async function PATCH(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()
    const current = await getOrCreateSettingsRow()

    const starsMinAmount = Number(body?.stars_min_amount ?? 50)
    const notifyEmail = String(body?.order_notify_email ?? '')
      .trim()
      .toLowerCase()

    if (!Number.isFinite(starsMinAmount) || starsMinAmount < 1) {
      return noStoreJson({ error: 'Invalid stars_min_amount' }, { status: 400 })
    }

    if (notifyEmail && !isValidEmail(notifyEmail)) {
      return noStoreJson({ error: 'Invalid order_notify_email' }, { status: 400 })
    }

    const patch = {
      premium_3m_price: Number(body?.premium_3m_price || 0),
      premium_6m_price: Number(body?.premium_6m_price || 0),
      premium_12m_price: Number(body?.premium_12m_price || 0),
      stars_rate: Number(body?.stars_rate || 0),
      stars_min_amount: Math.floor(starsMinAmount),
      order_notify_email: notifyEmail,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('site_settings')
      .update(patch)
      .eq('id', current.id)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
      item: {
        premium_3m_price: Number(data.premium_3m_price ?? defaultSettings.premium_3m_price),
        premium_6m_price: Number(data.premium_6m_price ?? defaultSettings.premium_6m_price),
        premium_12m_price: Number(data.premium_12m_price ?? defaultSettings.premium_12m_price),
        stars_rate: Number(data.stars_rate ?? defaultSettings.stars_rate),
        stars_min_amount: Number(data.stars_min_amount ?? defaultSettings.stars_min_amount),
        order_notify_email: String(data.order_notify_email ?? defaultSettings.order_notify_email),
        updated_at: data.updated_at,
      },
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
