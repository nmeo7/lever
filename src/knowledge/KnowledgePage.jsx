import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
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
import {
	fetchKnowledgeEntries,
	createKnowledgeEntry,
	updateKnowledgeEntry,
	deleteKnowledgeEntry,
	searchKnowledgeEntries,
} from './knowledgeApi'

const CATEGORIES = [
	{
		key: 'contract',
		labelKey: 'knowledge.categories.contract.label',
		label: 'Contracts',
		icon: FileSignature,
		descriptionKey: 'knowledge.categories.contract.description',
		description: 'Signed agreements with clients, vendors, and partners',
	},
	{
		key: 'template',
		labelKey: 'knowledge.categories.template.label',
		label: 'Templates',
		icon: FileSpreadsheet,
		descriptionKey: 'knowledge.categories.template.description',
		description: 'Budgeting, business plan, and other reusable templates',
	},
	{
		key: 'rule',
		labelKey: 'knowledge.categories.rule.label',
		label: 'Rules',
		icon: Scale,
		descriptionKey: 'knowledge.categories.rule.description',
		description: 'Internal policies and operating rules',
	},
	{
		key: 'rights_and_responsibilities',
		labelKey: 'knowledge.categories.rightsAndResponsibilities.label',
		label: 'Rights & Responsibilities',
		icon: ShieldCheck,
		descriptionKey: 'knowledge.categories.rightsAndResponsibilities.description',
		description: 'What each role is entitled to and accountable for',
	},
	{
		key: 'playbook',
		labelKey: 'knowledge.categories.playbook.label',
		label: 'Playbooks',
		icon: BookOpen,
		descriptionKey: 'knowledge.categories.playbook.description',
		description: 'Step-by-step guides for recurring situations',
	},
	{
		key: 'note',
		labelKey: 'knowledge.categories.note.label',
		label: 'Notes',
		icon: StickyNote,
		descriptionKey: 'knowledge.categories.note.description',
		description: 'Informal write-ups and quick references',
	},
	{
		key: 'checklists',
		labelKey: 'knowledge.categories.checklists.label',
		label: 'Checklists',
		icon: StickyNote,
		descriptionKey: 'knowledge.categories.checklists.description',
		description: 'Informal write-ups and quick references',
	},
]

const categoryLabel = (key, t) => t(
	CATEGORIES.find((category) => category.key === key)?.labelKey ?? key,
	CATEGORIES.find((category) => category.key === key)?.label ?? key,
)

const QuickAddBar = () => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [expanded, setExpanded] = useState(false)
	const [form, setForm] = useState({ title: '', type: CATEGORIES[0].key, content: '' })

	const { mutate, isPending } = useMutation({
		mutationFn: createKnowledgeEntry,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['knowledge'] })
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
			className='max-w-xl mx-auto w-full rounded-2xl overflow-hidden border transition-shadow'
			style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
			{!expanded ? (
				<button
					onClick={() => setExpanded(true)}
					className='w-full text-left px-4 py-3 text-sm'
					style={{ color: 'var(--color-muted)' }}>
					{t('knowledge.takeANote', 'Take a note...')}
				</button>
			) : (
				<div className='flex flex-col gap-2 p-3'>
					<input
						autoFocus
						value={form.title}
						onChange={setField('title')}
						placeholder={t('knowledge.titlePlaceholder', 'Title')}
						className='text-sm font-semibold outline-none bg-transparent'
						style={{ color: 'var(--color-text)' }}
					/>
					<textarea
						rows={3}
						value={form.content}
						onChange={setField('content')}
						placeholder={t('knowledge.takeANote', 'Take a note...')}
						className='text-sm outline-none bg-transparent resize-none'
						style={{ color: 'var(--color-text)' }}
					/>
					<div className='flex items-center justify-between pt-1'>
						<select
							value={form.type}
							onChange={setField('type')}
							className='text-xs rounded-lg px-2 py-1 outline-none border'
							style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
							{CATEGORIES.map(({ key, labelKey, label }) => (
								<option key={key} value={key}>{t(labelKey, label)}</option>
							))}
						</select>
						<button
							onClick={close}
							disabled={isPending}
							className='text-sm font-semibold px-3 py-1.5 rounded-xl disabled:opacity-50'
							style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
							{isPending ? t('knowledge.saving', 'Saving…') : t('common.done', 'Done')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const CategoryChip = ({ category, count, active, onClick }) => {
	const { t } = useTranslation()
	const Icon = category.icon
	return (
		<button
			onClick={onClick}
			className='flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors shrink-0'
			style={{
				background: active ? 'var(--color-surface)' : 'transparent',
				borderColor: 'var(--color-border)',
				color: active ? 'var(--color-text)' : 'var(--color-muted)',
			}}>
			<Icon size={13} strokeWidth={1.75} />
			{t(category.labelKey, category.label)}
			<span style={{ color: 'var(--color-muted)' }}>{count}</span>
		</button>
	)
}

const NoteCard = ({ item, onClick, onDelete }) => {
	const { t } = useTranslation()
	return (
		<div
			onClick={onClick}
			className='neu-raised group relative rounded-2xl p-4 cursor-pointer transition-shadow hover:shadow-md break-inside-avoid mb-4'
			style={{ background: 'var(--neu-bg)' }}>
			<button
				onClick={(e) => { e.stopPropagation(); onDelete() }}
				className='absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
				style={{ color: 'var(--color-muted)' }}>
				<Trash2 size={14} strokeWidth={1.75} />
			</button>
			<span
				className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full'
				style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
				{categoryLabel(item.type, t)}
			</span>
			<p className='text-sm font-semibold mt-2 mb-1 pr-6' style={{ color: 'var(--color-text)' }}>
				{item.title || t('knowledge.untitled', 'Untitled')}
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
}

const EditKnowledgeEntryModal = ({ entry, onClose }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending: isSaving, error } = useMutation({
		mutationFn: updateKnowledgeEntry,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['knowledge'] })
			onClose()
		},
	})

	const { mutate: remove, isPending: isDeleting } = useMutation({
		mutationFn: deleteKnowledgeEntry,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['knowledge'] })
			onClose()
		},
	})

	return (
		<Modal
			title={t('knowledge.editEntry', 'Edit entry')}
			open={!!entry}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isSaving}
			okText={t('common.save', 'Save')}
			destroyOnHidden
			footer={(_, { OkBtn, CancelBtn }) => (
				<div className='flex items-center justify-between'>
					<button
						onClick={() => entry && remove(entry.id)}
						disabled={isDeleting}
						className='text-xs font-medium flex items-center gap-1 disabled:opacity-50'
						style={{ color: '#dc2626' }}>
						<Trash2 size={13} strokeWidth={1.75} />
						{t('common.delete', 'Delete')}
					</button>
					<div className='flex gap-2'>
						<CancelBtn />
						<OkBtn />
					</div>
				</div>
			)}>
			{entry && (
				<Form
					form={form}
					layout='vertical'
					className='pt-2'
					initialValues={entry}
					onFinish={(values) => save({ id: entry.id, ...values })}>
					<Form.Item name='title' label={t('knowledge.titlePlaceholder', 'Title')} rules={[{ required: true, message: t('knowledge.titleRequired', 'Title is required') }]}>
						<Input />
					</Form.Item>

					<Form.Item name='type' label={t('knowledge.category', 'Category')} rules={[{ required: true }]}>
						<Select options={CATEGORIES.map(({ key, labelKey, label }) => ({ value: key, label: t(labelKey, label) }))} />
					</Form.Item>

					<Form.Item name='classification' label={t('knowledge.classification', 'Classification')}>
						<Input placeholder={t('knowledge.classificationPlaceholder', 'e.g. confidential, public')} />
					</Form.Item>

					<Form.Item name='content' label={t('knowledge.content', 'Content')}>
						<Input.TextArea rows={8} />
					</Form.Item>

					{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
				</Form>
			)}
		</Modal>
	)
}

const KnowledgePage = () => {
	const { t } = useTranslation()
	const [activeCategory, setActiveCategory] = useState(null)
	const [editingEntry, setEditingEntry] = useState(null)
	const [searchInput, setSearchInput] = useState('')
	const [searchResults, setSearchResults] = useState(null)

	const { data: items, isLoading } = useQuery({
		queryKey: ['knowledge'],
		queryFn: fetchKnowledgeEntries,
	})

	const { mutate: runSearch, isPending: isSearching } = useMutation({
		mutationFn: searchKnowledgeEntries,
		onSuccess: setSearchResults,
	})

	const { mutate: removeEntry } = useMutation({
		mutationFn: deleteKnowledgeEntry,
	})

	const queryClient = useQueryClient()
	const handleDelete = (id) => {
		removeEntry(id, {
			onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge'] }),
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
		<PageShell title={t('knowledge.title', 'Knowledge')}>
			<div className='space-y-6'>
				<QuickAddBar />

				<div className='relative max-w-md mx-auto'>
					<Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-muted)' }} />
					<input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={handleSearchKeyDown}
						placeholder={t('knowledge.searchPlaceholder', 'Search knowledge by meaning, e.g. "refund policy"')}
						className='w-full rounded-xl pl-9 pr-8 py-2 text-sm outline-none border'
						style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
					<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
				) : !visibleItems?.length ? (
					<div
						className='rounded-2xl flex items-center justify-center h-48 text-sm'
						style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
						{t('knowledge.emptyState', 'No knowledge base entries yet')}
					</div>
				) : (
					<div className='columns-2 sm:columns-3 md:columns-4 gap-4'>
						{visibleItems.map((item) => (
							<NoteCard
								key={item.id}
								item={item}
								onClick={() => setEditingEntry(item)}
								onDelete={() => handleDelete(item.id)}
							/>
						))}
					</div>
				)}
			</div>

			<EditKnowledgeEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} />
		</PageShell>
	)
}

export default KnowledgePage
