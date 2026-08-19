const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/asyncRoute')
const { listPayments, createPayment, searchPayments, recordOrderPayment } = require('./service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const payments = await listPayments(user.orgId)
  res.json({ payments })
}))

router.post('/search', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const payments = await searchPayments(user.orgId, req.body ?? {})
  res.json({ payments })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await createPayment(user.orgId, req.body ?? {})
  res.status(201).json(result)
}))

router.post('/receive', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await recordOrderPayment(user.orgId, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.payments = onRequest({ secrets: ['JWT_SECRET'] }, app)
