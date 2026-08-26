const { HttpsError } = require('firebase-functions/v2/https')
const { getDoc, updateDoc } = require('../util/data')

const COMPANIES_COLLECTION = 'erp-companies'

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

module.exports = { getCompanyContact, updateCompanyContact }
