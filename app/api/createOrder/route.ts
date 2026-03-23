import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      email,
      product_type,
      duration,
      stars_amount,
      price_usd,
      payment_network,
      payment_address,
      proof_image_base64,
    } = body

    // 基础校验
    if (!email || !price_usd || !payment_network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 写入数据库
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
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
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
