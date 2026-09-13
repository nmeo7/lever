import { callAuthedFunction } from '@/util/functionsClient'

export const createCrudApi = (functionName, resourceName) => ({
	fetchAll: async () => {
		const data = await callAuthedFunction(functionName)
		return data[resourceName]
	},

	create: async (item) => callAuthedFunction(functionName, { method: 'POST', body: item }),

	update: async (id, item) => callAuthedFunction(functionName, { method: 'PATCH', path: `/${id}`, body: item }),

	remove: async (id) => callAuthedFunction(functionName, { method: 'DELETE', path: `/${id}` }),

	search: async (query) => {
		const data = await callAuthedFunction(functionName, { method: 'POST', path: '/search', body: { query } })
		return data[resourceName]
	},
})
