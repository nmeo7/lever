const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFrom } = require('../util/async-route')
const { listResources, createResource, batchUpsertResources } = require('./resources-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFrom('query'), asyncRoute(async (req, res) => {
  const resources = await listResources(req.companyId)
  res.json({ resources })
}))

router.post('/', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await createResource(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFrom('body'), asyncRoute(async (req, res) => {
  const result = await batchUpsertResources(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.resources = onRequest({ secrets: ['JWT_SECRET'] }, app)
