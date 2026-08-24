const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listPeople, createPerson, updatePerson, ROLE_IDS } = require('./people-service')

const router = express.Router()
router.use(requireAuth)

router.get('/roles', asyncRoute(async (req, res) => {
  res.json({ roles: ROLE_IDS })
}))

router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
  const people = await listPeople(req.companyId)
  res.json({ people })
}))

router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await createPerson(req.companyId, req.body)
  res.status(201).json(result)
}))

router.patch('/:id', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
  const result = await updatePerson(req.companyId, req.params.id, req.body)
  res.json(result)
}))

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.people = onRequest({ secrets: ['JWT_SECRET'] }, app)
