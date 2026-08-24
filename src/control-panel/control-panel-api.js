import { callAuthedFunction } from '@/util/functionsClient'

export const fetchGroups = async () => {
	const { groups } = await callAuthedFunction('controlPanel')
	return groups
}

export const createGroup = async (group) => {
	return callAuthedFunction('controlPanel', { method: 'POST', body: group })
}

export const fetchCompaniesForGroup = async (groupId) => {
	const { companies } = await callAuthedFunction('controlPanel', { path: `/${groupId}/companies` })
	return companies
}

export const createCompany = async ({ groupId, ...company }) => {
	const path = groupId ? `/${groupId}/companies` : '/companies'
	return callAuthedFunction('controlPanel', { method: 'POST', path, body: company })
}

export const createCompanyPerson = async ({ companySlug, ...person }) => {
	return callAuthedFunction('controlPanel', { method: 'POST', path: `/companies/${companySlug}/people`, body: person })
}

export const batchUpsert = async ({ entity, rows }) => {
	return callAuthedFunction('controlPanel', { method: 'POST', path: '/batch', body: { entity, rows } })
}
