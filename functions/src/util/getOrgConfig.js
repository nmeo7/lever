const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map()

const getOrgConfig = async (accountId = 'default') => {
  const cached = cache.get(accountId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.config

  const accountDoc = await db.collection('erp-accounts').doc(accountId).get()
  const config = accountDoc.data()?.config ?? {}
  cache.set(accountId, { config, fetchedAt: Date.now() })
  return config
}

module.exports = { getOrgConfig }
