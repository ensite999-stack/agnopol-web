import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('site_settings')
      .select(
        'premium_3m_price, premium_6m_price, premium_12m_price, stars_rate, trc20_address, base_address, updated_at'
      )
      .order('id', { ascending: true })
      .limit(1)
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
        error:
          error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
