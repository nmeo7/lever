const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId, batchUpsert } = require('../util/data')

const COLLECTION = 'erp-locations'
const LOCATION_TYPES = ['warehouse', 'office', 'store', 'customerSite', 'supplierSite', 'other']
const LOCATION_STATUSES = ['active', 'inactive']

const listLocations = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateLocationFields = ({ name, type, status }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (type !== undefined && !LOCATION_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', `type must be one of ${LOCATION_TYPES.join(', ')}`)
  }
  if (status !== undefined && !LOCATION_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of ${LOCATION_STATUSES.join(', ')}`)
  }
}

const createLocation = async (companyId, fields) => {
  validateLocationFields(fields)
  const { name, type, address, description, status } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    name,
    type: type ?? 'warehouse',
    address: address ?? '',
    description: description ?? '',
    status: status ?? 'active',
  })
}

const batchUpsertLocations = (companyId, rows) => batchUpsert(companyId, rows, createLocation)

module.exports = { listLocations, createLocation, batchUpsertLocations, LOCATION_TYPES, LOCATION_STATUSES }
