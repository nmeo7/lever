import { callAuthedFunction } from '@/util/functionsClient'

export const fetchPeople = async () => {
	const { people } = await callAuthedFunction('people')
	return people
}

export const fetchRoles = async () => {
	const { roles } = await callAuthedFunction('people', { path: '/roles' })
	return roles
}

export const createPerson = async (person) => {
	return callAuthedFunction('people', { method: 'POST', body: person })
}

export const updatePerson = async ({ id, ...person }) => {
	return callAuthedFunction('people', { method: 'PATCH', path: `/${id}`, body: person })
}
