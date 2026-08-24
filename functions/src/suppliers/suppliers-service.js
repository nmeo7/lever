const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId, batchUpsert } = require('../util/data')

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

const batchUpsertSuppliers = (companyId, rows) => batchUpsert(companyId, rows, createSupplier)

module.exports = { listSuppliers, createSupplier, batchUpsertSuppliers }
