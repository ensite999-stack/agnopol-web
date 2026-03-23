import { NextResponse } from 'next/server'
import {
  attachAdminSessionCookie,
  verifyAdminPassword,
} from '../../../../lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const password = String(body?.password || '')

    if (!password) {
      return NextResponse.json(
        { error: 'Missing password' },
        { status: 400 }
      )
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
    })

    attachAdminSessionCookie(response)
    return response
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Server error',
      },
      { status: 500 }
    )
  }
}
