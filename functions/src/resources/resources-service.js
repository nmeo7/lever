const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId } = require('../util/data')

const COLLECTION = 'erp-resources'
const RESOURCE_CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'damaged']
const RESOURCE_STATUSES = ['available', 'assigned', 'maintenance', 'retired']
const RESOURCE_OWNERSHIPS = ['owned', 'rented', 'leased', 'borrowed']

const listResources = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateResourceFields = ({ name, categoryIds, condition, status, ownership }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (categoryIds !== undefined && !Array.isArray(categoryIds)) {
    throw new HttpsError('invalid-argument', 'categoryIds must be an array')
  }
  if (condition !== undefined && !RESOURCE_CONDITIONS.includes(condition)) {
    throw new HttpsError('invalid-argument', `condition must be one of ${RESOURCE_CONDITIONS.join(', ')}`)
  }
  if (status !== undefined && !RESOURCE_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of ${RESOURCE_STATUSES.join(', ')}`)
  }
  if (ownership !== undefined && !RESOURCE_OWNERSHIPS.includes(ownership)) {
    throw new HttpsError('invalid-argument', `ownership must be one of ${RESOURCE_OWNERSHIPS.join(', ')}`)
  }
}

const createResource = async (companyId, fields) => {
  validateResourceFields(fields)
  const {
    name, categoryIds, serialNumber, purchaseDate, expirationDate,
    purchaseCost, currentValue, locationId, assignedPersonId, condition, status, ownership,
  } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    name,
    categoryIds: categoryIds ?? [],
    serialNumber: serialNumber ?? '',
    purchaseDate: purchaseDate ?? '',
    expirationDate: expirationDate ?? '',
    purchaseCost: purchaseCost ?? 0,
    currentValue: currentValue ?? 0,
    locationId: locationId ?? '',
    assignedPersonId: assignedPersonId ?? '',
    condition: condition ?? 'good',
    status: status ?? 'available',
    ownership: ownership ?? 'owned',
  })
}

const batchUpsertResources = async (companyId, rows) => {
  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const errors = []
  let count = 0

  for (const [index, row] of rows.entries()) {
    try {
      await createResource(companyId, row)
      count += 1
    } catch (error) {
      errors.push({ row: index, message: error.message ?? 'Unknown error' })
    }
  }

  return { count, errors }
}

module.exports = {
  listResources,
  createResource,
  batchUpsertResources,
  RESOURCE_CONDITIONS,
  RESOURCE_STATUSES,
  RESOURCE_OWNERSHIPS,
}
