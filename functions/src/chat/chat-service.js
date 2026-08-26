const { getOrgConfig } = require('../util/get-org-config')
const { getSignedImageUrl } = require('../util/storage')
const ai = require('../ai')
const { buildSystemPrompt } = require('../business-api/system-prompt')
const { getToolsForPlan } = require('../business-api/tools')
const { dispatchTool } = require('../business-api/tool-handlers')

const DEFAULT_BUSINESS_ID = 'default'

const generateChatReply = async ({ message, imagePaths = [], history = [], businessId = DEFAULT_BUSINESS_ID, summary = '' }) => {
  const config = await getOrgConfig(businessId)
  const systemPrompt = await buildSystemPrompt(businessId, summary)
  const plan = config.plan ?? 'free'
  const tools = getToolsForPlan(plan)
  const imageUrls = await Promise.all(imagePaths.map(getSignedImageUrl))

  const reply = await ai.generateAgentCompletion({
    apiKey: config.openai_api_key,
    model: config.openai_model,
    systemPrompt,
    message,
    images: imageUrls,
    history,
    tools,
    executeTool: ({ name, input }) => dispatchTool({ name, input, ctx: { businessId, plan } }),
  })

  return { reply }
}

module.exports = { generateChatReply }
