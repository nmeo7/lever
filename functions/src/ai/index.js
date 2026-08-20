const openaiProvider = require('./openai-provider')

const PROVIDERS = { openai: openaiProvider }
const DEFAULT_PROVIDER = 'openai'

const getProvider = (provider = DEFAULT_PROVIDER) => {
  const resolved = PROVIDERS[provider]
  if (!resolved) throw new Error(`Unknown AI provider: ${provider}`)
  return resolved
}

const generateAgentCompletion = ({ provider, ...rest }) => getProvider(provider).generateAgentCompletion(rest)

const generateCompletion = ({ provider, ...rest }) => getProvider(provider).generateCompletion(rest)

const generateJsonCompletion = ({ provider, ...rest }) => getProvider(provider).generateJsonCompletion(rest)

const generateEmbedding = ({ provider, ...rest }) => getProvider(provider).generateEmbedding(rest)

module.exports = { generateAgentCompletion, generateCompletion, generateJsonCompletion, generateEmbedding }
