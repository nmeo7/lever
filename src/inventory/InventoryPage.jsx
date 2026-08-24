import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import { Plus } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchInventory, fetchInventoryMovements, adjustInventory } from './inventoryApi'
import { fetchProducts } from '@/products/productsApi'

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—')

const AdjustInventoryModal = ({ open, onClose, products }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: (values) => adjustInventory({ ...values, quantity: Number(values.quantity) || 0 }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['inventory'] })
			queryClient.invalidateQueries({ queryKey: ['inventoryMovements'] })
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
			title={t('inventory.adjustInventory', 'Adjust inventory')}
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('common.save', 'Save')}
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='productId' label={t('inventory.product', 'Product')} rules={[{ required: true, message: t('inventory.productRequired', 'Product is required') }]}>
					<Select
						showSearch
						optionFilterProp='label'
						options={(products ?? []).map((p) => ({ value: p.id, label: p.name }))}
					/>
				</Form.Item>

				<Form.Item name='locationId' label={t('inventory.location', 'Location')}>
					<Input placeholder={t('common.optional', 'Optional')} />
				</Form.Item>

				<Form.Item
					name='quantity'
					label={t('inventory.quantityChange', 'Quantity change')}
					rules={[{ required: true, message: t('inventory.quantityRequired', 'Quantity is required') }]}
					extra={t('inventory.quantityHint', 'Positive to add stock, negative to remove.')}>
					<InputNumber step={1} className='w-full' />
				</Form.Item>

				<Form.Item name='reorderLevel' label={t('inventory.reorderLevel', 'Reorder level')}>
					<InputNumber min={0} step={1} className='w-full' />
				</Form.Item>

				<Form.Item name='notes' label={t('common.notes', 'Notes')}>
					<Input.TextArea rows={2} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const InventoryPage = () => {
	const { t } = useTranslation()
	const [modalOpen, setModalOpen] = useState(false)

	const { data: inventory, isLoading } = useQuery({
		queryKey: ['inventory'],
		queryFn: fetchInventory,
	})

	const { data: movements } = useQuery({
		queryKey: ['inventoryMovements'],
		queryFn: fetchInventoryMovements,
	})

	const { data: products } = useQuery({
		queryKey: ['products'],
		queryFn: fetchProducts,
	})

	const productName = (productId) => products?.find((p) => p.id === productId)?.name ?? productId

	return (
		<PageShell
			title={t('inventory.title', 'Inventory')}
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl'
					style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
					<Plus size={14} strokeWidth={1.75} />
					{t('inventory.adjustStock', 'Adjust stock')}
				</button>
			}>
			<div className='flex flex-col gap-8'>
				<div className='flex flex-col gap-3'>
					<h2 className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{t('inventory.stockLevels', 'Stock levels')}</h2>
					{isLoading ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
					) : !inventory?.length ? (
						<div
							className='rounded-2xl flex items-center justify-center h-32 text-sm'
							style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
							{t('inventory.noInventory', 'No inventory recorded yet')}
						</div>
					) : (
						<div className='neu-raised rounded-xl overflow-hidden' style={{ background: 'var(--neu-bg)' }}>
							<table className='w-full text-sm'>
								<thead>
									<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
										{[
											t('inventory.columns.product', 'Product'),
											t('inventory.columns.location', 'Location'),
											t('inventory.columns.onHand', 'On hand'),
											t('inventory.columns.reserved', 'Reserved'),
											t('inventory.columns.available', 'Available'),
											t('inventory.columns.reorderLevel', 'Reorder level'),
										].map((col) => (
											<th key={col} className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide' style={{ color: 'var(--color-muted)' }}>
												{col}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{inventory.map((item, i) => (
										<tr
											key={item.id}
											style={{
												background: i % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
												borderBottom: '1px solid var(--color-border)',
											}}>
											<td className='px-4 py-3' style={{ color: 'var(--color-text)' }}>{productName(item.productId)}</td>
											<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{item.locationId || '—'}</td>
											<td className='px-4 py-3 font-semibold' style={{ color: 'var(--color-text)' }}>{item.quantityOnHand}</td>
											<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{item.reservedQuantity}</td>
											<td
												className='px-4 py-3 font-semibold'
												style={{ color: item.quantityOnHand - item.reservedQuantity <= item.reorderLevel ? '#dc2626' : 'var(--color-primary)' }}>
												{item.quantityOnHand - item.reservedQuantity}
											</td>
											<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{item.reorderLevel}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className='flex flex-col gap-3'>
					<h2 className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{t('inventory.recentMovements', 'Recent movements')}</h2>
					{!movements?.length ? (
						<div
							className='rounded-2xl flex items-center justify-center h-32 text-sm'
							style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
							{t('inventory.noMovements', 'No movements yet')}
						</div>
					) : (
						<div className='neu-raised rounded-xl overflow-hidden' style={{ background: 'var(--neu-bg)' }}>
							<table className='w-full text-sm'>
								<thead>
									<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
										{[
											t('inventory.columns.date', 'Date'),
											t('inventory.columns.product', 'Product'),
											t('inventory.columns.type', 'Type'),
											t('inventory.columns.quantity', 'Quantity'),
										].map((col) => (
											<th key={col} className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide' style={{ color: 'var(--color-muted)' }}>
												{col}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{movements.map((mov, i) => (
										<tr
											key={mov.id}
											style={{
												background: i % 2 === 0 ? 'var(--color-background)' : 'var(--color-surface)',
												borderBottom: '1px solid var(--color-border)',
											}}>
											<td className='px-4 py-3' style={{ color: 'var(--color-muted)' }}>{formatDate(mov.createdAt)}</td>
											<td className='px-4 py-3' style={{ color: 'var(--color-text)' }}>{productName(mov.productId)}</td>
											<td className='px-4 py-3 capitalize' style={{ color: 'var(--color-text)' }}>{mov.movementType}</td>
											<td className='px-4 py-3 font-semibold' style={{ color: mov.quantity >= 0 ? 'var(--color-primary)' : '#dc2626' }}>
												{mov.quantity >= 0 ? '+' : ''}{mov.quantity}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			<AdjustInventoryModal open={modalOpen} onClose={() => setModalOpen(false)} products={products} />
		</PageShell>
	)
}

export default InventoryPage
