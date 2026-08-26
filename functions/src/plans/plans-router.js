const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listPlans, createPlan, batchUpsertPlans } = require('./plans-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const plans = await listPlans(req.companyId)
  res.json({ plans })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createPlan(req.companyId, req.body, req.user)
  res.status(201).json(result)
}))

router.post('/batch', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await batchUpsertPlans(req.companyId, req.body.rows)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.plans = onRequest({ secrets: ['JWT_SECRET'] }, app)
