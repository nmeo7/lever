const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { signToken, hashPassword } = require('../util/auth')

exports.authLogin = onCall({ cors: true, secrets: ['JWT_SECRET'] }, async ({ data }) => {
  const { email, password } = data ?? {}
  if (!email || !password) throw new HttpsError('invalid-argument', 'Email and password required')

  const snap = await db.collection('erp-users').where('email', '==', email).limit(1).get()
  if (snap.empty) throw new HttpsError('not-found', 'Invalid credentials')

  const userDoc = snap.docs[0]
  const user = userDoc.data()

  if (!user.isActive) throw new HttpsError('permission-denied', 'Account disabled')
  if (user.passwordHash !== hashPassword(password)) {
    throw new HttpsError('unauthenticated', 'Invalid credentials')
  }

  const payload = { uid: userDoc.id, email: user.email, role: user.role, personId: user.personId, orgId: user.orgId ?? null }
  const token = await signToken(payload)

  return { token, user: payload }
})
