const express = require('express')
const cors = require('cors')
const { onRequest, HttpsError } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/asyncRoute')
const { listOrders, createOrder } = require('./service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const orders = await listOrders(user.orgId)
  res.json({ orders })
}))

router.post('/', asyncRoute(async (req, res) => {
  const { orgId, ...order } = req.body ?? {}
  if (!orgId) throw new HttpsError('invalid-argument', 'orgId is required')
  const result = await createOrder(orgId, order)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.orders = onRequest({ secrets: ['JWT_SECRET'] }, app)
