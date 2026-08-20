const { db } = require('../util/data')
const { PLAN_TOOLS } = require('./tools')
const { createOrder } = require('../orders/orders-service')
const { recordOrderPayment } = require('../payments/payments-service')

const lookupCustomer = async ({ input, ctx }) => {
  const snap = await db
    .collection('erp-customers')
    .where('companyId', '==', ctx.businessId)
    .where('phone', '==', input.phone)
    .limit(1)
    .get()

  if (snap.empty) return { found: false }

  const customer = snap.docs[0].data()
  return {
    found: true,
    customerId: snap.docs[0].id,
    name: customer.name,
    status: customer.status,
    summary: customer.summary,
  }
}

const checkInventory = async ({ input, ctx }) => {
  const productSnap = await db
    .collection('erp-products')
    .where('companyId', '==', ctx.businessId)
    .where('name', '==', input.productName)
    .limit(1)
    .get()

  if (productSnap.empty) return { found: false }

  const productId = productSnap.docs[0].id
  const inventorySnap = await db
    .collection('erp-inventory')
    .where('companyId', '==', ctx.businessId)
    .where('productId', '==', productId)
    .get()

  const quantityOnHand = inventorySnap.docs.reduce((total, doc) => total + (doc.data().quantityOnHand ?? 0), 0)

  return { found: true, productId, quantityOnHand }
}

const scheduleAppointment = async ({ input, ctx }) => {
  const jobRef = await db.collection('erp-jobs').add({
    companyId: ctx.businessId,
    relatedEntity: 'customer',
    relatedId: input.customerId,
    dueDate: input.scheduledDate,
    notes: input.notes ?? '',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  return { jobId: jobRef.id, status: 'pending' }
}

const placeOrder = async ({ input, ctx }) =>
  createOrder(ctx.businessId, {
    customerId: input.customerId,
    items: input.items,
    notes: input.notes,
  })

const recordPayment = async ({ input, ctx }) =>
  recordOrderPayment(ctx.businessId, {
    orderId: input.orderId,
    amount: input.amount,
    method: input.method,
    reference: input.reference,
    notes: input.notes,
  })

const TOOL_HANDLERS = {
  lookupCustomer,
  checkInventory,
  scheduleAppointment,
  placeOrder,
  recordPayment,
}

const dispatchTool = async ({ name, input, ctx }) => {
  const allowedTools = PLAN_TOOLS[ctx.plan ?? 'free'] ?? PLAN_TOOLS.free
  if (!allowedTools.includes(name)) {
    throw new Error(`Tool "${name}" not available on plan "${ctx.plan ?? 'free'}"`)
  }

  const handler = TOOL_HANDLERS[name]
  if (!handler) throw new Error(`Unknown tool "${name}"`)

  return handler({ input, ctx })
}

module.exports = { dispatchTool }
