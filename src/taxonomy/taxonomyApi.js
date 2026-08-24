import { callAuthedFunction } from '@/util/functionsClient'

export const fetchTaxonomy = async () => {
	const { taxonomy } = await callAuthedFunction('taxonomy')
	return taxonomy
}

export const createTaxonomyEntry = async (entry) => {
	return callAuthedFunction('taxonomy', { method: 'POST', body: entry })
}

export const batchUpsertTaxonomy = async (rows) => {
	return callAuthedFunction('taxonomy', { method: 'POST', path: '/batch', body: { rows } })
}

export const TAXONOMY_KINDS = [
	{ value: 'currency', label: 'Currency' },
	{ value: 'paymentMethod', label: 'Payment method' },
	{ value: 'unit', label: 'Unit' },
	{ value: 'tag', label: 'Tag' },
]
