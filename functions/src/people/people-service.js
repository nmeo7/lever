const { HttpsError } = require('firebase-functions/v2/https')
const { db, createDoc, updateDoc, getDoc, resolveGroupId } = require('../util/data')
const { hashPassword } = require('../util/auth')

const COLLECTION = 'erp-people'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLE_IDS = ['admin', 'manager', 'employee', 'viewer']

const stripPassword = ({ passwordHash, ...rest }) => rest

const listPeople = async (companyId) => {
  const snap = await db.collection(COLLECTION).where('companyIds', 'array-contains', companyId).get()
  return snap.docs.map((doc) => stripPassword({ id: doc.id, ...doc.data() }))
}

const createPerson = async (companyId, { name, email, password, roleId }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!email || !EMAIL_PATTERN.test(email)) throw new HttpsError('invalid-argument', 'email is required and must be valid')
  if (!password) throw new HttpsError('invalid-argument', 'password is required')
  if (!ROLE_IDS.includes(roleId)) throw new HttpsError('invalid-argument', `roleId must be one of ${ROLE_IDS.join(', ')}`)

  const existing = await db.collection(COLLECTION).where('email', '==', email).limit(1).get()
  if (!existing.empty) throw new HttpsError('failed-precondition', `Person "${email}" already exists`)

  const groupId = await resolveGroupId(companyId)

  const result = await createDoc(COLLECTION, {
    name,
    email,
    passwordHash: await hashPassword(password),
    isActive: true,
    roleId,
    companyIds: [companyId],
    groupId,
    isPlatformAdmin: false,
  })

  return { id: result.id }
}

const updatePerson = async (companyId, id, { name, roleId, isActive }) => {
  const existing = await getDoc(COLLECTION, id)
  if (!existing || !existing.companyIds?.includes(companyId)) throw new HttpsError('not-found', 'Person not found')

  if (roleId !== undefined && !ROLE_IDS.includes(roleId)) {
    throw new HttpsError('invalid-argument', `roleId must be one of ${ROLE_IDS.join(', ')}`)
  }

  return updateDoc(COLLECTION, id, {
    ...(name !== undefined ? { name } : {}),
    ...(roleId !== undefined ? { roleId } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  })
}

module.exports = { listPeople, createPerson, updatePerson, ROLE_IDS }
