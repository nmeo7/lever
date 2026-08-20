const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listPayments, createPayment, searchPayments, recordOrderPayment } = require('./payments-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companyId = requireCompanyAccess(user, req.query.companyId)
  const payments = await listPayments(companyId)
  res.json({ payments })
}))

router.post('/search', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const payments = await searchPayments(verifiedCompanyId, body)
  res.json({ payments })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await createPayment(verifiedCompanyId, body)
  res.status(201).json(result)
}))

router.post('/receive', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await recordOrderPayment(verifiedCompanyId, body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.payments = onRequest({ secrets: ['JWT_SECRET'] }, app)
