const { HttpsError } = require('firebase-functions/v2/https')
const { FieldValue } = require('firebase-admin/firestore')
const { db, listDocs, resolveGroupId, createDocInTx } = require('../util/data')

const COLLECTION = 'erp-orders'
const PRODUCTS_COLLECTION = 'erp-products'
const INVENTORY_COLLECTION = 'erp-inventory'

const listOrders = (companyId) => listDocs(COLLECTION, 'orderDate', companyId)

const createOrder = async (companyId, { customerId, items, notes, currency = 'USD' }) => {
  if (!items?.length) throw new HttpsError('invalid-argument', 'items required')

  const productIds = items.map((i) => i.productId)
  const productSnaps = await Promise.all(
    productIds.map((id) => db.collection(PRODUCTS_COLLECTION).doc(id).get()),
  )

  const enrichedItems = items.map((item, idx) => {
    const product = productSnaps[idx].data()
    if (!product || product.companyId !== companyId) {
      throw new HttpsError('not-found', `Product ${item.productId} not found`)
    }
    const unitPrice = product.sellingPrice
    return { ...item, unitPrice, subtotal: unitPrice * item.quantity, currency }
  })

  const subTotal = enrichedItems.reduce((s, i) => s + i.subtotal, 0)
  const totalAmount = subTotal

  const groupId = await resolveGroupId(companyId)
  const orderRef = db.collection(COLLECTION).doc()

  await db.runTransaction(async (tx) => {
    for (const item of enrichedItems) {
      const invQuery = await db
        .collection(INVENTORY_COLLECTION)
        .where('companyId', '==', companyId)
        .where('productId', '==', item.productId)
        .get()

      for (const invDoc of invQuery.docs) {
        const inv = invDoc.data()
        const available = inv.quantityOnHand - inv.reservedQuantity
        if (available < item.quantity) {
          throw new HttpsError('failed-precondition', `Insufficient inventory for ${item.productId}`)
        }
        tx.update(invDoc.ref, {
          reservedQuantity: FieldValue.increment(item.quantity),
          lastUpdated: new Date().toISOString(),
        })
      }
    }

    createDocInTx(tx, orderRef, {
      companyId,
      groupId,
      type: 'sale',
      customerId: customerId ?? null,
      items: enrichedItems,
      subTotal,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount,
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      notes: notes ?? '',
      attachments: [],
      createdBy: null,
      orderDate: new Date().toISOString(),
      scheduledDate: null,
    })
  })

  return { orderId: orderRef.id }
}

module.exports = { listOrders, createOrder }
