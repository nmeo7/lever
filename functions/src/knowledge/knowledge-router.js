const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listKnowledge, createKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, searchKnowledge } = require('./knowledge-service')

const router = express.Router()
router.use(requireAuth)

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const knowledge = await listKnowledge(req.companyId)
  res.json({ knowledge })
}))

router.post('/search', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const knowledge = await searchKnowledge(req.companyId, req.body ?? {})
  res.json({ knowledge })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createKnowledgeEntry(req.companyId, req.body ?? {})
  res.status(201).json(result)
}))

router.patch('/:id', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await updateKnowledgeEntry(req.companyId, req.params.id, req.body ?? {})
  res.json(result)
}))

router.delete('/:id', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await deleteKnowledgeEntry(req.companyId, req.params.id)
  res.json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.knowledge = onRequest({ secrets: ['JWT_SECRET', 'FIELD_ENCRYPTION_KEY'] }, app)
