import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { Star } from 'lucide-react'
import { db } from '@/firebase'
import StaffLoginFooter from './StaffLoginFooter'

const usePublishedActs = companyId =>
	useQuery({
		queryKey: ['frontdesk-acts', companyId],
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

const ActCard = ({ act, whatsappUrl }) => {
	const { t } = useTranslation()
	return (
	<div
		className='rounded-2xl overflow-hidden flex flex-col'
		style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}>
		<img
			src={act.imageUrl ?? act.image}
			alt={act.name}
			className='w-full h-48 object-cover'
			style={{ background: 'var(--color-border)' }}
		/>
		<div className='flex flex-col gap-2 p-4'>
			<div className='flex items-center justify-between gap-2'>
				<p className='font-bold' style={{ color: 'var(--color-text)' }}>{act.name}</p>
				<span
					className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0'
					style={{ background: 'var(--color-background)', color: 'var(--color-primary)' }}>
					{act.category || t('salesPortal.talent', 'Talent')}
				</span>
			</div>
			{act.description && (
				<p className='text-sm leading-relaxed' style={{ color: 'var(--color-muted)' }}>
					{act.description}
				</p>
			)}
			<div className='flex items-center justify-between gap-3 mt-2'>
				<p className='text-sm font-bold' style={{ color: 'var(--color-primary)' }}>
					{t('salesPortal.fromPrice', 'From {{price}}', { price: formatCurrency(act.sellingPrice) })}
				</p>
				<a
					href={`${whatsappUrl}${encodeURIComponent(t('salesPortal.bookingRequestMessage', " — I'd like to book {{actName}}.", { actName: act.name }))}`}
					target='_blank'
					rel='noopener noreferrer'
					className='text-xs font-semibold px-3 py-2 rounded-xl transition-opacity hover:opacity-90'
					style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
					{t('salesPortal.requestBooking', 'Request booking')}
				</a>
			</div>
		</div>
	</div>
	)
}

const TalentTemplate = ({ org, whatsappUrl }) => {
	const { t } = useTranslation()
	const { data: acts = [] } = usePublishedActs(org?.id)
	const storeInfo = org?.frontdesk?.info ?? []
	const baseWhatsappUrl = whatsappUrl.split('?text=')[0] + '?text='

	const categories = [...new Set(acts.map(a => a.category).filter(Boolean))]

	return (
		<div className='flex flex-col gap-16'>
			<section className='text-center flex flex-col items-center gap-4 pt-24 pb-4 max-w-2xl mx-auto'>
				<span
					className='w-14 h-14 rounded-2xl flex items-center justify-center mb-2'
					style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
					<Star size={28} strokeWidth={2} />
				</span>
				<h1 className='text-4xl font-bold leading-tight' style={{ color: 'var(--color-text)' }}>
					{org?.frontdesk?.headline ?? t('salesPortal.bookTalentHeadline', 'Book talent through {{orgName}}', { orgName: org?.name ?? t('salesPortal.us', 'us') })}
				</h1>
				<p className='text-lg' style={{ color: 'var(--color-muted)' }}>
					{org?.frontdesk?.subheadline ?? t('salesPortal.browseRosterSubheadline', 'Browse our roster and request a booking directly.')}
				</p>
			</section>

			{categories.length > 1 && (
				<section className='flex flex-wrap justify-center gap-2 px-4 -mt-8'>
					{categories.map(category => (
						<span
							key={category}
							className='text-xs font-semibold px-3 py-1.5 rounded-full'
							style={{ background: 'var(--color-background)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
							{category}
						</span>
					))}
				</section>
			)}

			<section className='max-w-6xl mx-auto w-full px-4'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{acts.map(act => (
						<ActCard key={act.id} act={act} whatsappUrl={baseWhatsappUrl} />
					))}
				</div>
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

export default TalentTemplate
