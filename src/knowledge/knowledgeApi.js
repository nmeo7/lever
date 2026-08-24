import { callAuthedFunction } from '@/util/functionsClient'

export const fetchKnowledgeEntries = async () => {
	const { knowledge } = await callAuthedFunction('knowledge')
	return knowledge
}

export const createKnowledgeEntry = async (entry) => {
	return callAuthedFunction('knowledge', { method: 'POST', body: entry })
}

export const updateKnowledgeEntry = async ({ id, ...entry }) => {
	return callAuthedFunction('knowledge', { method: 'PATCH', path: `/${id}`, body: entry })
}

export const deleteKnowledgeEntry = async (id) => {
	return callAuthedFunction('knowledge', { method: 'DELETE', path: `/${id}` })
}

export const searchKnowledgeEntries = async (query) => {
	const { knowledge } = await callAuthedFunction('knowledge', {
		method: 'POST',
		path: '/search',
		body: { query },
	})
	return knowledge
}
