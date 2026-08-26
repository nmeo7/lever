const FUNCTIONS_BASE_URL =
	import.meta.env.VITE_FUNCTIONS_BASE_URL ??
	(import.meta.env.VITE_USE_EMULATORS === 'true'
		? `http://127.0.0.1:5001/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/us-central1`
		: `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net`)

export const sendChatMessage = async ({ message, imagePaths, history, businessId }) => {
	const response = await fetch(`${FUNCTIONS_BASE_URL}/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message, imagePaths, history, businessId }),
	})

	const data = await response.json()
	if (!response.ok) throw new Error(data.error ?? 'Failed to get a reply')

	return data.reply
}

export const uploadChatImage = async ({ dataUrl, businessId }) => {
	const response = await fetch(`${FUNCTIONS_BASE_URL}/chat/upload-image`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dataUrl, businessId }),
	})

	const data = await response.json()
	if (!response.ok) throw new Error(data.error ?? 'Failed to upload image')

	return data.path
}
