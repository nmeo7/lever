const { authLogin } = require('./auth/login')
const { generateMemory } = require('./people/generate-memory')
const { triggerWorkflowStep } = require('./workflows/trigger-workflow-step')
const { whatsappWebhook } = require('./chat/whatsapp-provider')
const { businessApi } = require('./business-api/business-api-router')
const { chat } = require('./chat/chat-router')
const { products } = require('./products/products-router')
const { productsOnWriteEmbedding } = require('./products/products-on-write-embedding')
const { payments } = require('./payments/payments-router')
const { paymentsOnWriteEmbedding } = require('./payments/payments-on-write-embedding')
const { orders } = require('./orders/orders-router')
const { inventory } = require('./inventory/inventory-router')
const { documents } = require('./documents/documents-router')
const { documentsOnWriteEmbedding } = require('./documents/documents-on-write-embedding')
const { controlPanel } = require('./control-panel/control-panel-router')

module.exports = {
  authLogin,
  generateMemory,
  triggerWorkflowStep,
  whatsappWebhook,
  businessApi,
  chat,
  products,
  productsOnWriteEmbedding,
  payments,
  paymentsOnWriteEmbedding,
  orders,
  inventory,
  documents,
  documentsOnWriteEmbedding,
  controlPanel,
}
