const { onWriteEmbeddingTrigger } = require('../util/data')

const buildEmbeddingText = (payment) =>
  [payment.type, payment.category, payment.notes].filter(Boolean).join(' — ')

exports.paymentsOnWriteEmbedding = onWriteEmbeddingTrigger({
  collectionName: 'erp-payments',
  idParam: 'paymentId',
  buildEmbeddingText,
})
