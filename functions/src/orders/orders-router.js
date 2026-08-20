const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listOrders, createOrder } = require('./orders-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companyId = requireCompanyAccess(user, req.query.companyId)
  const orders = await listOrders(companyId)
  res.json({ orders })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...order } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await createOrder(verifiedCompanyId, order)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.orders = onRequest({ secrets: ['JWT_SECRET'] }, app)
