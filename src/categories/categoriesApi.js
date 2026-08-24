import { callAuthedFunction } from '@/util/functionsClient'

export const fetchCategories = async () => {
	const { categories } = await callAuthedFunction('categories')
	return categories
}

export const createCategory = async (category) => {
	return callAuthedFunction('categories', { method: 'POST', body: category })
}

export const batchUpsertCategories = async (rows) => {
	return callAuthedFunction('categories', { method: 'POST', path: '/batch', body: { rows } })
}

export const CATEGORY_CLASSIFICATIONS = [
	{ value: 'public', label: 'Public' },
	{ value: 'restricted', label: 'Restricted' },
	{ value: 'confidential', label: 'Confidential' },
]
