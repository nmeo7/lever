const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

const key = () => {
  const raw = process.env.FIELD_ENCRYPTION_KEY
  if (!raw) throw new Error('FIELD_ENCRYPTION_KEY env var is required')
  const buffer = Buffer.from(raw, 'hex')
  if (buffer.length !== 32) throw new Error('FIELD_ENCRYPTION_KEY must be a 32-byte hex string')
  return buffer
}

const encryptField = (plaintext) => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv)
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `enc:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

const isEncrypted = (value) => typeof value === 'string' && value.startsWith('enc:')

const decryptField = (value) => {
  if (!isEncrypted(value)) return value

  const [, ivB64, authTagB64, dataB64] = value.split(':')
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])

  return decrypted.toString('utf8')
}

const encryptFields = (obj, fields) =>
  fields.reduce((acc, field) => (acc[field] !== undefined ? { ...acc, [field]: encryptField(acc[field]) } : acc), { ...obj })

const decryptFields = (obj, fields) =>
  fields.reduce((acc, field) => (acc[field] !== undefined ? { ...acc, [field]: decryptField(acc[field]) } : acc), { ...obj })

module.exports = { encryptField, decryptField, encryptFields, decryptFields, isEncrypted }
