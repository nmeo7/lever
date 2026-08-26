const { HttpsError } = require('firebase-functions/v2/https')
const { db, createDoc, getDoc } = require('../util/data')
const { hashPassword } = require('../util/auth')
const { ROLE_IDS } = require('../people/people-service')

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
    passwordHash: await hashPassword(adminPassword),
    isActive: true,
    roleId: 'admin',
    companyIds: [slug],
    groupId: null,
    isPlatformAdmin: false,
  })

  return company
}

const createCompanyPerson = async (user, { groupId, companySlug, name, email, password, roleId }) => {
  if (groupId) {
    requireGroupAccess(user, groupId)
  } else {
    requirePlatformAdmin(user)
  }

  if (!companySlug) throw new HttpsError('invalid-argument', 'companySlug is required')
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!email || !EMAIL_PATTERN.test(email)) throw new HttpsError('invalid-argument', 'email is required and must be valid')
  if (!password) throw new HttpsError('invalid-argument', 'password is required')
  if (!ROLE_IDS.includes(roleId)) throw new HttpsError('invalid-argument', `roleId must be one of ${ROLE_IDS.join(', ')}`)

  const company = await getDoc(COMPANIES_COLLECTION, companySlug)
  if (!company) throw new HttpsError('not-found', `Company "${companySlug}" not found`)

  const existing = await db.collection(PEOPLE_COLLECTION).where('email', '==', email).limit(1).get()
  if (!existing.empty) throw new HttpsError('failed-precondition', `Person "${email}" already exists`)

  const result = await createDoc(PEOPLE_COLLECTION, {
    name,
    email,
    passwordHash: await hashPassword(password),
    isActive: true,
    roleId,
    companyIds: [companySlug],
    groupId: company.groupId ?? null,
    isPlatformAdmin: false,
  })

  return { id: result.id }
}

const BATCH_ENTITIES = ['groups', 'companies', 'people']

const upsertGroupRow = async (user, { id, name, description }) => {
  if (!id || !SLUG_PATTERN.test(id)) throw new HttpsError('invalid-argument', 'id is required and must be lowercase letters, numbers, and hyphens')
  if (!name) throw new HttpsError('invalid-argument', 'name is required')

  requirePlatformAdmin(user)

  const group = { name, description: description ?? '' }
  await db.collection(GROUPS_COLLECTION).doc(id).set(group, { merge: true })
  return { id, ...group }
}

const upsertCompanyRow = async (user, { slug, name, contact, groupId }) => {
  if (!slug || !SLUG_PATTERN.test(slug)) throw new HttpsError('invalid-argument', 'slug is required and must be lowercase letters, numbers, and hyphens')
  if (!name) throw new HttpsError('invalid-argument', 'name is required')

  if (groupId) {
    requireGroupAccess(user, groupId)
  } else {
    requirePlatformAdmin(user)
  }

  const company = { slug, name, contact: contact ?? {}, groupId: groupId ?? null }
  await db.collection(COMPANIES_COLLECTION).doc(slug).set(company, { merge: true })
  return company
}

const requireCompanyOrGroupAccess = (user, companyId) => {
  if (isPlatformAdmin(user)) return
  if (user.companyIds?.includes(companyId)) return
  throw new HttpsError('permission-denied', `No access to company "${companyId}"`)
}

const resolveGroupIdForCompanies = async (companyIds) => {
  const [firstCompanyId] = companyIds
  const company = await getDoc(COMPANIES_COLLECTION, firstCompanyId)
  return company?.groupId ?? null
}

const upsertPersonRow = async (user, { id, name, email, password, roleId, companyIds }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!email || !EMAIL_PATTERN.test(email)) throw new HttpsError('invalid-argument', 'email is required and must be valid')
  if (!ROLE_IDS.includes(roleId)) throw new HttpsError('invalid-argument', `roleId must be one of ${ROLE_IDS.join(', ')}`)
  if (!Array.isArray(companyIds) || !companyIds.length) throw new HttpsError('invalid-argument', 'companyIds must be a non-empty array')

  companyIds.forEach((companyId) => requireCompanyOrGroupAccess(user, companyId))

  const existingSnap = id
    ? await db.collection(PEOPLE_COLLECTION).doc(id).get()
    : await db.collection(PEOPLE_COLLECTION).where('email', '==', email).limit(1).get()

  const existing = id ? (existingSnap.exists ? existingSnap.data() : null) : existingSnap.docs[0]?.data()
  const existingId = id ?? existingSnap.docs?.[0]?.id

  if (!existing && !password) throw new HttpsError('invalid-argument', 'password is required for new people')

  const groupId = await resolveGroupIdForCompanies(companyIds)

  const person = {
    name,
    email,
    isActive: true,
    roleId,
    companyIds,
    groupId,
    isPlatformAdmin: existing?.isPlatformAdmin ?? false,
    ...(password ? { passwordHash: await hashPassword(password) } : {}),
  }

  const docRef = existingId ? db.collection(PEOPLE_COLLECTION).doc(existingId) : db.collection(PEOPLE_COLLECTION).doc()
  await docRef.set(person, { merge: true })
  return { id: docRef.id, ...person }
}

const UPSERT_ROW_HANDLERS = {
  groups: upsertGroupRow,
  companies: upsertCompanyRow,
  people: upsertPersonRow,
}

const batchUpsert = async (user, { entity, rows }) => {
  if (!BATCH_ENTITIES.includes(entity)) throw new HttpsError('invalid-argument', `entity must be one of ${BATCH_ENTITIES.join(', ')}`)
  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const handler = UPSERT_ROW_HANDLERS[entity]
  const results = []
  const errors = []

  for (const [index, row] of rows.entries()) {
    try {
      results.push(await handler(user, row))
    } catch (error) {
      errors.push({ row: index, message: error.message ?? 'Unknown error' })
    }
  }

  return { count: results.length, errors }
}

module.exports = {
  listGroups,
  createGroup,
  listCompaniesForGroup,
  createCompany,
  createCompanyPerson,
  batchUpsert,
  BATCH_ENTITIES,
}
