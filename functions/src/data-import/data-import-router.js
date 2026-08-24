const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { upsertRows, IMPORTABLE_COLLECTIONS } = require('./data-import-service')

const router = express.Router()

router.get('/collections', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  res.json({ collections: IMPORTABLE_COLLECTIONS })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await upsertRows(user, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use('/', router)

exports.dataImport = onRequest({ secrets: ['JWT_SECRET'] }, app)
