const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listSuppliers, createSupplier, batchUpsertSuppliers } = require('./suppliers-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const suppliers = await listSuppliers(req.companyId)
  res.json({ suppliers })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createSupplier(req.companyId, req.body)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await batchUpsertSuppliers(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.suppliers = onRequest({ secrets: ['JWT_SECRET'] }, app)
