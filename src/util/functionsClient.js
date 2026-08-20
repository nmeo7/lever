import { useAuthStore } from '@/auth/store'

const FUNCTIONS_BASE_URL =
	import.meta.env.VITE_FUNCTIONS_BASE_URL ??
	(import.meta.env.VITE_USE_EMULATORS === 'true'
		? `http://127.0.0.1:5001/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/us-central1`
		: `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`)

export const callAuthedFunction = async (functionName, { method = 'GET', path = '', body } = {}) => {
	const { token, activeCompanyId } = useAuthStore.getState()

	const url = new URL(`${FUNCTIONS_BASE_URL}/${functionName}${path}`)
	if (method === 'GET' && activeCompanyId) url.searchParams.set('companyId', activeCompanyId)

	const resolvedBody =
		method === 'GET' ? undefined : { companyId: activeCompanyId, ...body }

	const response = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		...(resolvedBody ? { body: JSON.stringify(resolvedBody) } : {}),
	})

	const data = await response.json()
	if (!response.ok) throw new Error(data.error ?? 'Request failed')

	return data
}
