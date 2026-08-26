const { getOrgConfig } = require('../util/get-org-config')

const buildSystemPrompt = async (businessId, summary) => {
  const config = await getOrgConfig(businessId)

  const labels = config.labels ?? {}
  const businessName = config.businessName ?? 'this business'

  return [
    `You are a helpful assistant replying to customer messages on behalf of ${businessName}.`,
    `Refer to customers as "${labels.customers ?? 'customers'}" and orders as "${labels.orders ?? 'orders'}".`,
    'Use the available tools to look up real information before answering questions about availability, orders, or appointments.',
    'Keep replies concise and friendly.',
    summary ? `Conversation summary so far: ${summary}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

module.exports = { buildSystemPrompt }
