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

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const email = String(body?.email || '').trim().toLowerCase()
    const orderNo = String(body?.order_no || '').trim()
    const txHash = body?.tx_hash ? String(body.tx_hash).trim() : null
    const proofImageBase64 = body?.proof_image_base64
      ? String(body.proof_image_base64)
      : null

    if (!email || !orderNo) {
      return noStoreJson(
        { error: 'Email and order number are required.' },
        { status: 400 }
      )
    }

    if (!txHash && !proofImageBase64) {
      return noStoreJson(
        { error: 'Please upload payment proof or provide a transaction hash.' },
        { status: 400 }
      )
    }

    const { data: existing, error: findError } = await supabase
      .from('orders')
      .select('id, order_no')
      .eq('email', email)
      .eq('order_no', orderNo)
      .maybeSingle()

    if (findError) {
      throw new Error(findError.message)
    }

    if (!existing) {
      return noStoreJson({ error: 'Order not found.' }, { status: 404 })
    }

    const patch: Record<string, any> = {
      updated_at: new Date().toISOString(),
      status: 'paid',
      public_note:
        'Your updated payment proof has been received. The order is back in processing. Please check again in a few minutes.',
    }

    if (txHash) patch.tx_hash = txHash
    if (proofImageBase64) patch.proof_image_base64 = proofImageBase64

    const { data, error } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', existing.id)
      .select('order_no, status, public_note, tx_hash')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return noStoreJson({
      success: true,
      item: data,
    })
  } catch (error) {
    return noStoreJson(
      {
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
