const { HttpsError } = require('firebase-functions/v2/https')
const { db, createDoc, getDoc } = require('../util/data')
const { hashPassword } = require('../util/auth')

const GROUPS_COLLECTION = 'erp-groups'
const COMPANIES_COLLECTION = 'erp-companies'
const PEOPLE_COLLECTION = 'erp-people'
const SLUG_PATTERN = /^[a-z0-9-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isPlatformAdmin = (user) => user.isPlatformAdmin && user.roleId === 'admin'

const requirePlatformAdmin = (user) => {
  if (!isPlatformAdmin(user)) throw new HttpsError('permission-denied', 'Platform admin only')
}

const requireGroupAccess = (user, groupId) => {
  if (isPlatformAdmin(user)) return
  if (user.groupId === groupId && user.roleId === 'admin') return
  throw new HttpsError('permission-denied', 'No access to this group')
}

const listGroups = async (user) => {
  if (isPlatformAdmin(user)) {
    const snap = await db.collection(GROUPS_COLLECTION).orderBy('name').get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }

  if (!user.groupId || user.roleId !== 'admin') return []

  const group = await getDoc(GROUPS_COLLECTION, user.groupId)
  return group ? [group] : []
}

const createGroup = async (user, { id, name, description }) => {
  requirePlatformAdmin(user)

  if (!id || !SLUG_PATTERN.test(id)) {
    throw new HttpsError('invalid-argument', 'id is required and must be lowercase letters, numbers, and hyphens')
  }
  if (!name) throw new HttpsError('invalid-argument', 'name is required')

  const existing = await db.collection(GROUPS_COLLECTION).doc(id).get()
  if (existing.exists) throw new HttpsError('failed-precondition', `Group "${id}" already exists`)

  const group = { name, description: description ?? '' }
  await createDoc(GROUPS_COLLECTION, group, id)
  return { id, ...group }
}

const listCompaniesForGroup = async (user, groupId) => {
  requireGroupAccess(user, groupId)
  const snap = await db.collection(COMPANIES_COLLECTION).where('groupId', '==', groupId).get()
  return snap.docs.map((doc) => ({ slug: doc.id, ...doc.data() }))
}

const createCompany = async (user, { slug, name, contact, groupId, adminEmail, adminPassword }) => {
  if (groupId) {
    requireGroupAccess(user, groupId)
  } else {
    requirePlatformAdmin(user)
  }

  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new HttpsError('invalid-argument', 'slug is required and must be lowercase letters, numbers, and hyphens')
  }
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!adminEmail || !EMAIL_PATTERN.test(adminEmail)) {
    throw new HttpsError('invalid-argument', 'adminEmail is required and must be a valid email')
  }
  if (!adminPassword) throw new HttpsError('invalid-argument', 'adminPassword is required')

  const existing = await db.collection(COMPANIES_COLLECTION).doc(slug).get()
  if (existing.exists) throw new HttpsError('failed-precondition', `Company "${slug}" already exists`)

  const existingPerson = await db.collection(PEOPLE_COLLECTION).where('email', '==', adminEmail).limit(1).get()
  if (!existingPerson.empty) throw new HttpsError('failed-precondition', `Person "${adminEmail}" already exists`)

  const company = { slug, name, contact: contact ?? {}, groupId: groupId ?? null }
  await createDoc(COMPANIES_COLLECTION, company, slug)

  await createDoc(PEOPLE_COLLECTION, {
    name,
    email: adminEmail,
    passwordHash: hashPassword(adminPassword),
    isActive: true,
    roleId: 'admin',
    companyIds: [slug],
    groupId: null,
    isPlatformAdmin: false,
  })

  return company
}

module.exports = { listGroups, createGroup, listCompaniesForGroup, createCompany }
