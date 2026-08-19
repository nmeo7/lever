import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import { Plus } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchInventory, fetchInventoryMovements, adjustInventory } from './inventoryApi'
import { fetchProducts } from '@/products/productsApi'

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '—')

const AdjustInventoryModal = ({ open, onClose, products }) => {
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
			title='Adjust inventory'
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Save'
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='productId' label='Product' rules={[{ required: true, message: 'Product is required' }]}>
					<Select
						showSearch
						optionFilterProp='label'
						options={(products ?? []).map((p) => ({ value: p.id, label: p.name }))}
					/>
				</Form.Item>

				<Form.Item name='locationId' label='Location'>
					<Input placeholder='Optional' />
				</Form.Item>

				<Form.Item
					name='quantity'
					label='Quantity change'
					rules={[{ required: true, message: 'Quantity is required' }]}
					extra='Positive to add stock, negative to remove.'>
					<InputNumber step={1} className='w-full' />
				</Form.Item>

				<Form.Item name='reorderLevel' label='Reorder level'>
					<InputNumber min={0} step={1} className='w-full' />
				</Form.Item>

				<Form.Item name='notes' label='Notes'>
					<Input.TextArea rows={2} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const InventoryPage = () => {
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
			title='Inventory'
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl'
					style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
					<Plus size={14} strokeWidth={1.75} />
					Adjust stock
				</button>
			}>
			<div className='flex flex-col gap-8'>
				<div className='flex flex-col gap-3'>
					<h2 className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>Stock levels</h2>
					{isLoading ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
					) : !inventory?.length ? (
						<div
							className='rounded-2xl flex items-center justify-center h-32 text-sm'
							style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
							No inventory recorded yet
						</div>
					) : (
						<div className='rounded-xl overflow-hidden' style={{ border: '1px solid var(--color-border)' }}>
							<table className='w-full text-sm'>
								<thead>
									<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
										{['Product', 'Location', 'On hand', 'Reserved', 'Available', 'Reorder level'].map((col) => (
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
					<h2 className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>Recent movements</h2>
					{!movements?.length ? (
						<div
							className='rounded-2xl flex items-center justify-center h-32 text-sm'
							style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
							No movements yet
						</div>
					) : (
						<div className='rounded-xl overflow-hidden' style={{ border: '1px solid var(--color-border)' }}>
							<table className='w-full text-sm'>
								<thead>
									<tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
										{['Date', 'Product', 'Type', 'Quantity'].map((col) => (
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
