const { onWriteEmbeddingTrigger } = require('../util/data')

const buildEmbeddingText = (product) =>
  [product.name, product.productType, product.description].filter(Boolean).join(' — ')

exports.productsOnWriteEmbedding = onWriteEmbeddingTrigger({
  collectionName: 'erp-products',
  idParam: 'productId',
  buildEmbeddingText,
})
