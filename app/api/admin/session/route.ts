import { NextResponse } from 'next/server'
import { readAdminSessionFromRequest } from '../../../../lib/admin-auth'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const session = readAdminSessionFromRequest(req)

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
