const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listLocations, createLocation, batchUpsertLocations } = require('./locations-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const locations = await listLocations(req.companyId)
  res.json({ locations })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createLocation(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await batchUpsertLocations(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.locations = onRequest({ secrets: ['JWT_SECRET'] }, app)
