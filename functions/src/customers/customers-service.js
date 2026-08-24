const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId, batchUpsert } = require('../util/data')

const COLLECTION = 'erp-customers'
const CUSTOMER_STATUSES = ['lead', 'active', 'inactive', 'blocked']

const listCustomers = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateCustomerFields = ({ name, status, tags }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (status !== undefined && !CUSTOMER_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of ${CUSTOMER_STATUSES.join(', ')}`)
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    throw new HttpsError('invalid-argument', 'tags must be an array of strings')
  }
}

const createCustomer = async (companyId, fields) => {
  validateCustomerFields(fields)
  const { name, company, email, phone, address, source, status, estimatedValue, summary, tags, assignedPersonId } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    name,
    company: company ?? '',
    email: email ?? '',
    phone: phone ?? '',
    address: address ?? '',
    source: source ?? '',
    status: status ?? 'lead',
    estimatedValue: estimatedValue ?? 0,
    summary: summary ?? '',
    tags: tags ?? [],
    assignedPersonId: assignedPersonId ?? '',
  })
}

const batchUpsertCustomers = (companyId, rows) => batchUpsert(companyId, rows, createCustomer)

module.exports = { listCustomers, createCustomer, batchUpsertCustomers, CUSTOMER_STATUSES }
