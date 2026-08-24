import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Modal, Form, Input, Select } from 'antd'
import { Plus, UserRound } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchPeople, fetchRoles, createPerson, updatePerson } from './peopleApi'

const ROLE_LABEL_KEYS = {
	admin: 'people.roles.admin',
	manager: 'people.roles.manager',
	employee: 'people.roles.employee',
	viewer: 'people.roles.viewer',
}

const ROLE_LABELS = {
	admin: 'Admin',
	manager: 'Manager',
	employee: 'Employee',
	viewer: 'Viewer',
}

const roleLabel = (id, t) => t(ROLE_LABEL_KEYS[id] ?? id, ROLE_LABELS[id] ?? id)

const AddPersonModal = ({ open, onClose, roles }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate: save, isPending, error, reset } = useMutation({
		mutationFn: createPerson,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['people'] })
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
			title={t('people.addTeamMember', 'Add team member')}
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('common.add', 'Add')}
			destroyOnHidden>
			<Form form={form} layout='vertical' className='pt-2' onFinish={(values) => save(values)}>
				<Form.Item name='name' label={t('common.name', 'Name')} rules={[{ required: true, message: t('people.nameRequired', 'Name is required') }]}>
					<Input placeholder={t('people.namePlaceholder', 'e.g. Alice Uwase')} />
				</Form.Item>

				<Form.Item
					name='email'
					label={t('auth.email', 'Email')}
					rules={[
						{ required: true, message: t('people.emailRequired', 'Email is required') },
						{ type: 'email', message: t('people.emailInvalid', 'Must be a valid email') },
					]}>
					<Input placeholder={t('people.emailPlaceholder', 'e.g. alice@company.com')} />
				</Form.Item>

				<Form.Item name='password' label={t('people.temporaryPassword', 'Temporary password')} rules={[{ required: true, message: t('people.passwordRequired', 'Password is required') }]}>
					<Input.Password />
				</Form.Item>

				<Form.Item name='roleId' label={t('people.role', 'Role')} initialValue='employee' rules={[{ required: true }]}>
					<Select options={(roles ?? []).map((id) => ({ value: id, label: roleLabel(id, t) }))} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const PersonRow = ({ person, roles }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const { mutate: save } = useMutation({
		mutationFn: updatePerson,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people'] }),
	})

	return (
		<div
			className='rounded-2xl p-4 flex items-center justify-between gap-4 border'
			style={{ borderColor: 'var(--color-border)' }}>
			<div className='flex items-center gap-3 min-w-0'>
				<span
					className='flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<UserRound size={16} strokeWidth={2} />
				</span>
				<div className='min-w-0'>
					<p className='text-sm font-semibold truncate' style={{ color: 'var(--color-text)' }}>{person.name}</p>
					<p className='text-xs truncate' style={{ color: 'var(--color-muted)' }}>{person.email}</p>
				</div>
			</div>

			<div className='flex items-center gap-3 flex-shrink-0'>
				<Select
					size='small'
					value={person.roleId}
					onChange={(roleId) => save({ id: person.id, roleId })}
					options={(roles ?? []).map((id) => ({ value: id, label: roleLabel(id, t) }))}
					className='w-28'
				/>
				<button
					onClick={() => save({ id: person.id, isActive: !person.isActive })}
					className='text-xs font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
					style={{
						borderColor: 'var(--color-border)',
						color: person.isActive ? 'var(--color-primary)' : 'var(--color-muted)',
					}}>
					{person.isActive ? t('people.active', 'Active') : t('people.inactive', 'Inactive')}
				</button>
			</div>
		</div>
	)
}

const PeoplePage = () => {
	const { t } = useTranslation()
	const [modalOpen, setModalOpen] = useState(false)

	const { data: people, isLoading } = useQuery({
		queryKey: ['people'],
		queryFn: fetchPeople,
	})

	const { data: roles } = useQuery({
		queryKey: ['people-roles'],
		queryFn: fetchRoles,
	})

	return (
		<PageShell
			title={t('people.title', 'People')}
			actions={
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<Plus size={14} strokeWidth={2} />
					{t('people.addTeamMember', 'Add team member')}
				</button>
			}>
			{isLoading ? (
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
			) : !people?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					{t('people.emptyState', 'No team members yet')}
				</div>
			) : (
				<div className='flex flex-col gap-3'>
					{people.map((person) => (
						<PersonRow key={person.id} person={person} roles={roles} />
					))}
				</div>
			)}

			<AddPersonModal open={modalOpen} onClose={() => setModalOpen(false)} roles={roles} />
		</PageShell>
	)
}

export default PeoplePage
