const TOOL_DEFINITIONS = {
  lookupCustomer: {
    description: 'Look up a customer by phone number',
    input_schema: {
      type: 'object',
      properties: { phone: { type: 'string' } },
      required: ['phone'],
    },
  },
  checkInventory: {
    description: 'Check available quantity for a product by name',
    input_schema: {
      type: 'object',
      properties: { productName: { type: 'string' } },
      required: ['productName'],
    },
  },
  scheduleAppointment: {
    description: 'Schedule an appointment for a customer',
    input_schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        scheduledDate: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['customerId', 'scheduledDate'],
    },
  },
  placeOrder: {
    description: 'Place a sales order for a customer with one or more products',
    input_schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              quantity: { type: 'number' },
            },
            required: ['productId', 'quantity'],
          },
        },
        notes: { type: 'string' },
      },
      required: ['items'],
    },
  },
  recordPayment: {
    description: 'Record a payment received against an existing order',
    input_schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        amount: { type: 'number' },
        method: { type: 'string', enum: ['cash', 'bank', 'card', 'mobileMoney', 'cheque', 'other'] },
        reference: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['orderId', 'amount', 'method'],
    },
  },
}

const PLAN_TOOLS = {
  free: ['lookupCustomer', 'checkInventory'],
  premium: ['lookupCustomer', 'checkInventory', 'scheduleAppointment', 'placeOrder', 'recordPayment'],
}

const getToolsForPlan = (plan) => {
  const toolNames = PLAN_TOOLS[plan] ?? PLAN_TOOLS.free
  return toolNames.map((name) => ({ name, ...TOOL_DEFINITIONS[name] }))
}

module.exports = { getToolsForPlan, PLAN_TOOLS, TOOL_DEFINITIONS }
