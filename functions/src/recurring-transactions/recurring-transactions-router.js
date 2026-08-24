const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFrom } = require('../util/async-route')
const {
  listRecurringTransactions,
  createRecurringTransaction,
  batchUpsertRecurringTransactions,
} = require('./recurring-transactions-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFrom('query'), asyncRoute(async (req, res) => {
  const recurringTransactions = await listRecurringTransactions(req.companyId)
  res.json({ recurringTransactions })
}))

router.post('/', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await createRecurringTransaction(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await batchUpsertRecurringTransactions(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.recurringTransactions = onRequest({ secrets: ['JWT_SECRET'] }, app)
