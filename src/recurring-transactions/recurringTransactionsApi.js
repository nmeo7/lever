import { callAuthedFunction } from '@/util/functionsClient'

export const fetchRecurringTransactions = async () => {
	const { recurringTransactions } = await callAuthedFunction('recurringTransactions')
	return recurringTransactions
}

export const createRecurringTransaction = async (recurringTransaction) => {
	return callAuthedFunction('recurringTransactions', { method: 'POST', body: recurringTransaction })
}

export const batchUpsertRecurringTransactions = async (rows) => {
	return callAuthedFunction('recurringTransactions', { method: 'POST', path: '/batch', body: { rows } })
}

export const RECURRING_TRANSACTION_TYPES = [
	{ value: 'incoming', label: 'Incoming' },
	{ value: 'outgoing', label: 'Outgoing' },
]

export const RECURRING_TRANSACTION_FREQUENCIES = [
	{ value: 'daily', label: 'Daily' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'quarterly', label: 'Quarterly' },
	{ value: 'yearly', label: 'Yearly' },
	{ value: 'custom', label: 'Custom' },
]

export const RECURRING_TRANSACTION_STATUSES = [
	{ value: 'active', label: 'Active' },
	{ value: 'paused', label: 'Paused' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'cancelled', label: 'Cancelled' },
]
