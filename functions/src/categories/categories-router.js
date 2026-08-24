const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listCategories, createCategory, batchUpsertCategories } = require('./categories-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companyId = requireCompanyAccess(user, req.query.companyId)
  const categories = await listCategories(companyId)
  res.json({ categories })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await createCategory(verifiedCompanyId, body)
  res.status(201).json(result)
}))

router.post('/batch', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, rows } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await batchUpsertCategories(verifiedCompanyId, rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.categories = onRequest({ secrets: ['JWT_SECRET'] }, app)
