const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { getCompanyContact, updateCompanyContact } = require('./org-settings-service')

const router = express.Router()
router.use(requireAuth)

router.get(
  '/contact',
  requireCompanyAccessFromQuery,
  asyncRoute(async (req, res) => {
    const contact = await getCompanyContact(req.companyId)
    res.json(contact)
  }),
)

router.patch(
  '/contact',
  requireCompanyAccessFromBody,
  asyncRoute(async (req, res) => {
    const contact = await updateCompanyContact(req.companyId, req.body)
    res.json(contact)
  }),
)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.orgSettings = onRequest({ secrets: ['JWT_SECRET'] }, app)
