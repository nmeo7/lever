import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import Papa from 'papaparse'
import { Plus, UploadCloud, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import {
	fetchPlans,
	createPlan,
	batchUpsertPlans,
	PLAN_TYPES,
	PLAN_STATUSES,
	PLAN_PRIORITIES,
	DEFAULT_CURRENCY,
} from './plansApi'

const COLUMNS = ['type', 'category', 'title', 'goal', 'description', 'value', 'expectedDate', 'status', 'priority']

const formatCurrency = (amount, currency) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || DEFAULT_CURRENCY }).format(amount ?? 0)

const priorityColors = {
	low: 'var(--color-muted)',
	medium: 'var(--color-text)',
	high: '#d97706',
	critical: '#dc2626',
}

const PlanCard = ({ plan }) => (
	<div className='neu-raised rounded-2xl p-4 flex flex-col gap-1.5' style={{ background: 'var(--neu-bg)' }}>
		<div className='flex items-center justify-between gap-2'>
			<p className='text-sm font-semibold truncate' style={{ color: 'var(--color-text)' }}>
				{plan.category && <span className='opacity-70'>{plan.category} · </span>}
				{plan.title}
			</p>
			<span
				className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0'
				style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
				{plan.type}
			</span>
		</div>
		{plan.goal && <p className='text-xs' style={{ color: 'var(--color-muted)' }}>Goal: {plan.goal}</p>}
		{plan.description && <p className='text-xs line-clamp-2' style={{ color: 'var(--color-muted)' }}>{plan.description}</p>}
		{plan.value > 0 && (
			<p className='text-sm font-bold' style={{ color: 'var(--color-primary)' }}>
				{formatCurrency(plan.value, plan.currency)}
			</p>
		)}
		{plan.expectedDate && <p className='text-xs' style={{ color: 'var(--color-muted)' }}>{plan.expectedDate}</p>}
		<div className='flex items-center gap-1.5'>
			<span
				className='text-[10px] font-semibold uppercase tracking-wide w-fit px-2 py-0.5 rounded-full'
				style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
				{plan.status}
			</span>
			{plan.priority && (
				<span
					className='text-[10px] font-semibold uppercase tracking-wide w-fit px-2 py-0.5 rounded-full'
					style={{ background: 'var(--color-background)', color: priorityColors[plan.priority] ?? 'var(--color-muted)' }}>
					{plan.priority}
				</span>
			)}
		</div>
	</div>
)

const AddPlanModal = ({ open, onClose }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: (values) => createPlan({ ...values, value: Number(values.value) || 0 }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['plans'] })
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
			title='Add plan'
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Save plan'
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='type' label='Type' initialValue='milestone' rules={[{ required: true }]}>
					<Select options={PLAN_TYPES} />
				</Form.Item>

				<Form.Item name='category' label='Verb' rules={[{ required: true, message: 'Verb is required' }]}>
					<Input placeholder='e.g. Receive, Go out' />
				</Form.Item>

				<Form.Item name='title' label='Object' rules={[{ required: true, message: 'Object is required' }]}>
					<Input placeholder='e.g. Grant from donor, tomorrow' />
				</Form.Item>

				<Form.Item name='goal' label='Goal'>
					<Input placeholder='What this plan works toward' />
				</Form.Item>

				<Form.Item name='value' label={`Value (${DEFAULT_CURRENCY})`}>
					<InputNumber min={0} step={0.01} className='w-full' />
				</Form.Item>

				<Form.Item name='expectedDate' label='Expected date'>
					<Input type='date' />
				</Form.Item>

				<Form.Item name='status' label='Status' initialValue='expected' rules={[{ required: true }]}>
					<Select options={PLAN_STATUSES} />
				</Form.Item>

				<Form.Item name='priority' label='Priority' initialValue='medium' rules={[{ required: true }]}>
					<Select options={PLAN_PRIORITIES} />
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
		mutationFn: batchUpsertPlans,
		onSuccess: (data) => {
			setResult(data)
			queryClient.invalidateQueries({ queryKey: ['plans'] })
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
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Create plans from a CSV</p>
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
						{isPending ? 'Importing…' : `Import ${rows.length} plans`}
					</button>
				</div>
			)}

			{error && <p className='text-xs mt-3' style={{ color: '#dc2626' }}>{error.message}</p>}

			{result && (
				<div className='flex flex-col gap-1.5 mt-3'>
					<p className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--color-text)' }}>
						<CheckCircle2 size={14} strokeWidth={2} style={{ color: '#16a34a' }} />
						Imported {result.count} plans
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

const PlansPage = () => {
	const [modalOpen, setModalOpen] = useState(false)

	const { data: plans, isLoading } = useQuery({
		queryKey: ['plans'],
		queryFn: fetchPlans,
	})

	return (
		<PageShell
			title='Plans'
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<Plus size={14} strokeWidth={2} />
					Add plan
				</button>
			}>
			<BulkImportPanel />

			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !plans?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No plans yet
				</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
					{plans.map((plan) => (
						<PlanCard key={plan.id} plan={plan} />
					))}
				</div>
			)}

			<AddPlanModal open={modalOpen} onClose={() => setModalOpen(false)} />
		</PageShell>
	)
}

export default PlansPage
