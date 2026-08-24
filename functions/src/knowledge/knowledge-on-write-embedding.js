const { onWriteEmbeddingTrigger } = require('../util/data')
const { decryptFields } = require('../util/field-encryption')
const { ENCRYPTED_FIELDS } = require('./knowledge-service')

const buildEmbeddingText = (entry) => {
  const decrypted = decryptFields(entry, ENCRYPTED_FIELDS)
  return [decrypted.title, decrypted.type, decrypted.content].filter(Boolean).join(' — ')
}

exports.knowledgeOnWriteEmbedding = onWriteEmbeddingTrigger({
  collectionName: 'erp-knowledge',
  idParam: 'knowledgeId',
  buildEmbeddingText,
})
