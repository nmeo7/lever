const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listOrders, createOrder } = require('./orders-service')

const router = express.Router()
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
