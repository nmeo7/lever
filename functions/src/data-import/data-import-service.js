const { HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')

const IMPORTABLE_COLLECTIONS = [
  'erp-products',
  'erp-inventory',
  'erp-orders',
  'erp-payments',
  'erp-people',
  'erp-documents',
  'erp-jobs',
  'erp-assets',
]

const requireAdmin = (user) => {
  if (user.roleId !== 'admin') throw new HttpsError('permission-denied', 'Admin only')
}

const requireImportableCollection = (collection) => {
  if (!IMPORTABLE_COLLECTIONS.includes(collection)) {
    throw new HttpsError('invalid-argument', `collection must be one of ${IMPORTABLE_COLLECTIONS.join(', ')}`)
  }
}

const BATCH_SIZE = 400

const chunk = (array, size) =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size))

const upsertRows = async (user, { collection, rows }) => {
  requireAdmin(user)
  requireImportableCollection(collection)

  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const now = new Date().toISOString()

  for (const rowsChunk of chunk(rows, BATCH_SIZE)) {
    const batch = db.batch()
    rowsChunk.forEach(({ id, ...fields }) => {
      const docRef = id ? db.collection(collection).doc(id) : db.collection(collection).doc()
      batch.set(docRef, { ...fields, updatedAt: now }, { merge: true })
    })
    await batch.commit()
  }

  return { count: rows.length }
}

module.exports = { upsertRows, IMPORTABLE_COLLECTIONS }
