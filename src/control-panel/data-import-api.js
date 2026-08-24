import { callAuthedFunction } from '@/util/functionsClient'

export const fetchImportableCollections = async () => {
	const { collections } = await callAuthedFunction('dataImport', { path: '/collections' })
	return collections
}

export const importRows = async ({ collection, rows }) => {
	return callAuthedFunction('dataImport', { method: 'POST', body: { collection, rows } })
}
