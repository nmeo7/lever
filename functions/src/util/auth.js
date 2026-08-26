const { SignJWT, jwtVerify } = require('jose')
const { HttpsError } = require('firebase-functions/v2/https')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const EXPIRY = '8h'
const BCRYPT_ROUNDS = 12

const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS)

const isLegacySha256Hash = (hash) => /^[0-9a-f]{64}$/.test(hash)

const legacySha256Hash = (password) =>
  crypto.createHash('sha256').update(password).digest('hex')

const verifyPassword = async (password, storedHash) => {
  if (isLegacySha256Hash(storedHash)) {
    return legacySha256Hash(password) === storedHash
  }
  return bcrypt.compare(password, storedHash)
}

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

const requireCompanyAccess = (user, companyId) => {
  if (!companyId) throw new HttpsError('invalid-argument', 'companyId is required')
  if (user.companyIds?.includes(companyId)) return companyId
  throw new HttpsError('permission-denied', 'No access to this company')
}

module.exports = {
  hashPassword,
  verifyPassword,
  isLegacySha256Hash,
  signToken,
  verifyToken,
  requireAuth,
  requireAuthFromRequest,
  requireCompanyAccess,
}
