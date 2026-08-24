const { HttpsError } = require('firebase-functions/v2/https')
const { FieldValue } = require('firebase-admin/firestore')
const { db, listDocs, createDoc, searchDocs, resolveGroupId, createDocInTx, updateDocInTx } = require('../util/data')

const COLLECTION = 'erp-payments'
const ORDERS_COLLECTION = 'erp-orders'
const INVENTORY_COLLECTION = 'erp-inventory'
const INVENTORY_MOVEMENTS_COLLECTION = 'erp-inventoryMovements'
const PAYMENT_TYPES = ['incoming', 'outgoing']
const PAYMENT_CATEGORIES = ['sale', 'salary', 'tax', 'payable', 'receivable', 'refund', 'subscription', 'other']
const PAYMENT_METHODS = ['cash', 'bank', 'card', 'mobileMoney', 'cheque', 'other']

const listPayments = (companyId) => listDocs(COLLECTION, 'paymentDate', companyId)

const createPayment = async (companyId, { type, category, amount, currency = 'FRW', paymentDate, method, notes }) => {
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
  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    type,
    category,
    amount,
    currency,
    paymentDate: resolvedDate,
    fiscalPeriod: resolvedDate.slice(0, 7),
    method,
    notes: notes ?? '',
  })
}

const searchPayments = (companyId, { query, limit }) => searchDocs(COLLECTION, { query, limit, companyId })

const recordOrderPayment = async (companyId, { orderId, amount, method, reference, notes, currency = 'FRW' }) => {
  if (!orderId || !amount || !method) {
    throw new HttpsError('invalid-argument', 'orderId, amount, and method required')
  }

  const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId)

  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    if (!orderSnap.exists || orderSnap.data().companyId !== companyId) {
      throw new HttpsError('not-found', 'Order not found')
    }

    const order = orderSnap.data()
    const paymentsSnap = await db
      .collection(COLLECTION)
      .where('companyId', '==', companyId)
      .where('relatedId', '==', orderId)
      .get()
    const paidSoFar = paymentsSnap.docs.reduce((s, d) => s + d.data().amount, 0)
    const newTotal = paidSoFar + amount

    const paymentStatus =
      newTotal >= order.totalAmount ? 'paid' : newTotal > 0 ? 'partial' : 'unpaid'

    const paymentRef = db.collection(COLLECTION).doc()
    createDocInTx(tx, paymentRef, {
      companyId,
      groupId: order.groupId ?? null,
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
    })

    updateDocInTx(tx, orderRef, {
      paymentStatus,
      status: paymentStatus === 'paid' ? 'completed' : order.status,
    })

    if (paymentStatus === 'paid') {
      for (const item of order.items) {
        const invQuery = await db
          .collection(INVENTORY_COLLECTION)
          .where('companyId', '==', companyId)
          .where('productId', '==', item.productId)
          .get()
        for (const invDoc of invQuery.docs) {
          tx.update(invDoc.ref, {
            quantityOnHand: FieldValue.increment(-item.quantity),
            reservedQuantity: FieldValue.increment(-item.quantity),
            lastUpdated: new Date().toISOString(),
          })
          const movRef = db.collection(INVENTORY_MOVEMENTS_COLLECTION).doc()
          createDocInTx(tx, movRef, {
            companyId,
            groupId: order.groupId ?? null,
            productId: item.productId,
            locationId: invDoc.data().locationId,
            quantity: -item.quantity,
            movementType: 'sale',
            orderId,
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
