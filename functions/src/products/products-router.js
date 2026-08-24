const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFrom } = require('../util/async-route')
const { listProducts, createProduct, searchProducts } = require('./products-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFrom('query'), asyncRoute(async (req, res) => {
  const products = await listProducts(req.companyId)
  res.json({ products })
}))

router.post('/search', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const products = await searchProducts(req.companyId, req.body)
  res.json({ products })
}))

router.post('/', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await createProduct(req.companyId, req.body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.products = onRequest({ secrets: ['JWT_SECRET'] }, app)
