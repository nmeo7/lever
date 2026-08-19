const { HttpsError } = require('firebase-functions/v2/https')
const { FieldValue } = require('firebase-admin/firestore')
const { db, listDocs } = require('../util/data')

const COLLECTION = 'erp-inventory'
const MOVEMENTS_COLLECTION = 'erp-inventoryMovements'
const PRODUCTS_COLLECTION = 'erp-products'

const listInventory = (orgId) => listDocs(COLLECTION, 'lastUpdated', orgId)

const listInventoryMovements = (orgId) => listDocs(MOVEMENTS_COLLECTION, 'createdAt', orgId)

const adjustInventory = async (orgId, { productId, locationId, quantity, reorderLevel, expirationDate, notes }) => {
  if (!productId) throw new HttpsError('invalid-argument', 'productId is required')
  if (!quantity || quantity === 0) throw new HttpsError('invalid-argument', 'quantity must be a non-zero number')

  const productSnap = await db.collection(PRODUCTS_COLLECTION).doc(productId).get()
  if (!productSnap.exists || productSnap.data().orgId !== orgId) {
    throw new HttpsError('not-found', `Product ${productId} not found`)
  }

  const now = new Date().toISOString()

  const invQuery = await db
    .collection(COLLECTION)
    .where('orgId', '==', orgId)
    .where('productId', '==', productId)
    .where('locationId', '==', locationId ?? '')
    .limit(1)
    .get()

  const invRef = invQuery.empty ? db.collection(COLLECTION).doc() : invQuery.docs[0].ref

  await db.runTransaction(async (tx) => {
    const invSnap = await tx.get(invRef)

    if (!invSnap.exists) {
      if (quantity < 0) throw new HttpsError('failed-precondition', 'Cannot reduce inventory that does not exist')
      tx.set(invRef, {
        orgId,
        productId,
        locationId: locationId ?? '',
        quantityOnHand: quantity,
        reservedQuantity: 0,
        reorderLevel: reorderLevel ?? 0,
        expirationDate: expirationDate ?? '',
        lastUpdated: now,
      })
    } else {
      const current = invSnap.data()
      const nextQuantity = current.quantityOnHand + quantity
      if (nextQuantity < 0) throw new HttpsError('failed-precondition', 'Insufficient inventory to adjust')
      tx.update(invRef, {
        quantityOnHand: FieldValue.increment(quantity),
        ...(reorderLevel !== undefined ? { reorderLevel } : {}),
        ...(expirationDate !== undefined ? { expirationDate } : {}),
        lastUpdated: now,
      })
    }

    const movRef = db.collection(MOVEMENTS_COLLECTION).doc()
    tx.set(movRef, {
      orgId,
      productId,
      locationId: locationId ?? '',
      quantity,
      movementType: quantity > 0 ? 'purchase' : 'adjustment',
      orderId: '',
      notes: notes ?? '',
      createdAt: now,
    })
  })

  return { id: invRef.id }
}

module.exports = { listInventory, listInventoryMovements, adjustInventory }
