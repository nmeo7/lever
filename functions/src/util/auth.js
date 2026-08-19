const { SignJWT, jwtVerify } = require('jose')
const { HttpsError } = require('firebase-functions/v2/https')
const crypto = require('crypto')

const EXPIRY = '8h'

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex')

const secret = () => {
  const key = process.env.JWT_SECRET
  if (!key) throw new Error('JWT_SECRET env var is required')
  return new TextEncoder().encode(key)
}

const signToken = async (payload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(await secret())

const verifyToken = async (token) => {
  const { payload } = await jwtVerify(token, await secret())
  return payload
}

const requireAuth = async (rawToken) => {
  if (!rawToken) throw new HttpsError('unauthenticated', 'Missing token')
  try {
    return await verifyToken(rawToken)
  } catch {
    throw new HttpsError('unauthenticated', 'Invalid or expired token')
  }
}

const requireAuthFromRequest = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  return requireAuth(token)
}

module.exports = { hashPassword, signToken, verifyToken, requireAuth, requireAuthFromRequest }
