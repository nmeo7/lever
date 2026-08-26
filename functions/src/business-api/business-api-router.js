const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { buildSystemPrompt } = require('./system-prompt')
const { getToolsForPlan } = require('./tools')
const { dispatchTool } = require('./tool-handlers')
const { getOrgConfig } = require('../util/get-org-config')

const router = express.Router({ mergeParams: true })

router.post('/:businessId/system-prompt', async (req, res) => {
  const { businessId } = req.params
  const systemPrompt = await buildSystemPrompt(businessId, req.body.summary)
  res.json({ systemPrompt })
})

router.get('/:businessId/tools', async (req, res) => {
  const config = await getOrgConfig(req.params.businessId)
  res.json(getToolsForPlan(config.plan ?? 'free'))
})

router.post('/:businessId/tools/execute', async (req, res) => {
  const { businessId } = req.params
  const { name, input, ctx } = req.body
  const config = await getOrgConfig(businessId)
  const result = await dispatchTool({ name, input, ctx: { ...ctx, businessId, plan: config.plan ?? 'free' } })
  res.json(result)
})

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.businessApi = onRequest(app)
