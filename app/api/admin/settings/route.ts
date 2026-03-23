import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminSession } from '../../../../lib/admin-auth'

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
    requireAdminSession()

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
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
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    requireAdminSession()

    const supabase = getSupabase()
    const body = await req.json()

    const patch = {
      premium_3m_price: Number(body?.premium_3m_price || 0),
      premium_6m_price: Number(body?.premium_6m_price || 0),
      premium_12m_price: Number(body?.premium_12m_price || 0),
      stars_rate: Number(body?.stars_rate || 0),
      trc20_address: String(body?.trc20_address || '').trim(),
      base_address: String(body?.base_address || '').trim(),
      updated_at: new Date().toISOString(),
    }

    const { data: firstRow, error: findError } = await supabase
      .from('site_settings')
      .select('id')
      .order('id', { ascending: true })
      .limit(1)
      .single()

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('site_settings')
      .update(patch)
      .eq('id', firstRow.id)
      .select('*')
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
