import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Modal, Form, InputNumber, Select, Input } from 'antd'
import PageShell from '@/util/components/PageShell'
import { fetchOrders, recordOrderPayment, ORDER_STATUSES, PAYMENT_STATUSES } from './ordersApi'
import { PAYMENT_METHODS } from '@/payments/paymentsApi'

const formatCurrency = (amount, currency = 'FRW') =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0)

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—')

const statusLabel = (list, value) => list.find((s) => s.value === value)?.label ?? value

const RecordPaymentModal = ({ order, onClose }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: (values) => recordOrderPayment({ ...values, orderId: order.id, amount: Number(values.amount) || 0 }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] })
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
			title={t('orders.recordPaymentTitle', 'Record payment — order {{orderId}}', { orderId: order.id.slice(0, 8) })}
			open
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('orders.recordPayment', 'Record payment')}
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='amount' label={t('common.amount', 'Amount')} rules={[{ required: true, message: t('orders.amountRequired', 'Amount is required') }]}>
					<InputNumber min={0} step={0.01} className='w-full' />
				</Form.Item>

				<Form.Item name='method' label={t('common.method', 'Method')} initialValue='cash' rules={[{ required: true }]}>
					<Select options={PAYMENT_METHODS.map(({ value, label }) => ({ value, label }))} />
				</Form.Item>

				<Form.Item name='reference' label={t('orders.reference', 'Reference')}>
					<Input />
				</Form.Item>

				<Form.Item name='notes' label={t('common.notes', 'Notes')}>
					<Input.TextArea rows={3} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const OrdersPage = () => {
	const { t } = useTranslation()
	const [payingOrder, setPayingOrder] = useState(null)

	const { data: orders, isLoading } = useQuery({
		queryKey: ['orders'],
		queryFn: fetchOrders,
	})

	return (
		<PageShell title={t('orders.title', 'Orders')}>
			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
			) : !orders?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					{t('orders.emptyState', 'No orders yet')}
				</div>
			) : (
				<div className='neu-raised rounded-xl overflow-hidden' style={{ background: 'var(--neu-bg)' }}>
					<table className='w-full text-sm'>
						<thead>
							<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
								{[
									t('inventory.columns.date', 'Date'),
									t('orders.columns.items', 'Items'),
									t('orders.columns.total', 'Total'),
									t('orders.columns.status', 'Status'),
									t('orders.columns.payment', 'Payment'),
									'',
								].map((col) => (
									<th key={col} className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide' style={{ color: 'var(--color-muted)' }}>
										{col}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{orders.map((order, i) => (
								<tr
									key={order.id}
									style={{
										background: i % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
										borderBottom: '1px solid var(--color-border)',
									}}>
									<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{formatDate(order.orderDate)}</td>
									<td className='px-4 py-3' style={{ color: 'var(--color-text)' }}>
										{t('orders.itemCount', '{{count}} item(s)', { count: order.items?.length ?? 0 })}
									</td>
									<td className='px-4 py-3 font-semibold' style={{ color: 'var(--color-text)' }}>
										{formatCurrency(order.totalAmount, order.currency)}
									</td>
									<td className='px-4 py-3 capitalize' style={{ color: 'var(--color-text)' }}>
										{statusLabel(ORDER_STATUSES, order.status)}
									</td>
									<td className='px-4 py-3' style={{ color: order.paymentStatus === 'paid' ? 'var(--color-primary)' : 'var(--color-muted)' }}>
										{statusLabel(PAYMENT_STATUSES, order.paymentStatus)}
									</td>
									<td className='px-4 py-3'>
										{order.paymentStatus !== 'paid' && (
											<button
												onClick={() => setPayingOrder(order)}
												className='text-xs font-semibold transition-opacity hover:opacity-70'
												style={{ color: 'var(--color-primary)' }}>
												{t('orders.recordPayment', 'Record payment')}
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{payingOrder && <RecordPaymentModal order={payingOrder} onClose={() => setPayingOrder(null)} />}
		</PageShell>
	)
}

export default OrdersPage
