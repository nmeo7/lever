const { authLogin } = require('./auth/login')
const { generateMemory } = require('./people/generateMemory')
const { triggerWorkflowStep } = require('./workflows/triggerWorkflowStep')
const { whatsappWebhook } = require('./chat/whatsappProvider')
const { businessApi } = require('./businessApi/router')
const { chat } = require('./chat/router')
const { products } = require('./products/router')
const { productsOnWriteEmbedding } = require('./products/onWriteEmbedding')
const { payments } = require('./payments/router')
const { paymentsOnWriteEmbedding } = require('./payments/onWriteEmbedding')
const { orders } = require('./orders/router')
const { inventory } = require('./inventory/router')
const { documents } = require('./documents/router')
const { documentsOnWriteEmbedding } = require('./documents/onWriteEmbedding')
const { tenants } = require('./tenants/router')

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
  tenants,
}
