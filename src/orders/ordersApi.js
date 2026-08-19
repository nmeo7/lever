import { callAuthedFunction } from '@/util/functionsClient'

export const fetchOrders = async () => {
	const { orders } = await callAuthedFunction('orders')
	return orders
}

export const createOrder = async (order) => {
	return callAuthedFunction('orders', { method: 'POST', body: order })
}

export const placeStorefrontOrder = async ({ orgId, ...order }) => {
	return callAuthedFunction('orders', { method: 'POST', body: { orgId, ...order } })
}

export const recordOrderPayment = async (payment) => {
	return callAuthedFunction('payments', { method: 'POST', path: '/receive', body: payment })
}

export const ORDER_STATUSES = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'confirmed', label: 'Confirmed' },
	{ value: 'processing', label: 'Processing' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
]

export const PAYMENT_STATUSES = [
	{ value: 'unpaid', label: 'Unpaid' },
	{ value: 'partial', label: 'Partial' },
	{ value: 'paid', label: 'Paid' },
	{ value: 'refunded', label: 'Refunded' },
]
