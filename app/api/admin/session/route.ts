import { NextResponse } from 'next/server'
import { readAdminSessionFromCookies } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = readAdminSessionFromCookies()

    if (!session) {
      return NextResponse.json({
        authenticated: false,
      })
    }

    return NextResponse.json({
      authenticated: true,
      exp: session.exp,
    })
  } catch {
    return NextResponse.json({
      authenticated: false,
    })
  }
}
