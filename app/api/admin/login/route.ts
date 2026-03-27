import { NextResponse } from 'next/server'
import { createAdminSession, verifyAdminPassword } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function noStoreJson(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const password = String(body?.password || '')

    if (!password) {
      return noStoreJson({ error: 'Password is required' }, { status: 400 })
    }

    if (!verifyAdminPassword(password)) {
      return noStoreJson(
        {
          authenticated: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    createAdminSession()

    return noStoreJson({
      authenticated: true,
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
