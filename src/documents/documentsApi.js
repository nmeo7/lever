import { callAuthedFunction } from '@/util/functionsClient'

export const fetchDocuments = async () => {
	const { documents } = await callAuthedFunction('documents')
	return documents
}

export const createDocument = async (document) => {
	return callAuthedFunction('documents', { method: 'POST', body: document })
}

export const updateDocument = async ({ id, ...document }) => {
	return callAuthedFunction('documents', { method: 'PATCH', path: `/${id}`, body: document })
}

export const deleteDocument = async (id) => {
	return callAuthedFunction('documents', { method: 'DELETE', path: `/${id}` })
}

export const searchDocuments = async (query) => {
	const { documents } = await callAuthedFunction('documents', {
		method: 'POST',
		path: '/search',
		body: { query },
	})
	return documents
}
