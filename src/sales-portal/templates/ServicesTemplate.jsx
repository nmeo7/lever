import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { ShieldCheck, Check } from 'lucide-react'
import { db } from '@/firebase'
import StaffLoginFooter from './StaffLoginFooter'

const usePublishedPlans = companyId =>
	useQuery({
		queryKey: ['frontdesk-plans', companyId],
		queryFn: async () => {
			const snap = await getDocs(
				query(
					collection(db, 'erp-products'),
					where('companyId', '==', companyId),
					where('published', '==', true),
				),
			)
			return snap.docs.map(d => ({ id: d.id, ...d.data() }))
		},
		enabled: !!companyId,
	})

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(amount ?? 0)

const PlanCard = ({ plan, whatsappUrl, highlighted }) => {
	const { t } = useTranslation()
	return (
	<div
		className='rounded-2xl p-6 flex flex-col gap-4'
		style={{
			background: highlighted ? 'var(--color-primary)' : 'var(--color-surface)',
			border: `2px solid ${highlighted ? 'var(--color-primary)' : 'var(--color-border)'}`,
		}}>
		<div>
			<p
				className='text-xs font-semibold uppercase tracking-widest mb-1'
				style={{ color: highlighted ? 'rgba(255,255,255,0.85)' : 'var(--color-muted)' }}>
				{plan.category || t('salesPortal.plan', 'Plan')}
			</p>
			<h3
				className='text-xl font-bold'
				style={{ color: highlighted ? '#ffffff' : 'var(--color-text)' }}>
				{plan.name}
			</h3>
		</div>

		<p
			className='text-3xl font-bold'
			style={{ color: highlighted ? '#ffffff' : 'var(--color-primary)' }}>
			{formatCurrency(plan.sellingPrice)}
			<span
				className='text-sm font-medium ml-1'
				style={{ color: highlighted ? 'rgba(255,255,255,0.7)' : 'var(--color-muted)' }}>
				/ {plan.billingPeriod ?? t('salesPortal.planLowercase', 'plan')}
			</span>
		</p>

		{plan.description && (
			<p
				className='text-sm leading-relaxed flex items-start gap-2'
				style={{ color: highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-muted)' }}>
				<Check size={16} strokeWidth={2.5} className='flex-shrink-0 mt-0.5' />
				{plan.description}
			</p>
		)}

		<a
			href={`${whatsappUrl}${encodeURIComponent(t('salesPortal.quoteRequestMessage', " — I'd like a quote for {{planName}}.", { planName: plan.name }))}`}
			target='_blank'
			rel='noopener noreferrer'
			className='mt-auto text-center text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90'
			style={{
				background: highlighted ? '#ffffff' : 'var(--color-primary)',
				color: highlighted ? 'var(--color-primary)' : '#ffffff',
			}}>
			{t('salesPortal.requestAQuote', 'Request a quote')}
		</a>
	</div>
	)
}

const QuoteForm = ({ whatsappNumber }) => {
	const { t } = useTranslation()
	const [name, setName] = useState('')
	const [need, setNeed] = useState('')

	const handleSubmit = e => {
		e.preventDefault()
		const message = t(
			'salesPortal.quoteFormMessage',
			"Hi! My name is {{name}}. I'd like a quote for: {{need}}.",
			{ name: name || t('salesPortal.aVisitor', 'a visitor'), need: need || t('salesPortal.yourServices', 'your services') },
		)
		window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank')
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='rounded-2xl p-6 flex flex-col gap-3 max-w-md mx-auto w-full'
			style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}>
			<h3 className='text-lg font-bold' style={{ color: 'var(--color-text)' }}>
				{t('salesPortal.notSureWhatYouNeed', 'Not sure what you need?')}
			</h3>
			<input
				value={name}
				onChange={e => setName(e.target.value)}
				placeholder={t('salesPortal.yourNamePlaceholder', 'Your name')}
				className='text-sm rounded-xl px-4 py-2.5 outline-none'
				style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
			/>
			<textarea
				value={need}
				onChange={e => setNeed(e.target.value)}
				placeholder={t('salesPortal.tellUsWhatYouNeed', 'Tell us what you need coverage or help with')}
				rows={3}
				className='text-sm rounded-xl px-4 py-2.5 outline-none resize-none'
				style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
			/>
			<button
				type='submit'
				className='text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90'
				style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
				{t('salesPortal.getQuoteOnWhatsapp', 'Get a quote on WhatsApp')}
			</button>
		</form>
	)
}

const ServicesTemplate = ({ org, whatsapp, whatsappUrl }) => {
	const { t } = useTranslation()
	const { data: plans = [] } = usePublishedPlans(org?.id)
	const storeInfo = org?.frontdesk?.info ?? []
	const baseWhatsappUrl = whatsappUrl.split('?text=')[0] + '?text='

	return (
		<div className='flex flex-col gap-20'>
			<section className='text-center flex flex-col items-center gap-4 pt-24 pb-4 max-w-2xl mx-auto'>
				<span
					className='w-14 h-14 rounded-2xl flex items-center justify-center mb-2'
					style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
					<ShieldCheck size={28} strokeWidth={2} />
				</span>
				<h1 className='text-4xl font-bold leading-tight' style={{ color: 'var(--color-text)' }}>
					{org?.frontdesk?.headline ?? t('salesPortal.protectionHeadline', 'Protection and peace of mind from {{orgName}}', { orgName: org?.name ?? t('salesPortal.us', 'us') })}
				</h1>
				<p className='text-lg' style={{ color: 'var(--color-muted)' }}>
					{org?.frontdesk?.subheadline ?? t('salesPortal.comparePlansSubheadline', "Compare our plans below, or tell us what you need and we'll recommend one.")}
				</p>
			</section>

			{plans.length > 0 && (
				<section className='max-w-5xl mx-auto w-full px-4'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'>
						{plans.map((plan, index) => (
							<PlanCard
								key={plan.id}
								plan={plan}
								whatsappUrl={baseWhatsappUrl}
								highlighted={index === Math.floor(plans.length / 2)}
							/>
						))}
					</div>
				</section>
			)}

			<section className='px-4'>
				<QuoteForm whatsappNumber={whatsapp.replace(/\D/g, '')} />
			</section>

			{storeInfo.length > 0 && (
				<section className='flex flex-wrap justify-center gap-x-6 gap-y-2 px-4'>
					{storeInfo.map(({ icon, text }) => (
						<div key={text} className='flex items-center gap-1.5'>
							<span className='text-sm leading-none'>{icon}</span>
							<span className='text-xs' style={{ color: 'var(--color-muted)' }}>{text}</span>
						</div>
					))}
				</section>
			)}

			<StaffLoginFooter />
		</div>
	)
}

export default ServicesTemplate
