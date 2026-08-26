const express = require('express')
const cors = require('cors')
const { HttpsError, onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listOrders, createOrder } = require('./orders-service')
const { findOrCreateCustomer } = require('../customers/customers-service')

const router = express.Router()

router.post('/frontdesk', asyncRoute(async (req, res) => {
  const { companyId, customerName, customerPhone, ...order } = req.body ?? {}
  if (!companyId) throw new HttpsError('invalid-argument', 'companyId is required')

  const { id: customerId } = await findOrCreateCustomer(companyId, { name: customerName, phone: customerPhone })
  const result = await createOrder(companyId, { ...order, customerId })
  res.status(201).json(result)
}))

router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const orders = await listOrders(req.companyId)
  res.json({ orders })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createOrder(req.companyId, req.body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.orders = onRequest({ secrets: ['JWT_SECRET'] }, app)
