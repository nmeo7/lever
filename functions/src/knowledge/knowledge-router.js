const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listKnowledge, createKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, searchKnowledge } = require('./knowledge-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const knowledge = await listKnowledge()
  res.json({ knowledge })
}))

router.post('/search', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const knowledge = await searchKnowledge(req.body ?? {})
  res.json({ knowledge })
}))

router.post('/', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await createKnowledgeEntry(req.body ?? {})
  res.status(201).json(result)
}))

router.patch('/:id', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await updateKnowledgeEntry(req.params.id, req.body ?? {})
  res.json(result)
}))

router.delete('/:id', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  const result = await deleteKnowledgeEntry(req.params.id)
  res.json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.knowledge = onRequest({ secrets: ['JWT_SECRET', 'FIELD_ENCRYPTION_KEY'] }, app)
