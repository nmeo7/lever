const OpenAI = require('openai')

const MAX_TOOL_ROUNDS = 5
const EMBEDDING_MODEL = 'text-embedding-3-small'

const toOpenAiTool = (tool) => ({
  type: 'function',
  function: {
    name: tool.name,
    description: tool.description,
    parameters: tool.input_schema,
  },
})

const toOpenAiHistory = (history) =>
  history.map(({ type, content }) => ({
    role: type === 'sent' ? 'assistant' : 'user',
    content,
  }))

const generateAgentCompletion = async ({ apiKey, model = 'gpt-4o-mini', systemPrompt, message, history = [], tools = [], executeTool }) => {
  if (!apiKey) throw new Error('OpenAI key not configured')

  const openai = new OpenAI({ apiKey })

  const messages = [
    { role: 'system', content: systemPrompt },
    ...toOpenAiHistory(history),
    { role: 'user', content: message },
  ]

  const openAiTools = tools.map(toOpenAiTool)

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      ...(openAiTools.length > 0 ? { tools: openAiTools } : {}),
    })

    const responseMessage = completion.choices[0].message
    const toolCalls = responseMessage.tool_calls ?? []

    if (toolCalls.length === 0) return responseMessage.content

    messages.push(responseMessage)

    for (const toolCall of toolCalls) {
      const input = JSON.parse(toolCall.function.arguments || '{}')
      const result = await executeTool({ name: toolCall.function.name, input })
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      })
    }
  }

  throw new Error('Max tool-call rounds exceeded')
}

const generateCompletion = async ({ apiKey, model = 'gpt-4o-mini', systemPrompt, message, jsonMode = false }) => {
  if (!apiKey) throw new Error('OpenAI key not configured')

  const openai = new OpenAI({ apiKey })

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  })

  return completion.choices[0].message.content
}

const generateJsonCompletion = async (args) => JSON.parse(await generateCompletion({ ...args, jsonMode: true }))

const generateEmbedding = async ({ apiKey, model = EMBEDDING_MODEL, text }) => {
  if (!apiKey) throw new Error('OpenAI key not configured')
  if (!text?.trim()) return null

  const openai = new OpenAI({ apiKey })
  const response = await openai.embeddings.create({ model, input: text })
  return response.data[0].embedding
}

module.exports = { generateAgentCompletion, generateCompletion, generateJsonCompletion, generateEmbedding }
