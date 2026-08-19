import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input, Select } from 'antd'
import {
	FileSignature,
	FileSpreadsheet,
	Scale,
	ShieldCheck,
	BookOpen,
	StickyNote,
	Search,
	X,
	Trash2,
} from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchDocuments, createDocument, updateDocument, deleteDocument, searchDocuments } from './documentsApi'

const CATEGORIES = [
	{
		key: 'contract',
		label: 'Contracts',
		icon: FileSignature,
		description: 'Signed agreements with clients, vendors, and partners',
	},
	{
		key: 'template',
		label: 'Templates',
		icon: FileSpreadsheet,
		description: 'Budgeting, business plan, and other reusable templates',
	},
	{
		key: 'rule',
		label: 'Rules',
		icon: Scale,
		description: 'Internal policies and operating rules',
	},
	{
		key: 'rights_and_responsibilities',
		label: 'Rights & Responsibilities',
		icon: ShieldCheck,
		description: 'What each role is entitled to and accountable for',
	},
	{
		key: 'playbook',
		label: 'Playbooks',
		icon: BookOpen,
		description: 'Step-by-step guides for recurring situations',
	},
	{
		key: 'note',
		label: 'Notes',
		icon: StickyNote,
		description: 'Informal write-ups and quick references',
	},
	{
		key: 'checklists',
		label: 'Checklists',
		icon: StickyNote,
		description: 'Informal write-ups and quick references',
	},
]

const categoryLabel = (key) => CATEGORIES.find((category) => category.key === key)?.label ?? key

const QuickAddBar = () => {
	const queryClient = useQueryClient()
	const [expanded, setExpanded] = useState(false)
	const [form, setForm] = useState({ title: '', type: CATEGORIES[0].key, content: '' })

	const { mutate, isPending } = useMutation({
		mutationFn: createDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] })
			setForm({ title: '', type: CATEGORIES[0].key, content: '' })
			setExpanded(false)
		},
	})

	const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

	const close = () => {
		if (!form.title.trim() && !form.content.trim()) {
			setExpanded(false)
			return
		}
		mutate(form)
	}

	return (
		<div
			className='max-w-xl mx-auto w-full rounded-2xl overflow-hidden transition-shadow'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
			}}>
			{!expanded ? (
				<button
					onClick={() => setExpanded(true)}
					className='w-full text-left px-4 py-3 text-sm'
					style={{ color: 'var(--color-muted)' }}>
					Take a note...
				</button>
			) : (
				<div className='flex flex-col gap-2 p-3'>
					<input
						autoFocus
						value={form.title}
						onChange={setField('title')}
						placeholder='Title'
						className='text-sm font-semibold outline-none bg-transparent'
						style={{ color: 'var(--color-text)' }}
					/>
					<textarea
						rows={3}
						value={form.content}
						onChange={setField('content')}
						placeholder='Take a note...'
						className='text-sm outline-none bg-transparent resize-none'
						style={{ color: 'var(--color-text)' }}
					/>
					<div className='flex items-center justify-between pt-1'>
						<select
							value={form.type}
							onChange={setField('type')}
							className='text-xs rounded-lg px-2 py-1 outline-none'
							style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
							{CATEGORIES.map(({ key, label }) => (
								<option key={key} value={key}>{label}</option>
							))}
						</select>
						<button
							onClick={close}
							disabled={isPending}
							className='text-sm font-semibold px-3 py-1.5 rounded-xl disabled:opacity-50'
							style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
							{isPending ? 'Saving…' : 'Done'}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const CategoryChip = ({ category, count, active, onClick }) => {
	const Icon = category.icon
	return (
		<button
			onClick={onClick}
			className='flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors shrink-0'
			style={{
				border: active ? '1px solid var(--color-text)' : '1px solid var(--color-border)',
				background: active ? 'var(--color-surface)' : 'transparent',
				color: active ? 'var(--color-text)' : 'var(--color-muted)',
			}}>
			<Icon size={13} strokeWidth={1.75} />
			{category.label}
			<span style={{ color: 'var(--color-muted)' }}>{count}</span>
		</button>
	)
}

const NoteCard = ({ item, onClick, onDelete }) => (
	<div
		onClick={onClick}
		className='group relative rounded-2xl p-4 cursor-pointer transition-shadow hover:shadow-md break-inside-avoid mb-4'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<button
			onClick={(e) => { e.stopPropagation(); onDelete() }}
			className='absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
			style={{ color: 'var(--color-muted)' }}>
			<Trash2 size={14} strokeWidth={1.75} />
		</button>
		<span
			className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full'
			style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
			{categoryLabel(item.type)}
		</span>
		<p className='text-sm font-semibold mt-2 mb-1 pr-6' style={{ color: 'var(--color-text)' }}>
			{item.title || 'Untitled'}
		</p>
		{item.content && (
			<p className='text-xs leading-relaxed whitespace-pre-wrap line-clamp-6' style={{ color: 'var(--color-muted)' }}>
				{item.content}
			</p>
		)}
		{item.classification && (
			<p className='text-[10px] mt-2 italic' style={{ color: 'var(--color-muted)' }}>{item.classification}</p>
		)}
	</div>
)

const EditDocumentModal = ({ document, onClose }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending: isSaving, error } = useMutation({
		mutationFn: updateDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] })
			onClose()
		},
	})

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: deleteDocument,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] })
			onClose()
		},
	})

	return (
		<Modal
			title='Edit document'
			open={!!document}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isSaving}
			okText='Save'
			destroyOnHidden
			footer={(_, { OkBtn, CancelBtn }) => (
				<div className='flex items-center justify-between'>
					<button
						onClick={() => document && remove(document.id)}
						disabled={isDeleting}
						className='text-xs font-medium flex items-center gap-1 disabled:opacity-50'
						style={{ color: '#dc2626' }}>
						<Trash2 size={13} strokeWidth={1.75} />
						Delete
					</button>
					<div className='flex gap-2'>
						<CancelBtn />
						<OkBtn />
					</div>
				</div>
			)}>
			{document && (
				<Form
					form={form}
					layout='vertical'
					className='pt-2'
					initialValues={document}
					onFinish={(values) => save({ id: document.id, ...values })}>
					<Form.Item name='title' label='Title' rules={[{ required: true, message: 'Title is required' }]}>
						<Input />
					</Form.Item>

					<Form.Item name='type' label='Category' rules={[{ required: true }]}>
						<Select options={CATEGORIES.map(({ key, label }) => ({ value: key, label }))} />
					</Form.Item>

					<Form.Item name='classification' label='Classification'>
						<Input placeholder='e.g. confidential, public' />
					</Form.Item>

					<Form.Item name='content' label='Content'>
						<Input.TextArea rows={8} />
					</Form.Item>

					{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
				</Form>
			)}
		</Modal>
	)
}

const DocumentsPage = () => {
	const [activeCategory, setActiveCategory] = useState(null)
	const [editingDocument, setEditingDocument] = useState(null)
	const [searchInput, setSearchInput] = useState('')
	const [searchResults, setSearchResults] = useState(null)

	const { data: items, isLoading } = useQuery({
		queryKey: ['documents'],
		queryFn: fetchDocuments,
	})

	const { mutate: runSearch, isPending: isSearching } = useMutation({
		mutationFn: searchDocuments,
		onSuccess: setSearchResults,
	})

	const { mutate: removeDocument } = useMutation({
		mutationFn: deleteDocument,
	})

	const queryClient = useQueryClient()
	const handleDelete = (id) => {
		removeDocument(id, {
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
		})
	}

	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter' && searchInput.trim()) runSearch(searchInput.trim())
		if (e.key === 'Enter' && !searchInput.trim()) setSearchResults(null)
	}

	const clearSearch = () => {
		setSearchInput('')
		setSearchResults(null)
	}

	const countByCategory = (key) => items?.filter((item) => item.type === key).length ?? 0

	const baseItems = searchResults ?? items
	const visibleItems = activeCategory
		? baseItems?.filter((item) => item.type === activeCategory)
		: baseItems

	return (
		<PageShell title='Documents'>
			<div className='space-y-6'>
				<QuickAddBar />

				<div className='relative max-w-md mx-auto'>
					<Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-muted)' }} />
					<input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						placeholder='Search documents by meaning, e.g. "refund policy"'
						className='w-full rounded-xl pl-9 pr-8 py-2 text-sm outline-none'
						style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
					/>
					{searchResults && (
						<button onClick={clearSearch} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100' style={{ color: 'var(--color-text)' }}>
							<X size={14} strokeWidth={1.75} />
						</button>
					)}
				</div>

				<div className='flex gap-2 overflow-x-auto pb-1'>
					{CATEGORIES.map((category) => (
						<CategoryChip
							key={category.key}
							category={category}
							count={countByCategory(category.key)}
							active={activeCategory === category.key}
							onClick={() => setActiveCategory(activeCategory === category.key ? null : category.key)}
						/>
					))}
				</div>

				{isLoading || isSearching ? (
					<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
				) : !visibleItems?.length ? (
					<div
						className='rounded-2xl flex items-center justify-center h-48 text-sm'
						style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
						No documents found
					</div>
				) : (
					<div className='columns-2 sm:columns-3 md:columns-4 gap-4'>
						{visibleItems.map((item) => (
							<NoteCard
								key={item.id}
								item={item}
								onClick={() => setEditingDocument(item)}
								onDelete={() => handleDelete(item.id)}
							/>
						))}
					</div>
				)}
			</div>

			<EditDocumentModal document={editingDocument} onClose={() => setEditingDocument(null)} />
		</PageShell>
	)
}

export default DocumentsPage
