const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/asyncRoute')
const { listProducts, createProduct, searchProducts } = require('./service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const products = await listProducts(user.orgId)
  res.json({ products })
}))

router.post('/search', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const products = await searchProducts(user.orgId, req.body ?? {})
  res.json({ products })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await createProduct(user.orgId, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.products = onRequest({ secrets: ['JWT_SECRET'] }, app)
