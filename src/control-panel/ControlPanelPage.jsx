import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input } from 'antd'
import { Plus, Building2, Users } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { useAuthStore } from '@/auth/store'
import { fetchGroups, createGroup, fetchCompaniesForGroup, createCompany } from './control-panel-api'

const NewGroupModal = ({ open, onClose }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending, error } = useMutation({
		mutationFn: createGroup,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['control-panel-groups'] })
			form.resetFields()
			onClose()
		},
	})

	return (
		<Modal
			title='New group'
			open={open}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Create'
			destroyOnHidden>
			<Form form={form} layout='vertical' className='pt-2' onFinish={(values) => save(values)}>
				<Form.Item
					name='id'
					label='ID'
					rules={[
						{ required: true, message: 'ID is required' },
						{ pattern: /^[a-z0-9-]+$/, message: 'Lowercase letters, numbers, and hyphens only' },
					]}>
					<Input placeholder='e.g. artists-hub' />
				</Form.Item>

				<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Name is required' }]}>
					<Input placeholder='e.g. Kigali Artists Hub' />
				</Form.Item>

				<Form.Item name='description' label='Description'>
					<Input.TextArea placeholder='What this group is about' />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const NewCompanyModal = ({ open, onClose, groupId }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending, error } = useMutation({
		mutationFn: (values) => createCompany({ ...values, groupId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['control-panel-companies', groupId] })
			form.resetFields()
			onClose()
		},
	})

	return (
		<Modal
			title='New company'
			open={open}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Create'
			destroyOnHidden>
			<Form form={form} layout='vertical' className='pt-2' onFinish={(values) => save(values)}>
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

const CompanyCard = ({ company }) => (
	<div
		className='rounded-2xl p-4'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<div className='flex items-center gap-2 mb-1'>
			<Building2 size={15} strokeWidth={1.75} style={{ color: 'var(--color-muted)' }} />
			<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{company.name}</p>
		</div>
		<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{company.slug}</p>
		{company.contact?.whatsapp && (
			<p className='text-xs mt-2' style={{ color: 'var(--color-muted)' }}>WhatsApp: {company.contact.whatsapp}</p>
		)}
	</div>
)

const GroupSection = ({ group }) => {
	const [modalOpen, setModalOpen] = useState(false)

	const { data: companies, isLoading } = useQuery({
		queryKey: ['control-panel-companies', group.id],
		queryFn: () => fetchCompaniesForGroup(group.id),
	})

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Users size={16} strokeWidth={1.75} style={{ color: 'var(--color-muted)' }} />
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{group.name}</p>
				</div>
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl'
					style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
					<Plus size={12} strokeWidth={1.75} />
					New company
				</button>
			</div>

			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !companies?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-32 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No companies yet
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
					{companies.map((company) => (
						<CompanyCard key={company.slug} company={company} />
					))}
				</div>
			)}

			<NewCompanyModal open={modalOpen} onClose={() => setModalOpen(false)} groupId={group.id} />
		</div>
	)
}

const ControlPanelPage = () => {
	const [groupModalOpen, setGroupModalOpen] = useState(false)
	const [standaloneModalOpen, setStandaloneModalOpen] = useState(false)
	const user = useAuthStore((s) => s.user)

	const { data: groups, isLoading } = useQuery({
		queryKey: ['control-panel-groups'],
		queryFn: fetchGroups,
	})

	return (
		<PageShell
			title='Control Panel'
			actions={
				user?.isPlatformAdmin && (
					<>
						<button
							onClick={() => setStandaloneModalOpen(true)}
							className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl'
							style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
							<Plus size={14} strokeWidth={1.75} />
							New standalone company
						</button>
						<button
							onClick={() => setGroupModalOpen(true)}
							className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl'
							style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
							<Plus size={14} strokeWidth={1.75} />
							New group
						</button>
					</>
				)
			}>
			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !groups?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No groups to manage
				</div>
			) : (
				<div className='flex flex-col gap-8'>
					{groups.map((group) => (
						<GroupSection key={group.id} group={group} />
					))}
				</div>
			)}

			<NewGroupModal open={groupModalOpen} onClose={() => setGroupModalOpen(false)} />
			<NewCompanyModal open={standaloneModalOpen} onClose={() => setStandaloneModalOpen(false)} groupId={null} />
		</PageShell>
	)
}

export default ControlPanelPage
