const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { generateChatReply } = require('./chat-service')
const { uploadChatImage } = require('../util/storage')

const DEFAULT_BUSINESS_ID = 'default'

const router = express.Router()

router.post('/', async (req, res) => {
  const { message, imagePaths, history, businessId, summary } = req.body ?? {}

  if (!message) return res.status(400).json({ error: 'message is required' })

  try {
    const result = await generateChatReply({ message, imagePaths, history, businessId, summary })
    res.status(200).json(result)
  } catch (err) {
    console.error('Failed to generate AI chat reply', { error: err.message })
    res.status(500).json({ error: err.message })
  }
})

router.post('/upload-image', async (req, res) => {
  const { dataUrl, businessId = DEFAULT_BUSINESS_ID } = req.body ?? {}

  if (!dataUrl) return res.status(400).json({ error: 'dataUrl is required' })

  try {
    const path = await uploadChatImage({ businessId, dataUrl })
    res.status(200).json({ path })
  } catch (err) {
    console.error('Failed to upload chat image', { error: err.message })
    res.status(500).json({ error: err.message })
  }
})

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))
app.use('/', router)

exports.chat = onRequest(app)
