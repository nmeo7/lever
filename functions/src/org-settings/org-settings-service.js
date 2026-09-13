const { HttpsError } = require('firebase-functions/v2/https')
const { getDoc, updateDoc } = require('../util/data')

const COMPANIES_COLLECTION = 'erp-companies'
const SETTINGS_COLLECTION = 'erp-settings'
const CACHE_TTL_MS = 5 * 60 * 1000

const schemaCache = new Map()

const getCached = async (cacheKey, fetchValue) => {
  const cached = schemaCache.get(cacheKey)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.value

  const value = await fetchValue()
  schemaCache.set(cacheKey, { value, fetchedAt: Date.now() })
  return value
}

const getBaseSchema = () =>
  getCached('schema', async () => (await getDoc(SETTINGS_COLLECTION, 'schema')) ?? {})

const getSchemaOverride = (companyId) =>
  getCached(`override:${companyId}`, async () => {
    const company = await getDoc(COMPANIES_COLLECTION, companyId)
    return company?.schemaOverrides ?? {}
  })

const getSchema = async (companyId, collection) => {
  const baseSchema = await getBaseSchema()
  const override = companyId ? await getSchemaOverride(companyId) : {}

  const fields = { ...baseSchema, ...override }

  if (!collection) return fields

  if (!fields[collection]) throw new HttpsError('not-found', `No schema found for collection "${collection}"`)

  return fields[collection]
}

const getCompanyContact = async (companyId) => {
  const company = await getDoc(COMPANIES_COLLECTION, companyId)
  if (!company) throw new HttpsError('not-found', `Company "${companyId}" not found`)
  return { slug: company.slug ?? companyId, name: company.name, contact: company.contact ?? {} }
}

const updateCompanyContact = async (companyId, { whatsapp, momo }) => {
  const company = await getDoc(COMPANIES_COLLECTION, companyId)
  if (!company) throw new HttpsError('not-found', `Company "${companyId}" not found`)

  const contact = {
    ...company.contact,
    ...(whatsapp !== undefined ? { whatsapp } : {}),
    ...(momo !== undefined ? { momo } : {}),
  }

  await updateDoc(COMPANIES_COLLECTION, companyId, { contact })
  return { slug: companyId, name: company.name, contact }
}

module.exports = { getCompanyContact, updateCompanyContact, getSchema }
