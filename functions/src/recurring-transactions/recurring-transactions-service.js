const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId, batchUpsert } = require('../util/data')

const COLLECTION = 'erp-recurring-transactions'
const RECURRING_TRANSACTION_TYPES = ['incoming', 'outgoing']
const RECURRING_TRANSACTION_FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']
const RECURRING_TRANSACTION_STATUSES = ['active', 'paused', 'completed', 'cancelled']

const listRecurringTransactions = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validateRecurringTransactionFields = ({ type, description, expectedAmount, frequency, status }) => {
  if (!RECURRING_TRANSACTION_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', `type must be one of ${RECURRING_TRANSACTION_TYPES.join(', ')}`)
  }
  if (!description) throw new HttpsError('invalid-argument', 'description is required')
  if (expectedAmount === undefined || expectedAmount === null) {
    throw new HttpsError('invalid-argument', 'expectedAmount is required')
  }
  if (!RECURRING_TRANSACTION_FREQUENCIES.includes(frequency)) {
    throw new HttpsError('invalid-argument', `frequency must be one of ${RECURRING_TRANSACTION_FREQUENCIES.join(', ')}`)
  }
  if (status !== undefined && !RECURRING_TRANSACTION_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of ${RECURRING_TRANSACTION_STATUSES.join(', ')}`)
  }
}

const createRecurringTransaction = async (companyId, fields) => {
  validateRecurringTransactionFields(fields)
  const {
    type, customerId, supplierId, productId, description, expectedAmount,
    frequency, startDate, endDate, nextDueDate, status,
  } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    type,
    customerId: customerId ?? '',
    supplierId: supplierId ?? '',
    productId: productId ?? '',
    description,
    expectedAmount,
    frequency,
    startDate: startDate ?? '',
    endDate: endDate ?? '',
    nextDueDate: nextDueDate ?? '',
    status: status ?? 'active',
  })
}

const batchUpsertRecurringTransactions = (companyId, rows) => batchUpsert(companyId, rows, createRecurringTransaction)

module.exports = {
  listRecurringTransactions,
  createRecurringTransaction,
  batchUpsertRecurringTransactions,
  RECURRING_TRANSACTION_TYPES,
  RECURRING_TRANSACTION_FREQUENCIES,
  RECURRING_TRANSACTION_STATUSES,
}
