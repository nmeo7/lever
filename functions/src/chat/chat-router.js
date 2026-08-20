const express = require('express')
const cors = require('cors')
const { onRequest } = require('firebase-functions/v2/https')
const { generateChatReply } = require('./chat-service')

const router = express.Router()

router.post('/', async (req, res) => {
  const { message, history, businessId, summary } = req.body ?? {}

  if (!message) return res.status(400).json({ error: 'message is required' })

  try {
    const result = await generateChatReply({ message, history, businessId, summary })
    res.status(200).json(result)
  } catch (err) {
    console.error('Failed to generate AI chat reply', { error: err.message })
    res.status(500).json({ error: err.message })
  }
})

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())
app.use('/', router)

exports.chat = onRequest(app)
