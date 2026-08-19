import { callAuthedFunction } from '@/util/functionsClient'

export const fetchPayments = async () => {
	const { payments } = await callAuthedFunction('payments')
	return payments
}

export const createPayment = async (payment) => {
	return callAuthedFunction('payments', { method: 'POST', body: payment })
}

export const searchPayments = async (query) => {
	const { payments } = await callAuthedFunction('payments', {
		method: 'POST',
		path: '/search',
		body: { query },
	})
	return payments
}

export const PAYMENT_TYPES = [
	{ value: 'incoming', label: 'Incoming' },
	{ value: 'outgoing', label: 'Outgoing' },
]

export const PAYMENT_CATEGORIES = [
	{ value: 'sale', label: 'Sale' },
	{ value: 'salary', label: 'Salary' },
	{ value: 'tax', label: 'Tax' },
	{ value: 'payable', label: 'Payable' },
	{ value: 'receivable', label: 'Receivable' },
	{ value: 'refund', label: 'Refund' },
	{ value: 'subscription', label: 'Subscription' },
	{ value: 'other', label: 'Other' },
]

export const PAYMENT_METHODS = [
	{ value: 'cash', label: 'Cash' },
	{ value: 'bank', label: 'Bank' },
	{ value: 'card', label: 'Card' },
	{ value: 'mobileMoney', label: 'Mobile Money' },
	{ value: 'cheque', label: 'Cheque' },
	{ value: 'other', label: 'Other' },
]
