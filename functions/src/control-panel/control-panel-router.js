const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { requireAuthFromRequest } = require('../util/auth')
const { asyncRoute } = require('../util/async-route')
const { listGroups, createGroup, listCompaniesForGroup, createCompany, createCompanyPerson, batchUpsert } = require('./control-panel-service')

const router = express.Router()

router.get('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const groups = await listGroups(user)
  res.json({ groups })
}))

router.post('/', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const group = await createGroup(user, req.body ?? {})
  res.status(201).json(group)
}))

router.post('/companies', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const company = await createCompany(user, req.body ?? {})
  res.status(201).json(company)
}))

router.get('/:groupId/companies', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const companies = await listCompaniesForGroup(user, req.params.groupId)
  res.json({ companies })
}))

router.post('/:groupId/companies', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const company = await createCompany(user, { ...req.body, groupId: req.params.groupId })
  res.status(201).json(company)
}))

router.post('/companies/:companySlug/people', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const person = await createCompanyPerson(user, { ...req.body, companySlug: req.params.companySlug })
  res.status(201).json(person)
}))

router.post('/batch', asyncRoute(async (req, res) => {
  const user = await requireAuthFromRequest(req)
  const result = await batchUpsert(user, req.body ?? {})
  res.status(201).json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.controlPanel = onRequest({ secrets: ['JWT_SECRET'] }, app)
