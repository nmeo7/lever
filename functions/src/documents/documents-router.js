const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listDocuments, createDocument, updateDocument, deleteDocument, searchDocuments } = require('./documents-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const documents = await listDocuments()
  res.json({ documents })
}))

router.post('/search', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const documents = await searchDocuments(req.body ?? {})
  res.json({ documents })
}))

router.post('/', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await createDocument(req.body ?? {})
  res.status(201).json(result)
}))

router.patch('/:id', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await updateDocument(req.params.id, req.body ?? {})
  res.json(result)
}))

router.delete('/:id', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await deleteDocument(req.params.id)
  res.json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.documents = onRequest({ secrets: ['JWT_SECRET'] }, app)
