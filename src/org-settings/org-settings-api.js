import { callAuthedFunction } from '@/util/functionsClient'

export const fetchCompanyContact = async () => {
	return callAuthedFunction('orgSettings', { path: '/contact' })
}

export const updateCompanyContact = async ({ whatsapp, momo }) => {
	return callAuthedFunction('orgSettings', { method: 'PATCH', path: '/contact', body: { whatsapp, momo } })
}
