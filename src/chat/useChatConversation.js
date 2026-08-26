import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendChatMessage, uploadChatImage } from './chatApi'

const toHistory = messages =>
	messages.map(({ role, content }) => ({
		type: role === 'user' ? 'sent' : 'received',
		content,
	}))

const fileToDataUrl = file =>
	new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})

export const useChatConversation = ({ businessId } = {}) => {
	const [messages, setMessages] = useState([])
	const startedRef = useRef(false)

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: async ({ message, history, imageFiles = [] }) => {
			const imagePaths = await Promise.all(
				imageFiles.map(async file => uploadChatImage({ dataUrl: await fileToDataUrl(file), businessId })),
			)
			return sendChatMessage({ message, imagePaths, history, businessId })
		},
		onSuccess: reply => {
			setMessages(prev => [...prev, { role: 'assistant', content: reply }])
		},
		onError: error => {
			setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }])
		},
	})

	const submitMessage = (text, imageFiles = []) => {
		const trimmed = text.trim()
		if ((!trimmed && imageFiles.length === 0) || isPending) return

		const history = toHistory(messages)
		setMessages(prev => [...prev, { role: 'user', content: trimmed, imageFiles }])
		sendMessage({ message: trimmed, history, imageFiles })
	}

	const startWithMessage = text => {
		if (startedRef.current) return
		startedRef.current = true
		submitMessage(text)
	}

	return { messages, isPending, submitMessage, startWithMessage }
}
