import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSupabaseServerClient } from '../../../lib/supabase-server'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidTelegramUsername(value: string) {
  return /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value.trim())
}

function getClientIp(request: Request) {
  const forwarded =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    ''

  return forwarded.split(',')[0]?.trim() || 'unknown'
}

function getDeviceFingerprint(request: Request) {
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  const ip = getClientIp(request)

  return `${ip}::${userAgent}::${acceptLanguage}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const username = String(body?.username || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const productType = String(body?.product_type || '').trim()
    const duration = body?.duration ? String(body.duration).trim() : null
    const starsAmount =
      body?.stars_amount === null || body?.stars_amount === undefined
        ? null
        : Number(body.stars_amount)
    const priceUsd = Number(body?.price_usd || 0)
    const paymentNetwork = String(body?.payment_network || '').trim().toUpperCase()
    const txHash = body?.tx_hash ? String(body.tx_hash).trim() : null
    const proofImageBase64 = body?.proof_image_base64 ? String(body.proof_image_base64) : null

    if (!username) {
      return NextResponse.json({ error: 'TG username is required.' }, { status: 400 })
    }

    if (!isValidTelegramUsername(username)) {
      return NextResponse.json(
        {
          error:
            'Invalid TG username. It must start with @, contain 5-32 characters, use only letters, numbers and underscores, and begin with a letter.',
        },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    if (!productType || !(priceUsd > 0)) {
      return NextResponse.json({ error: 'Invalid order payload.' }, { status: 400 })
    }

    if (productType === 'tg_premium' && !['3m', '6m', '12m'].includes(duration || '')) {
      return NextResponse.json({ error: 'Invalid premium duration.' }, { status: 400 })
    }

    if (productType === 'tg_stars' && (!(starsAmount && starsAmount >= 50) || !Number.isFinite(starsAmount))) {
      return NextResponse.json({ error: 'Invalid stars amount.' }, { status: 400 })
    }

    if (!['TRC20', 'BASE'].includes(paymentNetwork)) {
      return NextResponse.json({ error: 'Invalid payment network.' }, { status: 400 })
    }

    if (!txHash && !proofImageBase64) {
      return NextResponse.json(
        { error: 'Please provide transaction hash or payment proof.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServerClient()
    const deviceFingerprint = getDeviceFingerprint(request)
    const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { count: recentCount, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('device_fingerprint', deviceFingerprint)
      .gte('created_at', windowStart)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    if ((recentCount || 0) >= 5) {
      return NextResponse.json(
        { error: 'Too many recent orders from this email and device. Please try again later.' },
        { status: 429 }
      )
    }

    const orderNo = `AG-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`

    const insertPayload = {
      order_no: orderNo,
      username,
      email,
      product_type: productType,
      duration,
      stars_amount: productType === 'tg_stars' ? starsAmount : null,
      price_usd: priceUsd,
      amount: priceUsd,
      payment_network: paymentNetwork,
      tx_hash: txHash,
      proof_image_base64: proofImageBase64,
      status: 'pending',
      device_fingerprint: deviceFingerprint,
      public_note: null,
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertPayload)
      .select('order_no')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order_no: data.order_no,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
