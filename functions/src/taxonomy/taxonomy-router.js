const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listTaxonomy, createTaxonomyEntry, batchUpsertTaxonomy } = require('./taxonomy-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const taxonomy = await listTaxonomy(req.companyId)
  res.json({ taxonomy })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createTaxonomyEntry(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await batchUpsertTaxonomy(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.taxonomy = onRequest({ secrets: ['JWT_SECRET'] }, app)
