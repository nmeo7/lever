import { callAuthedFunction } from '@/util/functionsClient'

export const fetchResources = async () => {
	const { resources } = await callAuthedFunction('resources')
	return resources
}

export const createResource = async (resource) => {
	return callAuthedFunction('resources', { method: 'POST', body: resource })
}

export const batchUpsertResources = async (rows) => {
	return callAuthedFunction('resources', { method: 'POST', path: '/batch', body: { rows } })
}

export const RESOURCE_CONDITIONS = [
	{ value: 'excellent', label: 'Excellent' },
	{ value: 'good', label: 'Good' },
	{ value: 'fair', label: 'Fair' },
	{ value: 'poor', label: 'Poor' },
	{ value: 'damaged', label: 'Damaged' },
]

export const RESOURCE_STATUSES = [
	{ value: 'available', label: 'Available' },
	{ value: 'assigned', label: 'Assigned' },
	{ value: 'maintenance', label: 'Maintenance' },
	{ value: 'retired', label: 'Retired' },
]

export const RESOURCE_OWNERSHIPS = [
	{ value: 'owned', label: 'Owned' },
	{ value: 'rented', label: 'Rented' },
	{ value: 'leased', label: 'Leased' },
	{ value: 'borrowed', label: 'Borrowed' },
]
