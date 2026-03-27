import { NextResponse } from 'next/server'
import { clearAdminSession } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function noStoreJson(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function POST() {
  try {
    clearAdminSession()

    return noStoreJson({
      success: true,
    })
  } catch (error) {
    return noStoreJson(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
