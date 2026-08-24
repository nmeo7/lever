import { callAuthedFunction } from '@/util/functionsClient'

export const fetchCustomers = async () => {
	const { customers } = await callAuthedFunction('customers')
	return customers
}

export const createCustomer = async (customer) => {
	return callAuthedFunction('customers', { method: 'POST', body: customer })
}

export const batchUpsertCustomers = async (rows) => {
	return callAuthedFunction('customers', { method: 'POST', path: '/batch', body: { rows } })
}

export const CUSTOMER_STATUSES = [
	{ value: 'lead', label: 'Lead' },
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
	{ value: 'blocked', label: 'Blocked' },
]
