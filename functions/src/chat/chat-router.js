const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { asyncRoute, requireAuth, requireCompanyAccessFromBody } = require('../util/async-route')
const { generateChatReply } = require('./chat-service')
const { uploadAttachment } = require('../util/storage')

const router = express.Router()
router.use(requireAuth)

router.post(
  '/',
  requireCompanyAccessFromBody,
  asyncRoute(async (req, res) => {
    const { message, attachmentIds, history, summary } = req.body ?? {}
    if (!message) return res.status(400).json({ error: 'message is required' })

    const result = await generateChatReply({ message, attachmentIds, history, summary, companyId: req.companyId })
    res.status(200).json(result)
  }),
)

router.post(
  '/upload-image',
  requireCompanyAccessFromBody,
  asyncRoute(async (req, res) => {
    const { dataUrl } = req.body ?? {}
    if (!dataUrl) return res.status(400).json({ error: 'dataUrl is required' })

    const attachmentId = await uploadAttachment({ companyId: req.companyId, dataUrl })
    res.status(200).json({ attachmentId })
  }),
)

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use('/', router)

exports.chat = onRequest({ secrets: ['JWT_SECRET'] }, app)
