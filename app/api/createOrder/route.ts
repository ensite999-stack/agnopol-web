import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const {
      username,
      email,
      product_type,
      duration,
      stars_amount,
      price_usd,
      payment_network,
      payment_address,
      proof_image_base64,
    } = body

    if (!email || !price_usd || !payment_network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          username,
          email,
          product_type,
          duration,
          stars_amount,
          price_usd,
          payment_network,
          payment_address,
          proof_image_base64,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order_id: data.id,
    })
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
