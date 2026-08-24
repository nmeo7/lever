import { callAuthedFunction } from '@/util/functionsClient'

export const fetchLocations = async () => {
	const { locations } = await callAuthedFunction('locations')
	return locations
}

export const createLocation = async (location) => {
	return callAuthedFunction('locations', { method: 'POST', body: location })
}

export const batchUpsertLocations = async (rows) => {
	return callAuthedFunction('locations', { method: 'POST', path: '/batch', body: { rows } })
}

export const LOCATION_TYPES = [
	{ value: 'warehouse', label: 'Warehouse' },
	{ value: 'office', label: 'Office' },
	{ value: 'store', label: 'Store' },
	{ value: 'customerSite', label: 'Customer site' },
	{ value: 'supplierSite', label: 'Supplier site' },
	{ value: 'other', label: 'Other' },
]

export const LOCATION_STATUSES = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
]
