const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('./async-route')

const createCrudRouter = ({ resourceName, service, secrets = ['JWT_SECRET'] }) => {
  const router = express.Router()
  router.use(requireAuth)

  router.get('/', requireCompanyAccessFromQuery, asyncRoute(async (req, res) => {
    const items = await service.list(req.companyId)
    res.json({ [resourceName]: items })
  }))

  router.post('/search', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
    const items = await service.search(req.companyId, req.body ?? {})
    res.json({ [resourceName]: items })
  }))

  router.post('/', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
    const result = await service.create(req.companyId, req.body, req.user)
    res.status(201).json(result)
  }))

  router.patch('/:id', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
    const result = await service.update(req.companyId, req.params.id, req.body ?? {})
    res.json(result)
  }))

  router.delete('/:id', requireCompanyAccessFromBody, asyncRoute(async (req, res) => {
    const result = await service.remove(req.companyId, req.params.id)
    res.json(result)
  }))

  const app = express()
  app.use(cors({ origin: true }))
  app.use(express.json())
  app.use('/', router)

  return onRequest({ secrets }, app)
}

module.exports = { createCrudRouter }
