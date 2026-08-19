import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendChatMessage } from './chatApi'

const toHistory = messages =>
	messages.map(({ role, content }) => ({
		type: role === 'user' ? 'sent' : 'received',
		content,
	}))

export const useChatConversation = ({ businessId } = {}) => {
	const [messages, setMessages] = useState([])
	const startedRef = useRef(false)

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: ({ message, history }) => sendChatMessage({ message, history, businessId }),
		onSuccess: reply => {
			setMessages(prev => [...prev, { role: 'assistant', content: reply }])
		},
		onError: error => {
			setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }])
		},
	})

	const submitMessage = text => {
		const trimmed = text.trim()
		if (!trimmed || isPending) return

		const history = toHistory(messages)
		setMessages(prev => [...prev, { role: 'user', content: trimmed }])
		sendMessage({ message: trimmed, history })
	}

	const startWithMessage = text => {
		if (startedRef.current) return
		startedRef.current = true
		submitMessage(text)
	}

	return { messages, isPending, submitMessage, startWithMessage }
}
