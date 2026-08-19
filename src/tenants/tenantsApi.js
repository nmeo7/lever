import { callAuthedFunction } from '@/util/functionsClient'

export const fetchTenants = async () => {
	const { tenants } = await callAuthedFunction('tenants')
	return tenants
}

export const createTenant = async (tenant) => {
	return callAuthedFunction('tenants', { method: 'POST', body: tenant })
}
