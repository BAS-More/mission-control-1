export interface GoogleIdTokenPayload {
  sub: string
  email: string
  email_verified: string | boolean
  name?: string
  picture?: string
  aud?: string
  iss?: string
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenPayload> {
  const token = String(idToken || '').trim()
  if (!token) {
    throw new Error('Missing Google credential')
  }

  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  let res: Response
  try {
    res = await fetch(url, { method: 'GET', signal: controller.signal })
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Google token verification timed out')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
  if (!res.ok) {
    throw new Error('Invalid Google token')
  }

  const payload = await res.json() as any
  const audExpected = String(process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()
  if (audExpected && payload.aud !== audExpected) {
    throw new Error('Google token audience mismatch')
  }

  if (!payload.email || !payload.sub) {
    throw new Error('Google token missing required identity fields')
  }

  if (!(payload.email_verified === true || payload.email_verified === 'true')) {
    throw new Error('Google email is not verified')
  }

  return payload as GoogleIdTokenPayload
}
