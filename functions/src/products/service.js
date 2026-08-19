const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, searchDocs } = require('../util/data')

const COLLECTION = 'erp-products'
const PRODUCT_TYPES = ['physical', 'service', 'subscription', 'access']

const listProducts = (orgId) => listDocs(COLLECTION, 'createdAt', orgId)

const createProduct = async (orgId, { name, imageUrl, productType, description, sellingPrice, category, tags }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!PRODUCT_TYPES.includes(productType)) {
    throw new HttpsError('invalid-argument', `productType must be one of ${PRODUCT_TYPES.join(', ')}`)
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    throw new HttpsError('invalid-argument', 'tags must be an array of strings')
  }

  const now = new Date().toISOString()

  return createDoc(COLLECTION, {
    orgId,
    name,
    imageUrl: imageUrl ?? '',
    productType,
    description: description ?? '',
    sellingPrice: sellingPrice ?? 0,
    category: category ?? '',
    tags: tags ?? [],
    status: 'active',
    published: true,
    createdAt: now,
    updatedAt: now,
  })
}

const searchProducts = (orgId, { query, limit }) => searchDocs(COLLECTION, { query, limit, orgId })

module.exports = { listProducts, createProduct, searchProducts, PRODUCT_TYPES }
