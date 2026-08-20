const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listProducts, createProduct, searchProducts } = require('./products-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companyId = requireCompanyAccess(user, req.query.companyId)
  const products = await listProducts(companyId)
  res.json({ products })
}))

router.post('/search', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const products = await searchProducts(verifiedCompanyId, body)
  res.json({ products })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await createProduct(verifiedCompanyId, body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.products = onRequest({ secrets: ['JWT_SECRET'] }, app)
