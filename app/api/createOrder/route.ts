import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { tenMinutesAgoIso } from '../../../lib/time'

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

function generateOrderNo() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const time = Date.now().toString(36).toUpperCase()
  return `AP${time}${random}`
}

function noStoreJson(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

function getDeviceId(req: Request, body: any) {
  const bodyDevice = String(body?.device_id || '').trim()
  if (bodyDevice) return bodyDevice

  const forwarded = req.headers.get('x-forwarded-for') || ''
  const ua = req.headers.get('user-agent') || ''
  return `${forwarded}__${ua}`.slice(0, 240)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidTelegramUsername(value: string) {
  return /^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value)
}

async function getSiteSettings(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('stars_min_amount')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const starsMinAmount = Number(data?.stars_min_amount ?? 50)

  return {
    stars_min_amount:
      Number.isFinite(starsMinAmount) && starsMinAmount >= 1 ? Math.floor(starsMinAmount) : 50,
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()

    const username = String(body?.username || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const productType = String(body?.product_type || '').trim()
    const duration = body?.duration ? String(body.duration).trim() : null
    const starsAmount =
      body?.stars_amount === null || body?.stars_amount === undefined || body?.stars_amount === ''
        ? null
        : Number(body.stars_amount)
    const priceUsd = Number(body?.price_usd || 0)
    const paymentNetwork = String(body?.payment_network || '').trim()
    const txHash = body?.tx_hash ? String(body.tx_hash).trim() : null
    const proofImageBase64 = body?.proof_image_base64 ? String(body.proof_image_base64) : null
    const deviceId = getDeviceId(req, body)

    if (!username) {
      return noStoreJson({ error: 'Telegram username is required' }, { status: 400 })
    }

    if (!isValidTelegramUsername(username)) {
      return noStoreJson(
        {
          error:
            'Invalid Telegram username. It must start with @, contain 5-32 characters, use only letters, numbers, and underscores, and begin with a letter.',
        },
        { status: 400 }
      )
    }

    if (!email) {
      return noStoreJson({ error: 'Email is required' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return noStoreJson({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!productType) {
      return noStoreJson({ error: 'Product type is required' }, { status: 400 })
    }

    if (productType !== 'tg_premium' && productType !== 'tg_stars') {
      return noStoreJson({ error: 'Unsupported product type' }, { status: 400 })
    }

    if (productType === 'tg_premium' && !['3m', '6m', '12m'].includes(String(duration || ''))) {
      return noStoreJson({ error: 'Invalid premium duration' }, { status: 400 })
    }

    const siteSettings = await getSiteSettings(supabase)

    if (productType === 'tg_stars') {
      if (
        !Number.isInteger(starsAmount) ||
        Number(starsAmount) < Number(siteSettings.stars_min_amount)
      ) {
        return noStoreJson(
          { error: `Invalid stars amount. Minimum is ${siteSettings.stars_min_amount}.` },
          { status: 400 }
        )
      }
    }

    if (!priceUsd || Number.isNaN(priceUsd) || priceUsd <= 0) {
      return noStoreJson({ error: 'Invalid price' }, { status: 400 })
    }

    if (!paymentNetwork) {
      return noStoreJson({ error: 'Payment network is required' }, { status: 400 })
    }

    if (!proofImageBase64 && !txHash) {
      return noStoreJson({ error: '请上传付款截图或填写交易哈希。' }, { status: 400 })
    }

    const { count, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('device_id', deviceId)
      .gte('created_at', tenMinutesAgoIso())

    if (countError) {
      throw new Error(countError.message)
    }

    if ((count || 0) >= 5) {
      return noStoreJson(
        { error: '同邮箱同设备 10 分钟内最多提交 5 单，请稍后再试。' },
        { status: 429 }
      )
    }

    const orderNo = generateOrderNo()

    const insertData: Record<string, any> = {
      order_no: orderNo,
      username,
      email,
      device_id: deviceId,
      product_type: productType,
      duration,
      stars_amount: starsAmount,
      amount: priceUsd,
      price_usd: priceUsd,
      payment_network: paymentNetwork || null,
      tx_hash: txHash,
      proof_image_base64: proofImageBase64,
      status: 'paid',
      public_note: '已收到您的付款凭证，订单正在处理中。预计五分钟内完成，请稍后查询订单详情。',
      admin_note: null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(insertData)
      .select('id, order_no, status')
      .single()

    if (error) {
      return noStoreJson({ error: error.message }, { status: 500 })
    }

    return noStoreJson({
      success: true,
      id: data.id,
      order_no: data.order_no,
      status: data.status,
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
