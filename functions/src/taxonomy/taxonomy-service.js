const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId, batchUpsert } = require('../util/data')

const COLLECTION = 'erp-taxonomy'
const TAXONOMY_KINDS = ['currency', 'paymentMethod', 'unit', 'tag']

const listTaxonomy = (companyId) => listDocs(COLLECTION, 'order', companyId)

const validateTaxonomyFields = ({ kind, label, value }) => {
  if (!TAXONOMY_KINDS.includes(kind)) throw new HttpsError('invalid-argument', `kind must be one of ${TAXONOMY_KINDS.join(', ')}`)
  if (!label) throw new HttpsError('invalid-argument', 'label is required')
  if (!value) throw new HttpsError('invalid-argument', 'value is required')
}

const createTaxonomyEntry = async (companyId, fields) => {
  validateTaxonomyFields(fields)
  const { kind, label, value, order, isActive, metadata } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    kind,
    label,
    value,
    order: order ?? 0,
    isActive: isActive ?? true,
    metadata: metadata ?? {},
  })
}

const batchUpsertTaxonomy = (companyId, rows) => batchUpsert(companyId, rows, createTaxonomyEntry)

module.exports = { listTaxonomy, createTaxonomyEntry, batchUpsertTaxonomy, TAXONOMY_KINDS }
