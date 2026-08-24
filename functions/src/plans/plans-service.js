const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, resolveGroupId } = require('../util/data')

const COLLECTION = 'erp-plans'
const PLAN_TYPES = ['income', 'expense', 'goal', 'milestone', 'reminder', 'event']
const PLAN_STATUSES = ['expected', 'confirmed', 'cancelled', 'realized']
const PLAN_PRIORITIES = ['low', 'medium', 'high', 'critical']
const PLAN_REPEATS = ['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']

const listPlans = (companyId) => listDocs(COLLECTION, 'createdAt', companyId)

const validatePlanFields = ({ type, title, status, priority, repeat }) => {
  if (!PLAN_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', `type must be one of ${PLAN_TYPES.join(', ')}`)
  }
  if (!title) throw new HttpsError('invalid-argument', 'title is required')
  if (status !== undefined && !PLAN_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', `status must be one of ${PLAN_STATUSES.join(', ')}`)
  }
  if (priority !== undefined && !PLAN_PRIORITIES.includes(priority)) {
    throw new HttpsError('invalid-argument', `priority must be one of ${PLAN_PRIORITIES.join(', ')}`)
  }
  if (repeat !== undefined && !PLAN_REPEATS.includes(repeat)) {
    throw new HttpsError('invalid-argument', `repeat must be one of ${PLAN_REPEATS.join(', ')}`)
  }
}

const createPlan = async (companyId, fields) => {
  validatePlanFields(fields)
  const {
    type, title, description, category, goal, value, currency, probability,
    expectedDate, actualAmount, actualDate, status, priority, repeat, notes,
  } = fields

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, {
    companyId,
    groupId,
    type,
    title,
    description: description ?? '',
    category: category ?? '',
    goal: goal ?? '',
    value: value ?? 0,
    currency: currency ?? 'FRW',
    probability: probability ?? 0,
    expectedDate: expectedDate ?? '',
    actualAmount: actualAmount ?? 0,
    actualDate: actualDate ?? '',
    status: status ?? 'expected',
    priority: priority ?? 'medium',
    repeat: repeat ?? 'none',
    notes: notes ?? '',
  })
}

const batchUpsertPlans = async (companyId, rows) => {
  if (!Array.isArray(rows) || !rows.length) throw new HttpsError('invalid-argument', 'rows must be a non-empty array')

  const errors = []
  let count = 0

  for (const [index, row] of rows.entries()) {
    try {
      await createPlan(companyId, row)
      count += 1
    } catch (error) {
      errors.push({ row: index, message: error.message ?? 'Unknown error' })
    }
  }

  return { count, errors }
}

module.exports = { listPlans, createPlan, batchUpsertPlans, PLAN_TYPES, PLAN_STATUSES, PLAN_PRIORITIES, PLAN_REPEATS }
