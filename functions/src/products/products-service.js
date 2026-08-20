const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, searchDocs, resolveGroupId } = require('../util/data')

const COLLECTION = 'erp-products'
const PRODUCT_TYPES = ['physical', 'service', 'subscription', 'access']

const listProducts = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const createProduct = async (companyId, { name, imageUrl, productType, description, sellingPrice, category, tags }) => {
  if (!name) throw new HttpsError('invalid-argument', 'name is required')
  if (!PRODUCT_TYPES.includes(productType)) {
    throw new HttpsError('invalid-argument', `productType must be one of ${PRODUCT_TYPES.join(', ')}`)
  }
  if (tags !== undefined && !Array.isArray(tags)) {
    throw new HttpsError('invalid-argument', 'tags must be an array of strings')
  }

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    name,
    imageUrl: imageUrl ?? '',
    productType,
    description: description ?? '',
    sellingPrice: sellingPrice ?? 0,
    category: category ?? '',
    tags: tags ?? [],
    status: 'active',
    published: true,
  })
}

const searchProducts = (companyId, { query, limit }) => searchDocs(COLLECTION, { query, limit, companyId })

module.exports = { listProducts, createProduct, searchProducts, PRODUCT_TYPES }
