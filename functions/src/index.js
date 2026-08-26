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
const { knowledge } = require('./knowledge/knowledge-router')
const { knowledgeOnWriteEmbedding } = require('./knowledge/knowledge-on-write-embedding')
const { controlPanel } = require('./control-panel/control-panel-router')
const { orgSettings } = require('./org-settings/org-settings-router')
const { dataImport } = require('./data-import/data-import-router')
const { people } = require('./people/people-router')
const { customers } = require('./customers/customers-router')
const { suppliers } = require('./suppliers/suppliers-router')
const { categories } = require('./categories/categories-router')
const { taxonomy } = require('./taxonomy/taxonomy-router')
const { locations } = require('./locations/locations-router')
const { resources } = require('./resources/resources-router')
const { plans } = require('./plans/plans-router')
const { recurringTransactions } = require('./recurring-transactions/recurring-transactions-router')

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
  knowledge,
  knowledgeOnWriteEmbedding,
  controlPanel,
  orgSettings,
  dataImport,
  people,
  customers,
  suppliers,
  categories,
  taxonomy,
  locations,
  resources,
  plans,
  recurringTransactions,
}
