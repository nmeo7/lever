const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { db } = require('../util/data')
const { requireAuth } = require('../util/auth')
const { generateJsonCompletion } = require('../ai')

const MEMORY_SYSTEM_PROMPT =
  'Extract a concise memory fact from the following customer interaction context. ' +
  'Return JSON: { memory: string, importance: "low"|"medium"|"high" }'

exports.generateMemory = onCall({ cors: true, secrets: ['JWT_SECRET'] }, async ({ data, rawRequest }) => {
  const token = rawRequest.headers.authorization?.replace('Bearer ', '')
  await requireAuth(token)

  const { customerId, context } = data ?? {}
  if (!customerId || !context) {
    throw new HttpsError('invalid-argument', 'customerId and context required')
  }

  const accountDoc = await db.collection('erp-accounts').doc('default').get()
  const account = accountDoc.data()?.config
  const openAIKey = account?.openai_api_key
  if (!openAIKey) throw new HttpsError('failed-precondition', 'OpenAI key not configured')

  const result = await generateJsonCompletion({
    apiKey: openAIKey,
    model: account?.openai_model,
    systemPrompt: MEMORY_SYSTEM_PROMPT,
    message: context,
  })

  await db.collection('erp-customers').doc(customerId).collection('memories').add({
    memory: result.memory,
    importance: result.importance,
    source: 'ai',
    embedding: [],
    createdAt: new Date().toISOString(),
  })

  return result
})
