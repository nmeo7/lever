import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '@/util/components/PageShell'
import ChatThread from './ChatThread'
import { useChatConversation } from './useChatConversation'

const ChatPage = () => {
	const { t } = useTranslation()
	const [searchParams, setSearchParams] = useSearchParams()
	const { messages, isPending, submitMessage, startWithMessage } = useChatConversation()

	useEffect(() => {
		const initialQuery = searchParams.get('q')
		if (initialQuery) {
			startWithMessage(initialQuery)
			setSearchParams({}, { replace: true })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	return (
		<PageShell title={t('chat.title', 'Chat')}>
			<div className='h-[calc(100vh-160px)]'>
				<ChatThread messages={messages} isPending={isPending} onSubmit={submitMessage} />
			</div>
		</PageShell>
	)
}

export default ChatPage
