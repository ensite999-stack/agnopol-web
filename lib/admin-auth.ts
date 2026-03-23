import crypto from 'crypto'
import { NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE_NAME = 'agnopol_admin_session'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24

type AdminSessionPayload = {
  role: 'admin'
  exp: number
}

function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim()
  if (!value) {
    throw new Error('Missing ADMIN_PASSWORD environment variable')
  }
  return value
}

function getAdminSessionSecret() {
  const value = process.env.ADMIN_SESSION_SECRET?.trim()
  if (!value) {
    throw new Error('Missing ADMIN_SESSION_SECRET environment variable')
  }
  if (value.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters long')
  }
  return value
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)

  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function sign(data: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url')
}

function encodePayload(payload: AdminSessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(value: string): AdminSessionPayload | null {
  try {
    const raw = Buffer.from(value, 'base64url').toString('utf8')
    return JSON.parse(raw) as AdminSessionPayload
  } catch {
    return null
  }
}

export function verifyAdminPassword(password: string) {
  return safeEqual(password, getAdminPassword())
}

export function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  }

  const encoded = encodePayload(payload)
  const signature = sign(encoded, getAdminSessionSecret())
  return `${encoded}.${signature}`
}

export function verifyAdminSessionToken(token: string) {
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded, getAdminSessionSecret())
  if (!safeEqual(signature, expected)) return null

  const payload = decodePayload(encoded)
  if (!payload) return null
  if (payload.role !== 'admin') return null
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null

  return payload
}

function readCookie(cookieHeader: string, name: string) {
  const parts = cookieHeader.split(';')

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const index = trimmed.indexOf('=')
    if (index === -1) continue

    const key = trimmed.slice(0, index)
    const value = trimmed.slice(index + 1)

    if (key === name) return value
  }

  return null
}

export function readAdminSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const token = readCookie(cookieHeader, ADMIN_SESSION_COOKIE_NAME)
  if (!token) return null
  return verifyAdminSessionToken(token)
}

export function requireAdminSession(req: Request) {
  const session = readAdminSessionFromRequest(req)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export function attachAdminSessionCookie(response: NextResponse) {
  const token = createAdminSessionToken()

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
