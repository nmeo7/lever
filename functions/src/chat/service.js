const { getOrgConfig } = require('../util/getOrgConfig')
const ai = require('../ai')
const { buildSystemPrompt } = require('../businessApi/systemPrompt')
const { getToolsForPlan } = require('../businessApi/tools')
const { dispatchTool } = require('../businessApi/toolHandlers')

const DEFAULT_BUSINESS_ID = 'default'

const generateChatReply = async ({ message, history = [], businessId = DEFAULT_BUSINESS_ID, summary = '' }) => {
  const config = await getOrgConfig(businessId)
  const systemPrompt = await buildSystemPrompt(businessId, summary)
  const plan = config.plan ?? 'free'
  const tools = getToolsForPlan(plan)

  const reply = await ai.generateAgentCompletion({
    apiKey: config.openai_api_key,
    model: config.openai_model,
    systemPrompt,
    message,
    history,
    tools,
    executeTool: ({ name, input }) => dispatchTool({ name, input, ctx: { businessId, plan } }),
  })

  return { reply }
}

module.exports = { generateChatReply }
