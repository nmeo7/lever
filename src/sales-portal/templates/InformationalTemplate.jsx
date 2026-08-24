import { useTranslation } from 'react-i18next'
import StaffLoginFooter from './StaffLoginFooter'

const InformationalTemplate = ({ org, whatsapp, whatsappUrl }) => {
	const { t } = useTranslation()
	const categories = org?.frontdesk?.categories ?? []
	const storeInfo = org?.frontdesk?.info ?? []

	return (
		<div className='flex flex-col gap-20'>
			<section className='text-center flex flex-col items-center gap-5 pt-24 pb-4 max-w-2xl mx-auto'>
				{org?.frontdesk?.heroImage && (
					<img
						src={org.frontdesk.heroImage}
						alt={org?.name ?? t('salesPortal.ourOrganization', 'Our organization')}
						className='w-full max-w-2xl rounded-3xl object-cover'
						style={{ maxHeight: '320px' }}
					/>
				)}
				<h1 className='text-4xl font-bold leading-tight' style={{ color: 'var(--color-text)' }}>
					{org?.frontdesk?.headline ?? (org?.name ?? t('salesPortal.welcome', 'Welcome'))}
				</h1>
				<p className='text-lg max-w-xl' style={{ color: 'var(--color-muted)' }}>
					{org?.frontdesk?.subheadline ?? t('salesPortal.learnMoreSubheadline', 'Learn more about what we do and how to reach us.')}
				</p>
			</section>

			{categories.length > 0 && (
				<section className='max-w-4xl mx-auto w-full px-4'>
					<h2 className='text-xl font-bold text-center mb-8' style={{ color: 'var(--color-text)' }}>
						{t('salesPortal.whatWeOffer', 'What we offer')}
					</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
						{categories.map(category => (
							<div
								key={category.label}
								className='rounded-2xl overflow-hidden flex items-center gap-4 p-4'
								style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}>
								{category.image && (
									<img
										src={category.image}
										alt={category.label}
										className='w-16 h-16 rounded-xl object-cover flex-shrink-0'
									/>
								)}
								<p className='font-semibold' style={{ color: 'var(--color-text)' }}>
									{category.label}
								</p>
							</div>
						))}
					</div>
				</section>
			)}

			<section className='max-w-xl mx-auto w-full px-4 text-center flex flex-col items-center gap-4'>
				<h2 className='text-xl font-bold' style={{ color: 'var(--color-text)' }}>
					{t('salesPortal.getInTouch', 'Get in touch')}
				</h2>
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>
					{t('salesPortal.reachOutSubtext', "Reach out and we'll respond as soon as we can.")}
				</p>
				<a
					href={whatsappUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='text-sm font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90'
					style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
					{t('salesPortal.messageUsOnWhatsapp', 'Message us on WhatsApp ({{whatsapp}})', { whatsapp })}
				</a>
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

export default InformationalTemplate
