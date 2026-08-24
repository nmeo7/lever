import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Form, Input, Select } from 'antd'
import Papa from 'papaparse'
import { Plus, Building2, Users, UserPlus, UploadCloud, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { useAuthStore } from '@/auth/store'
import { fetchGroups, createGroup, fetchCompaniesForGroup, createCompany, createCompanyPerson, batchUpsert } from './control-panel-api'
import { fetchRoles } from '@/people/peopleApi'

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

const NewPersonModal = ({ open, onClose, companySlug, groupId }) => {
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { data: roles } = useQuery({ queryKey: ['people-roles'], queryFn: fetchRoles, enabled: open })

	const { mutate: save, isPending, error } = useMutation({
		mutationFn: (values) => createCompanyPerson({ ...values, companySlug, groupId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['control-panel-companies', groupId] })
			form.resetFields()
			onClose()
		},
	})

	return (
		<Modal
			title={`New user · ${companySlug}`}
			open={open}
			onCancel={onClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText='Create'
			destroyOnHidden>
			<Form form={form} layout='vertical' className='pt-2' onFinish={(values) => save(values)}>
				<Form.Item name='name' label='Name' rules={[{ required: true, message: 'Name is required' }]}>
					<Input placeholder='e.g. Jane Doe' />
				</Form.Item>

				<Form.Item
					name='email'
					label='Email'
					rules={[
						{ required: true, message: 'Email is required' },
						{ type: 'email', message: 'Must be a valid email' },
					]}>
					<Input placeholder='e.g. jane@acme.com' />
				</Form.Item>

				<Form.Item name='password' label='Password' rules={[{ required: true, message: 'Password is required' }]}>
					<Input.Password placeholder='Temporary password' />
				</Form.Item>

				<Form.Item name='roleId' label='Role' rules={[{ required: true, message: 'Role is required' }]}>
					<Select placeholder='Select a role' options={roles?.map((roleId) => ({ value: roleId, label: roleId }))} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const CompanyCard = ({ company, groupId }) => {
	const [personModalOpen, setPersonModalOpen] = useState(false)

	return (
		<div className='neu-raised rounded-2xl p-4 transition-opacity hover:opacity-90'>
			<div className='flex items-center justify-between mb-2'>
				<div className='flex items-center gap-2.5'>
					<span
						className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border'
						style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
						<Building2 size={16} strokeWidth={2} />
					</span>
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{company.name}</p>
				</div>
				<button
					onClick={() => setPersonModalOpen(true)}
					title='Add user'
					className='flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<UserPlus size={13} strokeWidth={2} />
				</button>
			</div>
			<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{company.slug}</p>
			{company.contact?.whatsapp && (
				<p className='text-xs mt-2' style={{ color: 'var(--color-muted)' }}>WhatsApp: {company.contact.whatsapp}</p>
			)}

			<NewPersonModal
				open={personModalOpen}
				onClose={() => setPersonModalOpen(false)}
				companySlug={company.slug}
				groupId={groupId}
			/>
		</div>
	)
}

const GroupSection = ({ group }) => {
	const [modalOpen, setModalOpen] = useState(false)

	const { data: companies, isLoading } = useQuery({
		queryKey: ['control-panel-companies', group.id],
		queryFn: () => fetchCompaniesForGroup(group.id),
	})

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2.5'>
					<span
						className='flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border'
						style={{ borderColor: 'var(--color-border)', color: 'var(--color-secondary)' }}>
						<Users size={14} strokeWidth={2} />
					</span>
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{group.name}</p>
				</div>
				<button
					onClick={() => setModalOpen(true)}
					className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<Plus size={12} strokeWidth={2} />
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
						<CompanyCard key={company.slug} company={company} groupId={group.id} />
					))}
				</div>
			)}

			<NewCompanyModal open={modalOpen} onClose={() => setModalOpen(false)} groupId={group.id} />
		</div>
	)
}

const BATCH_ENTITIES = [
	{ value: 'groups', label: 'Groups', columns: ['id', 'name', 'description'] },
	{ value: 'companies', label: 'Companies', columns: ['slug', 'name', 'groupId'] },
	{ value: 'people', label: 'Users', columns: ['name', 'email', 'roleId', 'companyIds', 'password'] },
]

const BulkImportPanel = () => {
	const [entity, setEntity] = useState('groups')
	const [fileName, setFileName] = useState('')
	const [rows, setRows] = useState([])
	const [dragOver, setDragOver] = useState(false)
	const [result, setResult] = useState(null)

	const entityDef = BATCH_ENTITIES.find((option) => option.value === entity)

	const { mutate: commit, isPending, error } = useMutation({
		mutationFn: batchUpsert,
		onSuccess: (data) => setResult(data),
	})

	const parseFile = (file) => {
		if (!file) return
		setResult(null)
		setFileName(file.name)

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: ({ data }) => setRows(data),
		})
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
		<div className='rounded-2xl p-5 border' style={{ borderColor: 'var(--color-border)' }}>
			<div className='flex items-center gap-2.5 mb-4'>
				<span
					className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<UploadCloud size={16} strokeWidth={2} />
				</span>
				<div>
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>Bulk import</p>
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Create or update groups, companies, and users from a CSV</p>
				</div>
			</div>

			<div className='flex items-center gap-2 flex-wrap mb-3'>
				{BATCH_ENTITIES.map((option) => (
					<button
						key={option.value}
						onClick={() => { setEntity(option.value); reset() }}
						className='text-xs font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
						style={{
							borderColor: 'var(--color-border)',
							color: entity === option.value ? 'var(--color-bg)' : 'var(--color-text)',
							backgroundColor: entity === option.value ? 'var(--color-primary)' : 'transparent',
						}}>
						{option.label}
					</button>
				))}
			</div>

			<p className='text-xs mb-3' style={{ color: 'var(--color-muted)' }}>
				Expected columns: {entityDef.columns.join(', ')}
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
						onClick={() => commit({ entity, rows })}
						disabled={isPending}
						className='self-start flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-opacity hover:opacity-90'
						style={{ borderColor: 'var(--color-border)', color: 'var(--color-bg)', backgroundColor: 'var(--color-primary)', opacity: isPending ? 0.6 : 1 }}>
						{isPending ? 'Importing…' : `Import ${rows.length} ${entityDef.label.toLowerCase()}`}
					</button>
				</div>
			)}

			{error && (
				<p className='text-xs mt-3' style={{ color: '#dc2626' }}>{error.message}</p>
			)}

			{result && (
				<div className='flex flex-col gap-1.5 mt-3'>
					<p className='flex items-center gap-1.5 text-xs' style={{ color: 'var(--color-text)' }}>
						<CheckCircle2 size={14} strokeWidth={2} style={{ color: '#16a34a' }} />
						Upserted {result.count} {entityDef.label.toLowerCase()}
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
							className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
							style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
							<Plus size={14} strokeWidth={2} />
							New standalone company
						</button>
						<button
							onClick={() => setGroupModalOpen(true)}
							className='flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-opacity hover:opacity-90'
							style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
							<Plus size={14} strokeWidth={2} />
							New group
						</button>
					</>
				)
			}>
			{user?.isPlatformAdmin && <BulkImportPanel />}

			{isLoading ? (
				<p className='text-sm mt-6' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : !groups?.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-48 text-sm mt-6'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					No groups to manage
				</div>
			) : (
				<div className='flex flex-col gap-8 mt-6'>
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
