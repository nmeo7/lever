import { useAuthStore } from '@/auth/store'

const FUNCTIONS_BASE_URL =
	import.meta.env.VITE_FUNCTIONS_BASE_URL ??
	(import.meta.env.VITE_USE_EMULATORS === 'true'
		? `http://127.0.0.1:5001/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/us-central1`
		: `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`)

export const callAuthedFunction = async (functionName, { method = 'GET', path = '', body } = {}) => {
	const token = useAuthStore.getState().token

	const response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}${path}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	})

	const data = await response.json()
	if (!response.ok) throw new Error(data.error ?? 'Request failed')

	return data
}
