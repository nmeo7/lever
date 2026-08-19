const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/asyncRoute')
const { listTenants, createTenant } = require('./service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const tenants = await listTenants(user)
  res.json({ tenants })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const tenant = await createTenant(user, req.body ?? {})
  res.status(201).json(tenant)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.tenants = onRequest({ secrets: ['JWT_SECRET'] }, app)
