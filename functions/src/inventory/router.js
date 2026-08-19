const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/asyncRoute')
const { listInventory, listInventoryMovements, adjustInventory } = require('./service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const inventory = await listInventory(user.orgId)
  res.json({ inventory })
}))

router.get('/movements', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const movements = await listInventoryMovements(user.orgId)
  res.json({ movements })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await adjustInventory(user.orgId, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.inventory = onRequest({ secrets: ['JWT_SECRET'] }, app)
