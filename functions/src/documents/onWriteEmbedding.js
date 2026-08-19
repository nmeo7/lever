const { onWriteEmbeddingTrigger } = require('../util/data')

const buildEmbeddingText = (document) =>
  [document.title, document.type, document.content].filter(Boolean).join(' — ')

exports.documentsOnWriteEmbedding = onWriteEmbeddingTrigger({
  collectionName: 'erp-documents',
  idParam: 'documentId',
  buildEmbeddingText,
})
