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

const defaultSettings = {
  premium_3m_price: 13.1,
  premium_6m_price: 17.1,
  premium_12m_price: 31.1,
  stars_rate: 0.02,
  stars_min_amount: 50,
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('site_settings')
      .select(
        'premium_3m_price, premium_6m_price, premium_12m_price, stars_rate, stars_min_amount, updated_at'
      )
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
      item: {
        premium_3m_price: Number(data?.premium_3m_price ?? defaultSettings.premium_3m_price),
        premium_6m_price: Number(data?.premium_6m_price ?? defaultSettings.premium_6m_price),
        premium_12m_price: Number(data?.premium_12m_price ?? defaultSettings.premium_12m_price),
        stars_rate: Number(data?.stars_rate ?? defaultSettings.stars_rate),
        stars_min_amount: Number(data?.stars_min_amount ?? defaultSettings.stars_min_amount),
        updated_at: data?.updated_at,
      },
    })
  } catch (error) {
    return noStoreJson(
      {
        error: error instanceof Error ? error.message : 'Server error',
        item: defaultSettings,
      },
      { status: 500 }
    )
  }
}
