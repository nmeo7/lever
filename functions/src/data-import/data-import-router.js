const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth } = require('../util/async-route')
const { upsertRows, IMPORTABLE_COLLECTIONS } = require('./data-import-service')

const router = express.Router()
router.use(requireAuth)

router.get('/collections', asyncRoute(async (req, res) => {
  res.json({ collections: IMPORTABLE_COLLECTIONS })
}))

router.post('/', asyncRoute(async (req, res) => {
  const result = await upsertRows(req.user, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use('/', router)

exports.dataImport = onRequest({ secrets: ['JWT_SECRET'] }, app)
