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

const defaultMethods = [
  {
    id: 1,
    display_name: 'TON / Toncoin',
    chain_name: 'TON',
    token_name: 'Toncoin',
    address: 'UQC8kp8-ownfGWJdjf4XNteyMHPCkzGr5ZHX28wJjcPaX7dW',
    sort_order: 1,
    is_enabled: true,
  },
  {
    id: 2,
    display_name: 'TRC20 / USDT',
    chain_name: 'TRC20',
    token_name: 'USDT',
    address: 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e',
    sort_order: 2,
    is_enabled: true,
  },
  {
    id: 3,
    display_name: 'Base / USDC',
    chain_name: 'Base',
    token_name: 'USDC',
    address: '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E',
    sort_order: 3,
    is_enabled: true,
  },
]

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, display_name, chain_name, token_name, address, sort_order, is_enabled')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true })

    if (error) throw new Error(error.message)

    return noStoreJson({
      success: true,
      items: (data && data.length > 0 ? data : defaultMethods).filter((item) => item.is_enabled),
    })
  } catch (error) {
    return noStoreJson(
      {
        error: error instanceof Error ? error.message : 'Server error',
        items: defaultMethods,
      },
      { status: 500 }
    )
  }
}
