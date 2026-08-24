const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFrom } = require('../util/async-route')
const { listPayments, createPayment, searchPayments, recordOrderPayment } = require('./payments-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFrom('query'), asyncRoute(async (req, res) => {
  const payments = await listPayments(req.companyId)
  res.json({ payments })
}))

router.post('/search', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const payments = await searchPayments(req.companyId, req.body)
  res.json({ payments })
}))

router.post('/', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await createPayment(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/receive', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await recordOrderPayment(req.companyId, req.body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.payments = onRequest({ secrets: ['JWT_SECRET'] }, app)
