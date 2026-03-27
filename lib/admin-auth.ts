import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'crypto'

const ADMIN_SESSION_COOKIE = 'agnopol_admin_session'

function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD
  if (!value) {
    throw new Error('Missing ADMIN_PASSWORD')
  }
  return value
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'agnopol-admin-session-secret'
}

function buildSessionToken(password: string) {
  return createHash('sha256')
    .update(`${password}::${getAdminSessionSecret()}`)
    .digest('hex')
}

function safeEqualString(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)

  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export function isAdminAuthenticated() {
  const store = cookies()
  const cookieValue = store.get(ADMIN_SESSION_COOKIE)?.value || ''

  if (!cookieValue) return false

  const expected = buildSessionToken(getAdminPassword())
  return safeEqualString(cookieValue, expected)
}

export function createAdminSession() {
  const store = cookies()
  const token = buildSessionToken(getAdminPassword())

  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAdminSession() {
  const store = cookies()
  store.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword()
  return safeEqualString(password, expected)
}

export function requireAdminSession() {
  if (!isAdminAuthenticated()) {
    throw new Error('Unauthorized')
  }
}
