const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromQuery, requireCompanyAccessFromBody } = require('../util/async-route')
const { listCustomers, createCustomer, batchUpsertCustomers } = require('./customers-service')

const router = express.Router()
router.use(requireAuth)

router.get(
	'/',
	requireCompanyAccessFromQuery,
	asyncRoute(async (req, res) => {
		const customers = await listCustomers(req.companyId)
		res.json({ customers })
	}),
)

router.post(
	'/',
	requireCompanyAccessFromBody,
	asyncRoute(async (req, res) => {
		const result = await createCustomer(req.companyId, req.body)
		res.status(201).json(result)
	}),
)

router.post(
	'/batch',
	requireCompanyAccessFromBody,
	asyncRoute(async (req, res) => {
		const result = await batchUpsertCustomers(req.companyId, req.body.rows)
		res.status(201).json(result)
	}),
)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.customers = onRequest({ secrets: ['JWT_SECRET'] }, app)
