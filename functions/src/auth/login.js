const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { signToken, hashPassword, verifyPassword, isLegacySha256Hash } = require('../util/auth')

exports.authLogin = onCall({ cors: true, secrets: ['JWT_SECRET'] }, async ({ data }) => {
  const { email, password } = data ?? {}
  if (!email || !password) throw new HttpsError('invalid-argument', 'Email and password required')

  const snap = await db.collection('erp-people').where('email', '==', email).limit(1).get()
  if (snap.empty) throw new HttpsError('not-found', 'Invalid credentials')

  const personDoc = snap.docs[0]
  const person = personDoc.data()

  if (!person.passwordHash) throw new HttpsError('not-found', 'Invalid credentials')
  if (!person.isActive) throw new HttpsError('permission-denied', 'Account disabled')
  if (!(await verifyPassword(password, person.passwordHash))) {
    throw new HttpsError('unauthenticated', 'Invalid credentials')
  }
  if (isLegacySha256Hash(person.passwordHash)) {
    await personDoc.ref.update({ passwordHash: await hashPassword(password) })
  }

  const payload = {
    uid: personDoc.id,
    email: person.email,
    roleId: person.roleId,
    companyIds: person.companyIds ?? [],
    groupId: person.groupId ?? null,
    isPlatformAdmin: person.isPlatformAdmin ?? false,
  }
  const token = await signToken(payload)

  return { token, user: payload }
})
