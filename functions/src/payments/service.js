const { HttpsError } = require('firebase-functions/v2/https')
const { FieldValue } = require('firebase-admin/firestore')
const { db, listDocs, createDoc, searchDocs } = require('../util/data')

const COLLECTION = 'erp-payments'
const ORDERS_COLLECTION = 'erp-orders'
const INVENTORY_COLLECTION = 'erp-inventory'
const INVENTORY_MOVEMENTS_COLLECTION = 'erp-inventoryMovements'
const PAYMENT_TYPES = ['incoming', 'outgoing']
const PAYMENT_CATEGORIES = ['sale', 'salary', 'tax', 'payable', 'receivable', 'refund', 'subscription', 'other']
const PAYMENT_METHODS = ['cash', 'bank', 'card', 'mobileMoney', 'cheque', 'other']

const listPayments = (orgId) => listDocs(COLLECTION, 'paymentDate', orgId)

const createPayment = async (orgId, { type, category, amount, currency = 'USD', paymentDate, method, notes }) => {
  if (!PAYMENT_TYPES.includes(type)) throw new HttpsError('invalid-argument', `type must be one of ${PAYMENT_TYPES.join(', ')}`)
  if (!PAYMENT_CATEGORIES.includes(category)) {
    throw new HttpsError('invalid-argument', `category must be one of ${PAYMENT_CATEGORIES.join(', ')}`)
  }
  if (!amount || amount <= 0) throw new HttpsError('invalid-argument', 'amount must be a positive number')
  if (!PAYMENT_METHODS.includes(method)) {
    throw new HttpsError('invalid-argument', `method must be one of ${PAYMENT_METHODS.join(', ')}`)
  }

  const now = new Date().toISOString()
  const resolvedDate = paymentDate ?? now

  return createDoc(COLLECTION, {
    orgId,
    type,
    category,
    amount,
    currency,
    paymentDate: resolvedDate,
    fiscalPeriod: resolvedDate.slice(0, 7),
    method,
    notes: notes ?? '',
    createdAt: now,
  })
}

const searchPayments = (orgId, { query, limit }) => searchDocs(COLLECTION, { query, limit, orgId })

const recordOrderPayment = async (orgId, { orderId, amount, method, reference, notes, currency = 'USD' }) => {
  if (!orderId || !amount || !method) {
    throw new HttpsError('invalid-argument', 'orderId, amount, and method required')
  }

  const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId)

  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists || orderSnap.data().orgId !== orgId) {
      throw new HttpsError('not-found', 'Order not found')
    }

    const order = orderSnap.data()
    const paymentsSnap = await db
      .collection(COLLECTION)
      .where('orgId', '==', orgId)
      .where('relatedId', '==', orderId)
      .get()
    const paidSoFar = paymentsSnap.docs.reduce((s, d) => s + d.data().amount, 0)
    const newTotal = paidSoFar + amount

    const paymentStatus =
      newTotal >= order.totalAmount ? 'paid' : newTotal > 0 ? 'partial' : 'unpaid'

    const paymentRef = db.collection(COLLECTION).doc()
    tx.set(paymentRef, {
      orgId,
      type: 'incoming',
      category: 'sale',
      amount,
      currency,
      paymentDate: new Date().toISOString(),
      fiscalPeriod: new Date().toISOString().slice(0, 7),
      method,
      relatedType: 'order',
      relatedId: orderId,
      reference: reference ?? '',
      notes: notes ?? '',
      attachments: [],
      createdAt: new Date().toISOString(),
    })

    tx.update(orderRef, {
      paymentStatus,
      status: paymentStatus === 'paid' ? 'completed' : order.status,
      updatedAt: new Date().toISOString(),
    })

    if (paymentStatus === 'paid') {
      for (const item of order.items) {
        const invQuery = await db
          .collection(INVENTORY_COLLECTION)
          .where('orgId', '==', orgId)
          .where('productId', '==', item.productId)
          .get()
        for (const invDoc of invQuery.docs) {
          tx.update(invDoc.ref, {
            quantityOnHand: FieldValue.increment(-item.quantity),
            reservedQuantity: FieldValue.increment(-item.quantity),
            lastUpdated: new Date().toISOString(),
          })
          const movRef = db.collection(INVENTORY_MOVEMENTS_COLLECTION).doc()
          tx.set(movRef, {
            orgId,
            productId: item.productId,
            locationId: invDoc.data().locationId,
            quantity: -item.quantity,
            movementType: 'sale',
            orderId,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }
  })

  return { success: true }
}

module.exports = {
  listPayments,
  createPayment,
  searchPayments,
  recordOrderPayment,
  PAYMENT_TYPES,
  PAYMENT_CATEGORIES,
  PAYMENT_METHODS,
}
