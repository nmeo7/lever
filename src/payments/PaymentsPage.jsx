import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd'
import { Plus, Search, X } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchPayments, createPayment, searchPayments, PAYMENT_TYPES, PAYMENT_CATEGORIES, PAYMENT_METHODS } from './paymentsApi'

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(amount ?? 0)

const formatDate = value => {
	if (!value) return '—'
	return new Date(value).toLocaleDateString()
}

const AddPaymentModal = ({ open, onClose }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: ({ paymentDate, ...values }) =>
			createPayment({
				...values,
				amount: Number(values.amount) || 0,
				paymentDate: paymentDate ? paymentDate.toISOString() : undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['payments'] })
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
			title={t('payments.addEntry', 'Add entry')}
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('payments.saveEntry', 'Save entry')}
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='type' label={t('common.type', 'Type')} initialValue='incoming' rules={[{ required: true }]}>
					<Select options={PAYMENT_TYPES.map(({ value, label }) => ({ value, label }))} />
				</Form.Item>

				<Form.Item name='category' label={t('payments.category', 'Category')} initialValue='sale' rules={[{ required: true }]}>
					<Select options={PAYMENT_CATEGORIES.map(({ value, label }) => ({ value, label }))} />
				</Form.Item>

				<Form.Item name='amount' label={t('common.amount', 'Amount')} rules={[{ required: true, message: t('orders.amountRequired', 'Amount is required') }]}>
					<InputNumber min={0} step={0.01} className='w-full' />
				</Form.Item>

				<Form.Item name='method' label={t('common.method', 'Method')} initialValue='cash' rules={[{ required: true }]}>
					<Select options={PAYMENT_METHODS.map(({ value, label }) => ({ value, label }))} />
				</Form.Item>

				<Form.Item name='paymentDate' label={t('common.date', 'Date')}>
					<DatePicker className='w-full' />
				</Form.Item>

				<Form.Item name='notes' label={t('common.notes', 'Notes')}>
					<Input.TextArea rows={3} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const categoryLabel = (value) => PAYMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value
const methodLabel = (value) => PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value

const PaymentsPage = () => {
	const { t } = useTranslation()
	const [panelOpen, setPanelOpen] = useState(false)
	const [searchInput, setSearchInput] = useState('')
	const [searchResults, setSearchResults] = useState(null)

	const { data: payments, isLoading } = useQuery({
		queryKey: ['payments'],
		queryFn: fetchPayments,
	})

	const { mutate: runSearch, isPending: isSearching } = useMutation({
		mutationFn: searchPayments,
		onSuccess: setSearchResults,
	})

	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter' && searchInput.trim()) runSearch(searchInput.trim())
		if (e.key === 'Enter' && !searchInput.trim()) setSearchResults(null)
	}

	const clearSearch = () => {
		setSearchInput('')
		setSearchResults(null)
	}

	const visiblePayments = searchResults ?? payments
	const netTotal = (visiblePayments ?? []).reduce(
		(sum, p) => sum + (p.type === 'incoming' ? p.amount : -p.amount),
		0,
	)

	return (
		<PageShell title={t('payments.title', 'Cashflow')}>
			<div className='flex flex-col gap-5'>
				<div className='flex items-center gap-3 flex-wrap'>
					<div className='relative max-w-md flex-1 min-w-[240px]'>
						<Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-muted)' }} />
						<input
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={handleSearchKeyDown}
							placeholder={t('payments.searchPlaceholder', 'Search entries by meaning, e.g. "payroll expenses"')}
							className='w-full rounded-xl pl-9 pr-8 py-2 text-sm outline-none border'
							style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
						/>
						{searchResults && (
							<button onClick={clearSearch} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100' style={{ color: 'var(--color-text)' }}>
								<X size={14} strokeWidth={1.75} />
							</button>
						)}
					</div>
					<button
						onClick={() => setPanelOpen(true)}
						className='flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl shrink-0'
						style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
						<Plus size={15} strokeWidth={2} />
						{t('payments.addEntry', 'Add entry')}
					</button>
					<p className='text-sm font-semibold ml-auto' style={{ color: netTotal >= 0 ? 'var(--color-primary)' : '#dc2626' }}>
						{t('payments.net', 'Net: {{amount}}', { amount: formatCurrency(netTotal) })}
					</p>
				</div>

				{isLoading || isSearching ? (
					<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
				) : !visiblePayments?.length ? (
					<div
						className='rounded-2xl flex items-center justify-center h-48 text-sm'
						style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
						{t('payments.emptyState', 'No entries found')}
					</div>
				) : (
					<div className='neu-raised rounded-xl overflow-hidden' style={{ background: 'var(--neu-bg)' }}>
						<table className='w-full text-sm'>
							<thead>
								<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
									{[
										t('inventory.columns.date', 'Date'),
										t('payments.category', 'Category'),
										t('common.type', 'Type'),
										t('common.method', 'Method'),
										t('common.amount', 'Amount'),
										t('common.notes', 'Notes'),
									].map((col) => (
										<th key={col} className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide' style={{ color: 'var(--color-muted)' }}>
											{col}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{visiblePayments.map((payment, i) => (
									<tr
										key={payment.id}
										style={{
											background: i % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
											borderBottom: '1px solid var(--color-border)',
										}}>
										<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{formatDate(payment.paymentDate)}</td>
										<td className='px-4 py-3' style={{ color: 'var(--color-text)' }}>{categoryLabel(payment.category)}</td>
										<td className='px-4 py-3 capitalize' style={{ color: 'var(--color-text)' }}>{payment.type}</td>
										<td className='px-4 py-3' style={{ color: 'var(--color-text)' }}>{methodLabel(payment.method)}</td>
										<td className='px-4 py-3 font-semibold' style={{ color: payment.type === 'incoming' ? 'var(--color-primary)' : '#dc2626' }}>
											{payment.type === 'incoming' ? '+' : '-'}{formatCurrency(payment.amount)}
										</td>
										<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{payment.notes || '—'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<AddPaymentModal open={panelOpen} onClose={() => setPanelOpen(false)} />
		</PageShell>
	)
}

export default PaymentsPage
