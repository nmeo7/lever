import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input } from 'antd'
import { Plus, Building2 } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchTenants, createTenant } from './tenantsApi'

const NewTenantModal = ({ open, onClose }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending, error } = useMutation({
		mutationFn: createTenant,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tenants'] })
			form.resetFields()
			onClose()
		},
	})

	return (
		<Modal
			title='New tenant'
			open={open}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Create'
			destroyOnHidden>
			<Form
				form={form}
				layout='vertical'
				className='pt-2'
				onFinish={(values) => save(values)}>
				<Form.Item
					name='slug'
					label='Slug'
					rules={[
						{ required: true, message: 'Slug is required' },
						{ pattern: /^[a-z0-9-]+$/, message: 'Lowercase letters, numbers, and hyphens only' },
					]}>
					<Input placeholder='e.g. acme-corp' />
				</Form.Item>

				<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Name is required' }]}>
					<Input placeholder='e.g. Acme Corp' />
				</Form.Item>

				<Form.Item name={['contact', 'whatsapp']} label='WhatsApp contact'>
					<Input placeholder='e.g. 15550006006' />
				</Form.Item>

				<Form.Item
					name='adminEmail'
					label='Admin email'
					rules={[
						{ required: true, message: 'Admin email is required' },
						{ type: 'email', message: 'Must be a valid email' },
					]}>
					<Input placeholder='e.g. admin@acme.com' />
				</Form.Item>

				<Form.Item
					name='adminPassword'
					label='Admin password'
					rules={[{ required: true, message: 'Admin password is required' }]}>
					<Input.Password placeholder='Temporary password' />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const TenantCard = ({ tenant }) => (
	<div
		className='rounded-2xl p-4'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<div className='flex items-center gap-2 mb-1'>
			<Building2 size={15} strokeWidth={1.75} style={{ color: 'var(--color-muted)' }} />
			<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{tenant.name}</p>
		</div>
		<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{tenant.slug}</p>
		{tenant.contact?.whatsapp && (
			<p className='text-xs mt-2' style={{ color: 'var(--color-muted)' }}>WhatsApp: {tenant.contact.whatsapp}</p>
		)}
	</div>
)

const TenantsPage = () => {
	const [modalOpen, setModalOpen] = useState(false)

	const { data: tenants, isLoading } = useQuery({
		queryKey: ['tenants'],
		queryFn: fetchTenants,
	})

	return (
		<PageShell
			title='Tenants'
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl'
					style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
					<Plus size={14} strokeWidth={1.75} />
					New tenant
				</button>
			}>
			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !tenants?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No tenants yet
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
					{tenants.map((tenant) => (
						<TenantCard key={tenant.slug} tenant={tenant} />
					))}
				</div>
			)}

			<NewTenantModal open={modalOpen} onClose={() => setModalOpen(false)} />
		</PageShell>
	)
}

export default TenantsPage
