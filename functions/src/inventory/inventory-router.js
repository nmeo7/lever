const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listInventory, listInventoryMovements, adjustInventory } = require('./inventory-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const inventory = await listInventory(req.companyId)
  res.json({ inventory })
}))

router.get('/movements', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const movements = await listInventoryMovements(req.companyId)
  res.json({ movements })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await adjustInventory(req.companyId, req.body)
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.inventory = onRequest({ secrets: ['JWT_SECRET'] }, app)
