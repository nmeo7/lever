const { HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { hashPassword } = require('../util/auth')

const COLLECTION = 'erp-organization'
const USERS_COLLECTION = 'erp-users'
const SLUG_PATTERN = /^[a-z0-9-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const requireAdmin = (user) => {
  if (user.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only')
}

const listTenants = async (user) => {
  requireAdmin(user)
  const snap = await db.collection(COLLECTION).orderBy('name').get()
  return snap.docs.map((doc) => ({ slug: doc.id, ...doc.data() }))
}

const createTenant = async (user, { slug, name, contact, adminEmail, adminPassword }) => {
  requireAdmin(user)

  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new HttpsError('invalid-argument', 'slug is required and must be lowercase letters, numbers, and hyphens')
  }
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!adminEmail || !EMAIL_PATTERN.test(adminEmail)) {
    throw new HttpsError('invalid-argument', 'adminEmail is required and must be a valid email')
  }
  if (!adminPassword) throw new HttpsError('invalid-argument', 'adminPassword is required')

  const tenantRef = db.collection(COLLECTION).doc(slug)
  const existing = await tenantRef.get()
  if (existing.exists) throw new HttpsError('failed-precondition', `Tenant "${slug}" already exists`)

  const existingUser = await db.collection(USERS_COLLECTION).where('email', '==', adminEmail).limit(1).get()
  if (!existingUser.empty) throw new HttpsError('failed-precondition', `User "${adminEmail}" already exists`)

  const tenant = { slug, name, contact: contact ?? {} }
  await tenantRef.set(tenant)

  await db.collection(USERS_COLLECTION).add({
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    isActive: true,
    role: 'admin',
    personId: null,
    orgId: slug,
  })

  return tenant
}

module.exports = { listTenants, createTenant }
