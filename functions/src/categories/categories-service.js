const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId } = require('../util/data')

const COLLECTION = 'erp-categories'
const CATEGORY_CLASSIFICATIONS = ['confidential', 'restricted', 'public']

const listCategories = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateCategoryFields = ({ name, classification }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (classification !== undefined && !CATEGORY_CLASSIFICATIONS.includes(classification)) {
    throw new HttpsError('invalid-argument', `classification must be one of ${CATEGORY_CLASSIFICATIONS.join(', ')}`)
  }
}

const createCategory = async (companyId, fields) => {
  validateCategoryFields(fields)
  const { name, parentId, description, classification } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    name,
    parentId: parentId ?? '',
    description: description ?? '',
    classification: classification ?? 'public',
  })
}

const batchUpsertCategories = async (companyId, rows) => {
  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const errors = []
  let count = 0

  for (const [index, row] of rows.entries()) {
    try {
      await createCategory(companyId, row)
      count += 1
    } catch (error) {
      errors.push({ row: index, message: error.message ?? 'Unknown error' })
    }
  }

  return { count, errors }
}

module.exports = { listCategories, createCategory, batchUpsertCategories, CATEGORY_CLASSIFICATIONS }
