import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'

const ChatBubble = ({ role, content }) => (
	<div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
		<div
			className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${role === 'user' ? '' : 'border'}`}
			style={
				role === 'user'
					? { background: 'var(--color-primary)', color: 'var(--color-surface)' }
					: {
							background: 'var(--color-surface)',
							borderColor: 'var(--color-border)',
							color: 'var(--color-text)',
						}
			}>
			{content}
		</div>
	</div>
)

const ChatThread = ({ messages, isPending, onSubmit, placeholder, emptyHint }) => {
	const { t } = useTranslation()
	const [input, setInput] = useState('')
	const bottomRef = useRef(null)
	const resolvedPlaceholder = placeholder ?? t('chat.placeholder', 'Ask anything...')
	const resolvedEmptyHint = emptyHint ?? t('chat.emptyHint', 'Ask anything to get started.')

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isPending])

	const submit = () => {
		if (!input.trim()) return
		onSubmit(input)
		setInput('')
	}

	const handleKeyDown = e => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			submit()
		}
	}

	return (
		<div className='flex flex-col h-full min-h-0'>
			<div className='flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pb-4'>
				{messages.length === 0 && (
					<p className='text-sm text-center mt-16' style={{ color: 'var(--color-muted)' }}>
						{resolvedEmptyHint}
					</p>
				)}
				{messages.map((message, index) => (
					<ChatBubble key={index} role={message.role} content={message.content} />
				))}
				{isPending && (
					<div className='flex justify-start'>
						<div
							className='rounded-2xl px-4 py-2.5 text-sm border'
							style={{
								background: 'var(--color-surface)',
								borderColor: 'var(--color-border)',
								color: 'var(--color-muted)',
							}}>
							{t('chat.thinking', 'Thinking…')}
						</div>
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			<div
				className='neu-raised flex items-end gap-2 rounded-2xl p-2'
				style={{ background: 'var(--neu-bg)' }}>
				<textarea
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					rows={1}
					placeholder={resolvedPlaceholder}
					className='flex-1 resize-none outline-none text-sm bg-transparent px-2 py-2'
					style={{ color: 'var(--color-text)' }}
				/>
				<button
					onClick={submit}
					disabled={isPending || !input.trim()}
					className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40'
					style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
					<Send size={16} strokeWidth={1.75} />
				</button>
			</div>
		</div>
	)
}

export default ChatThread
