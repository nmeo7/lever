const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId } = require('../util/data')

const COLLECTION = 'erp-suppliers'

const listSuppliers = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateSupplierFields = ({ companyName }) => {
  if (!companyName) throw new HttpsError('invalid-argument', 'companyName is required')
}

const createSupplier = async (companyId, fields) => {
  validateSupplierFields(fields)
  const { companyName, contactName, email, phone, address, notes } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    companyName,
    contactName: contactName ?? '',
    email: email ?? '',
    phone: phone ?? '',
    address: address ?? '',
    notes: notes ?? '',
  })
}

const batchUpsertSuppliers = async (companyId, rows) => {
  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const errors = []
  let count = 0

  for (const [index, row] of rows.entries()) {
    try {
      await createSupplier(companyId, row)
      count += 1
    } catch (error) {
      errors.push({ row: index, message: error.message ?? 'Unknown error' })
    }
  }

  return { count, errors }
}

module.exports = { listSuppliers, createSupplier, batchUpsertSuppliers }
