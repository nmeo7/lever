const { onRequest } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { getOrgConfig } = require('../util/get-org-config')
const ai = require('../ai')
const { buildSystemPrompt } = require('../business-api/system-prompt')
const { getToolsForPlan } = require('../business-api/tools')
const { dispatchTool } = require('../business-api/tool-handlers')

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'
const BUSINESS_ID = 'default'

const verifyWebhook = ({ verifyToken, mode, token, challenge }) => {
  if (mode === 'subscribe' && token === verifyToken) return challenge
  return null
}

const parseInboundMessage = (body) => {
  const entry = body?.entry?.[0]
  const change = entry?.changes?.[0]?.value
  const message = change?.messages?.[0]
  if (!message || message.type !== 'text') return null

  return {
    from: message.from,
    content: message.text.body,
    waMessageId: message.id,
    timestamp: message.timestamp,
  }
}

const sendMessage = async ({ accessToken, phoneNumberId, to, content }) => {
  if (!accessToken || !phoneNumberId) throw new Error('WhatsApp credentials not configured')

  const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: content },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`WhatsApp send failed: ${error}`)
  }

  return response.json()
}

const saveMessages = async (customerPhone, newMessages) => {
  const customersSnap = await db.collection('erp-customers').where('phone', '==', customerPhone).limit(1).get()
  const customerId = customersSnap.docs[0]?.id ?? customerPhone

  const conversationRef = db.collection('erp-conversations').doc(customerId)
  const conversationSnap = await conversationRef.get()
  const existingMessages = conversationSnap.data()?.messages ?? []
  const messages = [...existingMessages, ...newMessages]

  await conversationRef.set(
    { messages, lastMessage: newMessages[newMessages.length - 1].content },
    { merge: true }
  )
}

const whatsappWebhook = onRequest({ cors: true }, async (req, res) => {
  if (req.method === 'GET') {
    const config = await getOrgConfig()
    const challenge = verifyWebhook({
      verifyToken: config.whatsapp_verify_token,
      mode: req.query['hub.mode'],
      token: req.query['hub.verify_token'],
      challenge: req.query['hub.challenge'],
    })
    if (!challenge) return res.sendStatus(403)
    return res.status(200).send(challenge)
  }

  const inboundMessage = parseInboundMessage(req.body)
  if (!inboundMessage) return res.sendStatus(200)

  res.sendStatus(200)

  try {
    const config = await getOrgConfig()
    const systemPrompt = await buildSystemPrompt(BUSINESS_ID, '')
    const tools = getToolsForPlan(config.plan ?? 'free')

    const replyContent = await ai.generateAgentCompletion({
      apiKey: config.openai_api_key,
      model: config.openai_model,
      systemPrompt,
      message: inboundMessage.content,
      tools,
      executeTool: ({ name, input }) =>
        dispatchTool({ name, input, ctx: { businessId: BUSINESS_ID, plan: config.plan ?? 'free' } }),
    })

    await sendMessage({
      accessToken: config.whatsapp_access_token,
      phoneNumberId: config.whatsapp_phone_number_id,
      to: inboundMessage.from,
      content: replyContent,
    })

    await saveMessages(inboundMessage.from, [
      {
        id: inboundMessage.waMessageId,
        type: 'received',
        content: inboundMessage.content,
        attachments: [],
        timestamp: new Date().toISOString(),
      },
      {
        id: `${inboundMessage.waMessageId}-reply`,
        type: 'sent',
        content: replyContent,
        attachments: [],
        timestamp: new Date().toISOString(),
      },
    ])
  } catch (err) {
    console.error('Failed to process WhatsApp message', { from: inboundMessage.from, error: err.message })
  }
})

module.exports = { verifyWebhook, parseInboundMessage, sendMessage, whatsappWebhook }
