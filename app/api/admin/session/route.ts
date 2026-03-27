import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function noStoreJson(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function GET() {
  try {
    return noStoreJson({
      authenticated: isAdminAuthenticated(),
    })
  } catch (error) {
    return noStoreJson(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
