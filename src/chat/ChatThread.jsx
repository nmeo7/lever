import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Paperclip, X } from 'lucide-react'

const ChatBubble = ({ role, content, imageFiles }) => (
	<div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
		<div
			className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap flex flex-col gap-2 ${role === 'user' ? '' : 'border'}`}
			style={
				role === 'user'
					? { background: 'var(--color-primary)', color: 'var(--color-surface)' }
					: {
							background: 'var(--color-surface)',
							borderColor: 'var(--color-border)',
							color: 'var(--color-text)',
						}
			}>
			{imageFiles?.length > 0 && (
				<div className='flex flex-wrap gap-2'>
					{imageFiles.map((file, index) => (
						<img
							key={index}
							src={URL.createObjectURL(file)}
							alt=''
							className='w-20 h-20 rounded-lg object-cover'
						/>
					))}
				</div>
			)}
			{content}
		</div>
	</div>
)

const ChatThread = ({ messages, isPending, onSubmit, placeholder, emptyHint }) => {
	const { t } = useTranslation()
	const [input, setInput] = useState('')
	const [imageFiles, setImageFiles] = useState([])
	const bottomRef = useRef(null)
	const fileInputRef = useRef(null)
	const resolvedPlaceholder = placeholder ?? t('chat.placeholder', 'Ask anything...')
	const resolvedEmptyHint = emptyHint ?? t('chat.emptyHint', 'Ask anything to get started.')

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages, isPending])

	const submit = () => {
		if (!input.trim() && imageFiles.length === 0) return
		onSubmit(input, imageFiles)
		setInput('')
		setImageFiles([])
	}

	const handleFileSelect = e => {
		const files = Array.from(e.target.files ?? [])
		setImageFiles(prev => [...prev, ...files])
		e.target.value = ''
	}

	const removeImageAt = index => {
		setImageFiles(prev => prev.filter((_, i) => i !== index))
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
					<ChatBubble key={index} role={message.role} content={message.content} imageFiles={message.imageFiles} />
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

			<div className='neu-raised flex flex-col gap-2 rounded-2xl p-2' style={{ background: 'var(--neu-bg)' }}>
				{imageFiles.length > 0 && (
					<div className='flex flex-wrap gap-2 px-1'>
						{imageFiles.map((file, index) => (
							<div key={index} className='relative w-14 h-14'>
								<img src={URL.createObjectURL(file)} alt='' className='w-14 h-14 rounded-lg object-cover' />
								<button
									onClick={() => removeImageAt(index)}
									className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center'
									style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
									<X size={12} strokeWidth={2} />
								</button>
							</div>
						))}
					</div>
				)}
				<div className='flex items-end gap-2'>
					<input ref={fileInputRef} type='file' accept='image/*' multiple hidden onChange={handleFileSelect} />
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={isPending}
						className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40'
						style={{ color: 'var(--color-text)' }}>
						<Paperclip size={16} strokeWidth={1.75} />
					</button>
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
						disabled={isPending || (!input.trim() && imageFiles.length === 0)}
						className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40'
						style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
						<Send size={16} strokeWidth={1.75} />
					</button>
				</div>
			</div>
		</div>
	)
}

export default ChatThread
