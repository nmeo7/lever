import { callAuthedFunction } from '@/util/functionsClient'

export const fetchSuppliers = async () => {
	const { suppliers } = await callAuthedFunction('suppliers')
	return suppliers
}

export const createSupplier = async (supplier) => {
	return callAuthedFunction('suppliers', { method: 'POST', body: supplier })
}

export const batchUpsertSuppliers = async (rows) => {
	return callAuthedFunction('suppliers', { method: 'POST', path: '/batch', body: { rows } })
}
