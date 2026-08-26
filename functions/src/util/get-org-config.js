const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

const CACHE_TTL_MS = 5 * 60 * 1000
const DEFAULT_CACHE_KEY = 'default'

const cache = new Map()

const getCached = async (cacheKey, fetchValue) => {
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.value

  const value = await fetchValue()
  cache.set(cacheKey, { value, fetchedAt: Date.now() })
  return value
}

const getDefaultConfig = () =>
  getCached(DEFAULT_CACHE_KEY, async () => {
    const settingsDoc = await db.collection('erp-settings').doc('config').get()
    return settingsDoc.data() ?? {}
  })

const getCompanyConfigOverride = (companyId) =>
  getCached(companyId, async () => {
    const companyDoc = await db.collection('erp-companies').doc(companyId).get()
    return companyDoc.data()?.config ?? {}
  })

const getOrgConfig = async (companyId) => {
  const defaultConfig = await getDefaultConfig()
  if (!companyId) return defaultConfig

  const companyOverride = await getCompanyConfigOverride(companyId)
  return { ...defaultConfig, ...companyOverride }
}

module.exports = { getOrgConfig }
