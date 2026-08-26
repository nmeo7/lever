import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, Input, Select, QRCode } from 'antd'
import { QrCode } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchCompanyContact, updateCompanyContact } from './org-settings-api'

const QR_TYPES = [
	{ value: 'whatsapp', label: 'WhatsApp message' },
	{ value: 'momo', label: 'MoMo payment' },
	{ value: 'url', label: 'Website URL' },
]

const buildQrValue = ({ type, whatsapp, momo, url }) => {
	if (type === 'whatsapp') return whatsapp ? `https://wa.me/${whatsapp}` : ''
	if (type === 'momo') return momo ? `tel:*182*8*1*${momo}#` : ''
	return url ?? ''
}

const ContactForm = ({ contact, onSaved }) => {
	const [form] = Form.useForm()

	const { mutate: save, isPending, error } = useMutation({
		mutationFn: updateCompanyContact,
		onSuccess: onSaved,
	})

	return (
		<div className='rounded-2xl p-5 border' style={{ borderColor: 'var(--color-border)' }}>
			<p className='text-sm font-semibold mb-3' style={{ color: 'var(--color-text)' }}>Contact details</p>
			<Form
				form={form}
				layout='vertical'
				initialValues={contact}
				onFinish={values => save(values)}
				className='max-w-md'>
				<Form.Item name='whatsapp' label='WhatsApp number'>
					<Input placeholder='e.g. 250780000000' />
				</Form.Item>
				<Form.Item name='momo' label='MoMo merchant/till code'>
					<Input placeholder='e.g. 123456' />
				</Form.Item>
				{error && <p className='text-xs mb-2' style={{ color: '#dc2626' }}>{error.message}</p>}
				<button
					onClick={() => form.submit()}
					disabled={isPending}
					className='text-sm font-semibold px-4 py-2 rounded-full border transition-opacity hover:opacity-90'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-bg)', backgroundColor: 'var(--color-primary)', opacity: isPending ? 0.6 : 1 }}>
					{isPending ? 'Saving…' : 'Save'}
				</button>
			</Form>
		</div>
	)
}

const QrPanel = ({ contact }) => {
	const [type, setType] = useState('whatsapp')
	const [url, setUrl] = useState('')
	const value = buildQrValue({ type, whatsapp: contact.whatsapp, momo: contact.momo, url })

	return (
		<div className='rounded-2xl p-5 border' style={{ borderColor: 'var(--color-border)' }}>
			<div className='flex items-center gap-2.5 mb-4'>
				<span
					className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border'
					style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
					<QrCode size={16} strokeWidth={2} />
				</span>
				<div>
					<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>QR code generator</p>
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Generate a QR code for MoMo payment, WhatsApp, or a URL</p>
				</div>
			</div>

			<div className='flex flex-col gap-3 max-w-md'>
				<Select value={type} onChange={setType} options={QR_TYPES} />

				{type === 'url' && (
					<Input value={url} onChange={e => setUrl(e.target.value)} placeholder='https://example.com' />
				)}
				{type === 'whatsapp' && !contact.whatsapp && (
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Set a WhatsApp number above to generate this QR code.</p>
				)}
				{type === 'momo' && !contact.momo && (
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>Set a MoMo merchant/till code above to generate this QR code.</p>
				)}

				{value && (
					<div className='flex justify-center rounded-xl p-4 border' style={{ borderColor: 'var(--color-border)' }}>
						<QRCode value={value} size={160} bordered={false} />
					</div>
				)}
			</div>
		</div>
	)
}

const SettingsPage = () => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const { data: contact, isLoading } = useQuery({
		queryKey: ['org-settings-contact'],
		queryFn: fetchCompanyContact,
	})

	const [localContact, setLocalContact] = useState({})

	useEffect(() => {
		if (contact?.contact) setLocalContact(contact.contact)
	}, [contact])

	return (
		<PageShell title={t('settings.title', 'Settings')}>
			{isLoading ? (
				<p className='text-sm mt-6' style={{ color: 'var(--color-muted)' }}>Loading…</p>
			) : (
				<div className='flex flex-col gap-6 mt-6'>
					<ContactForm
						contact={localContact}
						onSaved={updated => {
							setLocalContact(updated.contact)
							queryClient.setQueryData(['org-settings-contact'], updated)
						}}
					/>
					<QrPanel contact={localContact} />
				</div>
			)}
		</PageShell>
	)
}

export default SettingsPage
