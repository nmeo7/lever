const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listPeople, createPerson, updatePerson, ROLE_IDS } = require('./people-service')

const router = express.Router()

router.get('/roles', asyncRoute(async (req, res) => {
  await requireAuthFromRequest(req)
  res.json({ roles: ROLE_IDS })
}))

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companyId = requireCompanyAccess(user, req.query.companyId)
  const people = await listPeople(companyId)
  res.json({ people })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await createPerson(verifiedCompanyId, body)
  res.status(201).json(result)
}))

router.patch('/:id', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const { companyId, ...body } = req.body ?? {}
  const verifiedCompanyId = requireCompanyAccess(user, companyId)
  const result = await updatePerson(verifiedCompanyId, req.params.id, body)
  res.json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.people = onRequest({ secrets: ['JWT_SECRET'] }, app)
