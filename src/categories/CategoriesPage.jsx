import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input, Select } from 'antd'
import Papa from 'papaparse'
import { Plus, UploadCloud, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchCategories, createCategory, batchUpsertCategories, CATEGORY_CLASSIFICATIONS } from './categoriesApi'

const COLUMNS = ['name', 'parentId', 'description', 'classification']

const CategoryCard = ({ category }) => (
	<div className='neu-raised rounded-2xl p-4 flex flex-col gap-1.5' style={{ background: 'var(--neu-bg)' }}>
		<div className='flex items-center justify-between gap-2'>
			<p className='text-sm font-semibold truncate' style={{ color: 'var(--color-text)' }}>{category.name}</p>
			<span
				className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0'
				style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
				{category.classification}
			</span>
		</div>
		{category.parentId && <p className='text-xs' style={{ color: 'var(--color-muted)' }}>Parent: {category.parentId}</p>}
		{category.description && <p className='text-xs line-clamp-2' style={{ color: 'var(--color-muted)' }}>{category.description}</p>}
	</div>
)

const AddCategoryModal = ({ open, onClose }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: createCategory,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['categories'] })
			form.resetFields()
			onClose()
		},
	})

	const handleClose = () => {
		reset()
		form.resetFields()
		onClose()
	}

	return (
		<Modal
			title='Add category'
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Save category'
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Name is required' }]}>
					<Input />
				</Form.Item>

				<Form.Item name='parentId' label='Parent category ID'>
					<Input />
				</Form.Item>

				<Form.Item name='classification' label='Classification' initialValue='public' rules={[{ required: true }]}>
					<Select options={CATEGORY_CLASSIFICATIONS} />
				</Form.Item>

				<Form.Item name='description' label='Description'>
					<Input.TextArea rows={3} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const BulkImportPanel = () => {
	const queryClient = useQueryClient()
	const [fileName, setFileName] = useState('')
	const [rows, setRows] = useState([])
	const [dragOver, setDragOver] = useState(false)
	const [result, setResult] = useState(null)

	const { mutate: commit, isPending, error } = useMutation({
		mutationFn: batchUpsertCategories,
		onSuccess: (data) => {
			setResult(data)
			queryClient.invalidateQueries({ queryKey: ['categories'] })
		},
	})

	const parseFile = (file) => {
		if (!file) return
		setResult(null)
		setFileName(file.name)
		Papa.parse(file, { header: true, skipEmptyLines: true, complete: ({ data }) => setRows(data) })
	}

	const handleDrop = (e) => {
		e.preventDefault()
		setDragOver(false)
		parseFile(e.dataTransfer.files?.[0])
	}

	const handleFile = (e) => {
		parseFile(e.target.files?.[0])
		e.target.value = ''
	}

	const reset = () => {
		setRows([])
		setFileName('')
		setResult(null)
	}

	return (
		<div className='rounded-2xl p-5 border mb-6' style={{ borderColor: 'var(--color-border)' }}>
			<div className='flex items-center gap-2.5 mb-4'>
				<span
					className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<UploadCloud size={16} strokeWidth={2} />
				</span>
				<div>
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>Bulk import</p>
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Create categories from a CSV</p>
				</div>
			</div>

			<p className='text-xs mb-3' style={{ color: 'var(--color-muted)' }}>
				Expected columns: {COLUMNS.join(', ')}
			</p>

			{!rows.length ? (
				<label
					onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
					onDragLeave={() => setDragOver(false)}
					onDrop={handleDrop}
					className='flex flex-col items-center justify-center gap-2 h-32 rounded-2xl cursor-pointer transition-opacity'
					style={{
						border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
						color: 'var(--color-muted)',
					}}>
					<FileSpreadsheet size={20} strokeWidth={2} />
					<span className='text-xs'>Drag a CSV here or click to browse</span>
					<input type='file' accept='.csv' onChange={handleFile} className='hidden' />
				</label>
			) : (
				<div className='flex flex-col gap-3'>
					<div className='flex items-center justify-between'>
						<span className='text-xs' style={{ color: 'var(--color-muted)' }}>
							{fileName} · {rows.length} row{rows.length === 1 ? '' : 's'} previewed
						</span>
						<button
							onClick={reset}
							className='text-xs font-semibold px-3 py-1 rounded-full border transition-opacity hover:opacity-90'
							style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
							Clear
						</button>
					</div>

					<div className='rounded-xl border overflow-auto max-h-56' style={{ borderColor: 'var(--color-border)' }}>
						<table className='w-full text-xs'>
							<thead>
								<tr style={{ borderBottom: '1px solid var(--color-border)' }}>
									{Object.keys(rows[0]).map((column) => (
										<th key={column} className='text-left px-3 py-2 font-semibold' style={{ color: 'var(--color-text)' }}>
											{column}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{rows.slice(0, 8).map((row, index) => (
									<tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
										{Object.keys(rows[0]).map((column) => (
											<td key={column} className='px-3 py-2' style={{ color: 'var(--color-muted)' }}>
												{row[column]}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
						{rows.length > 8 && (
							<p className='text-xs px-3 py-2' style={{ color: 'var(--color-muted)' }}>
								+{rows.length - 8} more row{rows.length - 8 === 1 ? '' : 's'}
							</p>
						)}
					</div>

					<button
						onClick={() => commit(rows)}
						disabled={isPending}
						className='self-start flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-opacity hover:opacity-90'
						style={{ borderColor: 'var(--color-border)', color: 'var(--color-bg)', backgroundColor: 'var(--color-primary)', opacity: isPending ? 0.6 : 1 }}>
						{isPending ? 'Importing…' : `Import ${rows.length} categories`}
					</button>
				</div>
			)}

			{error && <p className='text-xs mt-3' style={{ color: '#dc2626' }}>{error.message}</p>}

			{result && (
				<div className='flex flex-col gap-1.5 mt-3'>
					<p className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--color-text)' }}>
						<CheckCircle2 size={14} strokeWidth={2} style={{ color: '#16a34a' }} />
						Imported {result.count} categories
					</p>
					{result.errors?.length > 0 && (
						<div className='flex flex-col gap-1'>
							{result.errors.map(({ row, message }) => (
								<p key={row} className='flex items-center gap-1.5 text-xs' style={{ color: '#dc2626' }}>
									<XCircle size={14} strokeWidth={2} />
									Row {row + 1}: {message}
								</p>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}

const CategoriesPage = () => {
	const [modalOpen, setModalOpen] = useState(false)

	const { data: categories, isLoading } = useQuery({
		queryKey: ['categories'],
		queryFn: fetchCategories,
	})

	return (
		<PageShell
			title='Categories'
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<Plus size={14} strokeWidth={2} />
					Add category
				</button>
			}>
			<BulkImportPanel />

			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !categories?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No categories found
				</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
					{categories.map((category) => (
						<CategoryCard key={category.id} category={category} />
					))}
				</div>
			)}

			<AddCategoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
		</PageShell>
	)
}

export default CategoriesPage
