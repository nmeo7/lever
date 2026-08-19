import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrg } from '@/org/useOrg'
import ChatThread from '@/chat/ChatThread'
import { useChatConversation } from '@/chat/useChatConversation'

const StorefrontChatPage = () => {
	const { orgSlug } = useParams()
	const navigate = useNavigate()
	const { data: org } = useOrg(orgSlug)
	const [searchParams, setSearchParams] = useSearchParams()
	const { messages, isPending, submitMessage, startWithMessage } = useChatConversation({ businessId: org?.id })

	useEffect(() => {
		const initialQuery = searchParams.get('q')
		if (initialQuery) {
			startWithMessage(initialQuery)
			setSearchParams({}, { replace: true })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	return (
		<div className='flex flex-col gap-4 h-[calc(100vh-2rem)]'>
			<button
				onClick={() => navigate(`/${orgSlug}`)}
				className='flex items-center gap-1 text-xs transition-opacity opacity-60 hover:opacity-100 self-start'
				style={{ color: 'var(--color-text)' }}>
				<ArrowLeft size={14} strokeWidth={1.75} />
				Back to store
			</button>
			<p className='text-lg font-bold' style={{ color: 'var(--color-text)' }}>
				Ask {org?.name ?? 'us'}
			</p>
			<div className='flex-1 min-h-0'>
				<ChatThread
					messages={messages}
					isPending={isPending}
					onSubmit={submitMessage}
					placeholder='Ask about products, orders...'
				/>
			</div>
		</div>
	)
}

export default StorefrontChatPage
