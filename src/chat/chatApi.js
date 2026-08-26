import { callAuthedFunction } from '@/util/functionsClient'

export const sendChatMessage = async ({ message, attachmentIds, history }) => {
	const { reply } = await callAuthedFunction('chat', { method: 'POST', body: { message, attachmentIds, history } })
	return reply
}

export const uploadChatImage = async ({ dataUrl }) => {
	const { attachmentId } = await callAuthedFunction('chat', { method: 'POST', path: '/upload-image', body: { dataUrl } })
	return attachmentId
}
