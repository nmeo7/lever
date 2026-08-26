const { getOrgConfig } = require('../util/get-org-config')
const { downloadAttachmentAsDataUrl } = require('../util/storage')
const ai = require('../ai')
const { buildSystemPrompt } = require('../business-api/system-prompt')
const { getToolsForPlan } = require('../business-api/tools')
const { dispatchTool } = require('../business-api/tool-handlers')

const generateChatReply = async ({ message, attachmentIds = [], history = [], companyId, summary = '' }) => {
  const config = await getOrgConfig(companyId)
  const systemPrompt = await buildSystemPrompt(companyId, summary)
  const plan = config.plan ?? 'free'
  const tools = getToolsForPlan(plan)
  const images = await Promise.all(attachmentIds.map((id) => downloadAttachmentAsDataUrl(id, companyId)))

  const reply = await ai.generateAgentCompletion({
    apiKey: config.openai_api_key,
    model: config.openai_model,
    systemPrompt,
    message,
    images,
    history,
    tools,
    executeTool: ({ name, input }) => dispatchTool({ name, input, ctx: { businessId: companyId, plan } }),
  })

  return { reply }
}

module.exports = { generateChatReply }
