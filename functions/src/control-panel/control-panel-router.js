const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth } = require('../util/async-route')
const { listGroups, createGroup, listCompaniesForGroup, createCompany, createCompanyPerson, batchUpsert } = require('./control-panel-service')

const router = express.Router()
router.use(requireAuth)

router.get(
	'/',
	asyncRoute(async (req, res) => {
		const groups = await listGroups(req.user)
		res.json({ groups })
	}),
)

router.post(
	'/',
	asyncRoute(async (req, res) => {
		const group = await createGroup(req.user, req.body ?? {})
		res.status(201).json(group)
	}),
)

router.post(
	'/companies',
	asyncRoute(async (req, res) => {
		const company = await createCompany(req.user, req.body ?? {})
		res.status(201).json(company)
	}),
)

router.get(
	'/:groupId/companies',
	asyncRoute(async (req, res) => {
		const companies = await listCompaniesForGroup(req.user, req.params.groupId)
		res.json({ companies })
	}),
)

router.post(
	'/:groupId/companies',
	asyncRoute(async (req, res) => {
		const company = await createCompany(req.user, { ...req.body, groupId: req.params.groupId })
		res.status(201).json(company)
	}),
)

router.post(
	'/companies/:companySlug/people',
	asyncRoute(async (req, res) => {
		const person = await createCompanyPerson(req.user, { ...req.body, companySlug: req.params.companySlug })
		res.status(201).json(person)
	}),
)

router.post(
	'/batch',
	asyncRoute(async (req, res) => {
		const result = await batchUpsert(req.user, req.body ?? {})
		res.status(201).json(result)
	}),
)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.controlPanel = onRequest({ secrets: ['JWT_SECRET'] }, app)
