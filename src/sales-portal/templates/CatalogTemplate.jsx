import { useState, useRef, useEffect } from 'react'
import { QRCode } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { CartTray } from '@/util/layouts/PortalLayout'
import StaffLoginFooter from './StaffLoginFooter'

const usePublishedProducts = companyId =>
	useQuery({
		queryKey: ['frontdesk-products', companyId],
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
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(
		amount ?? 0,
	)

const ProductCard = ({ product }) => {
	const navigate = useNavigate()
	const { orgSlug } = useParams()
	return (
		<button
			onClick={() => navigate(`/${orgSlug}/products/${product.id}`)}
			className='relative rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-[0.98] w-full h-full p-2'
			style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)' }}>
			<img
				src={product.imageUrl ?? product.image}
				alt={product.name}
				className='w-full h-2/3 object-cover rounded-xl'
				style={{ background: 'var(--color-border)' }}
			/>
			<div className='flex flex-col gap-0.5 px-1 pt-2'>
				<p
					className='font-semibold text-sm truncate'
					style={{ color: 'var(--color-text)' }}>
					{product.name}
				</p>
				<p
					className='text-sm font-bold'
					style={{ color: 'var(--color-primary)' }}>
					{formatCurrency(product.sellingPrice)}
				</p>
			</div>
		</button>
	)
}

const HeroSearch = ({ products, whatsappUrl }) => {
	const { t } = useTranslation()
	const [input, setInput] = useState('')
	const navigate = useNavigate()
	const { orgSlug } = useParams()
	const inputRef = useRef(null)

	const trimmed = input.trim().toLowerCase()
	const results = trimmed
		? products.filter(
				p =>
					p.name?.toLowerCase().includes(trimmed) ||
					p.description?.toLowerCase().includes(trimmed) ||
					p.category?.toLowerCase().includes(trimmed),
			)
		: []

	const showDropdown = trimmed.length > 0

	const handleSubmit = e => {
		e.preventDefault()
		if (!input.trim()) return
		navigate(`/${orgSlug}/chat?q=${encodeURIComponent(input.trim())}`)
		setInput('')
	}

	return (
		<div className='relative w-full max-w-xl'>
			<form onSubmit={handleSubmit}>
				<div
					className='flex items-center gap-3 rounded-2xl px-5 py-4'
					style={{ background: 'var(--color-primary)' }}>
					<svg
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						style={{ color: '#ffffff', flexShrink: 0, opacity: 0.85 }}>
						<circle cx='11' cy='11' r='8' />
						<path d='m21 21-4.35-4.35' />
					</svg>
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder={t('salesPortal.heroSearchPlaceholder', 'What can we help you find today?')}
						className='flex-1 text-sm bg-transparent outline-none placeholder-white/70'
						style={{ color: '#ffffff' }}
					/>
					{whatsappUrl && (
						<a
							href={whatsappUrl}
							target='_blank'
							rel='noopener noreferrer'
							title={t('salesPortal.chatOnWhatsapp', 'Chat on WhatsApp')}
							className='flex-shrink-0 transition-opacity opacity-60 hover:opacity-100'
							style={{ color: '#25D366' }}>
							<svg
								width='18'
								height='18'
								viewBox='0 0 24 24'
								fill='currentColor'>
								<path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
							</svg>
						</a>
					)}
				</div>
			</form>

			{showDropdown && (
				<div
					className='absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-10 flex flex-col'
					style={{
						background: 'var(--color-surface)',
						border: '2px solid var(--color-border)',
					}}>
					{results.length === 0 ? (
						<div
							className='px-5 py-4 text-sm flex items-center justify-between gap-4'
							style={{ color: 'var(--color-muted)' }}>
							<span>{t('salesPortal.noProductsFoundFor', 'No products found for "{{query}}"', { query: input })}</span>
							{whatsappUrl && (
								<a
									href={`https://wa.me/${whatsappUrl.split('wa.me/')[1]?.split('?')[0]}?text=${encodeURIComponent(t('salesPortal.whatsappAvailabilityQuery', 'Hi! Do you have "{{query}}" available?', { query: input }))}`}
									target='_blank'
									rel='noopener noreferrer'
									className='text-xs font-medium flex-shrink-0 transition-opacity hover:opacity-70'
									style={{ color: '#25D366' }}>
									{t('salesPortal.askOnWhatsapp', 'Ask on WhatsApp →')}
								</a>
							)}
						</div>
					) : (
						results.slice(0, 6).map(p => (
							<button
								key={p.id}
								onClick={() => {
									navigate(`/${orgSlug}/products/${p.id}`)
									setInput('')
								}}
								className='px-5 py-3 text-left flex items-center justify-between gap-4 transition-opacity hover:opacity-70'
								style={{
									borderBottom: '1px solid var(--color-border)',
									color: 'var(--color-text)',
								}}>
								<span className='text-sm'>{p.name}</span>
								<span
									className='text-xs font-semibold flex-shrink-0'
									style={{ color: 'var(--color-primary)' }}>
									{formatCurrency(p.sellingPrice)}
								</span>
							</button>
						))
					)}
				</div>
			)}
		</div>
	)
}

const MiniSearch = ({ products }) => {
	const { t } = useTranslation()
	const [input, setInput] = useState('')
	const navigate = useNavigate()
	const { orgSlug } = useParams()

	const trimmed = input.trim().toLowerCase()
	const results = trimmed
		? products.filter(
				p =>
					p.name?.toLowerCase().includes(trimmed) ||
					p.category?.toLowerCase().includes(trimmed),
			)
		: []

	const handleKeyDown = e => {
		if (e.key === 'Enter' && input.trim()) {
			navigate(`/${orgSlug}/chat?q=${encodeURIComponent(input.trim())}`)
			setInput('')
		}
	}

	return (
		<div className='relative flex-1 max-w-xs'>
			<input
				type='text'
				value={input}
				onChange={e => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={t('salesPortal.searchProductsPlaceholder', 'Search products')}
				className='w-full text-xs rounded-xl px-3 py-1.5 outline-none placeholder-white/70'
				style={{ background: 'var(--color-primary)', color: '#ffffff' }}
			/>
			{trimmed && (
				<div
					className='absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-10 flex flex-col'
					style={{
						background: 'var(--color-surface)',
						border: '2px solid var(--color-border)',
					}}>
					{results.length === 0 ? (
						<p
							className='px-4 py-2 text-lg'
							style={{ color: 'var(--color-muted)' }}>
							{t('products.emptyState', 'No products found')}
						</p>
					) : (
						results.slice(0, 6).map(p => (
							<button
								key={p.id}
								onClick={() => {
									navigate(`/${orgSlug}/products/${p.id}`)
									setInput('')
								}}
								className='px-4 py-2 text-left text-lg transition-opacity hover:opacity-70'
								style={{ color: 'var(--color-text)' }}>
								{p.name}
							</button>
						))
					)}
				</div>
			)}
		</div>
	)
}

const buildSections = (categories, products, featuredLabel) => {
	const featuredSection = {
		label: featuredLabel,
		image: categories[0]?.image,
		products,
	}

	const categorySections = categories.map(cat => ({
		...cat,
		products: products.filter(
			p => p.category?.toLowerCase() === cat.label.toLowerCase(),
		),
	}))

	return [featuredSection, ...categorySections].filter(
		s => s.products.length > 0,
	)
}

const CategoryPanel = ({ category, isActive, onClick, panelRef }) => (
	<button
		ref={panelRef}
		onClick={onClick}
		className='relative flex-shrink-0 rounded-2xl overflow-hidden transition-all h-24 w-36 p-1'
		style={{
			background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
			border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
		}}>
		{category.image && (
			<img
				src={category.image}
				alt={category.label}
				className='absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] object-cover rounded-xl'
			/>
		)}
		{category.image && (
			<div
				className='absolute inset-1 rounded-xl'
				style={{
					background:
						'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.1))',
				}}
			/>
		)}
		<p
			className='absolute bottom-0 left-0 right-0 text-xs font-semibold p-2'
			style={{
				color: category.image || isActive ? '#fff' : 'var(--color-text)',
			}}>
			{category.label}
		</p>
	</button>
)

const CategorySection = ({ section, sectionRef }) => (
	<div ref={sectionRef} className='flex flex-col gap-3 scroll-mt-40'>
		<h2 className='text-lg font-bold' style={{ color: 'var(--color-text)' }}>
			{section.label}
		</h2>
		<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
			{section.products.map(p => (
				<div key={p.id} className='w-full h-56'>
					<ProductCard product={p} />
				</div>
			))}
		</div>
	</div>
)

const WhatsappQrPanel = ({ whatsappUrl, whatsapp, className = '' }) => {
	const { t } = useTranslation()
	return (
	<a
		href={whatsappUrl}
		target='_blank'
		rel='noopener noreferrer'
		className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-opacity hover:opacity-90 ${className}`}
		style={{ background: 'var(--color-primary)' }}>
		<p
			className='text-xs font-semibold uppercase tracking-widest'
			style={{ color: '#ffffff', opacity: 0.85 }}>
			{t('salesPortal.chatWithUs', 'Chat with us')}
		</p>
		<div className='rounded-xl p-3' style={{ background: '#ffffff' }}>
			<QRCode
				value={whatsappUrl}
				size={110}
				color='#1f2a24'
				bgColor='transparent'
				bordered={false}
			/>
		</div>
		<span className='text-xs font-bold underline' style={{ color: '#ffffff' }}>
			{whatsapp}
		</span>
	</a>
	)
}

const StoreInfoList = ({ items }) => (
	<div className='flex flex-col gap-1.5 items-center'>
		{items.map(({ icon, text }) => (
			<div key={text} className='flex items-center gap-1.5'>
				<span className='text-sm leading-none'>{icon}</span>
				<span className='text-xs' style={{ color: 'var(--color-muted)' }}>
					{text}
				</span>
			</div>
		))}
	</div>
)

const useScrolledPastElement = elementRef => {
	const [scrolledPast, setScrolledPast] = useState(false)

	useEffect(() => {
		const node = elementRef.current
		if (!node) return

		const handleScroll = () => setScrolledPast(node.getBoundingClientRect().bottom < 0)
		handleScroll()

		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [elementRef])

	return scrolledPast
}

const useActiveSection = (sectionRefs, sectionCount) => {
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const observer = new IntersectionObserver(
			entries => {
				const visible = entries
					.filter(e => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible[0]) {
					const index = sectionRefs.current.indexOf(visible[0].target)
					if (index !== -1) setActiveIndex(index)
				}
			},
			{ rootMargin: '-160px 0px -70% 0px', threshold: 0 },
		)

		sectionRefs.current.forEach(el => el && observer.observe(el))
		return () => observer.disconnect()
	}, [sectionRefs, sectionCount])

	return activeIndex
}

const CatalogTemplate = ({ org, whatsapp, whatsappUrl }) => {
	const { t } = useTranslation()
	const { orgSlug } = useParams()
	const { data: products = [] } = usePublishedProducts(org?.id)

	const frontdesk = org?.frontdesk ?? {}
	const showSearch = frontdesk.search !== false
	const showCatalog = frontdesk.catalog !== false
	const showWhatsapp = frontdesk.whatsapp !== false
	const featuredHero = frontdesk.hero === 'featuredProduct'

	const categories = org?.frontdesk?.categories ?? []
	const storeInfo = org?.frontdesk?.info ?? []
	const sections = buildSections(categories, products, t('salesPortal.featured', 'Featured'))
	const featuredProduct = products[0]

	const sectionRefs = useRef([])
	sectionRefs.current = sections.map((_, i) => sectionRefs.current[i] ?? null)
	const activeIndex = useActiveSection(sectionRefs, sections.length)

	const scrollToSection = index =>
		sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' })

	const categoryPanelRefs = useRef([])
	categoryPanelRefs.current = sections.map((_, i) => categoryPanelRefs.current[i] ?? null)

	useEffect(() => {
		categoryPanelRefs.current[activeIndex]?.scrollIntoView({
			behavior: 'smooth',
			inline: 'nearest',
			block: 'nearest',
		})
	}, [activeIndex])

	const heroSearchRef = useRef(null)
	const showMiniHeader = useScrolledPastElement(heroSearchRef)

	return (
		<div className='flex flex-col gap-24'>
			<div className='flex justify-end'>
				<CartTray orgSlug={orgSlug} />
			</div>

			{/* Hero */}
			<section className='text-center flex flex-col items-center gap-4 pt-24 pb-4'>
				{featuredHero && featuredProduct ? (
					<div className='w-full max-w-sm'>
						<div className='h-72'>
							<ProductCard product={featuredProduct} />
						</div>
					</div>
				) : org?.frontdesk?.heroImage ? (
					<img
						src={org.frontdesk.heroImage}
						alt={org?.name ?? t('salesPortal.ourStore', 'Our store')}
						className='w-full max-w-2xl rounded-3xl object-cover'
						style={{ maxHeight: '360px' }}
					/>
				) : (
					<h1
						className='text-5xl font-bold leading-tight'
						style={{ color: 'var(--color-text)' }}>
						{org?.frontdesk?.headline ??
							t('salesPortal.welcomeToStore', 'Welcome to {{storeName}}', { storeName: org?.name ?? t('salesPortal.ourStoreLowercase', 'our store') })}
					</h1>
				)}
				<p
					className='text-lg max-w-xl mb-8'
					style={{ color: 'var(--color-muted)' }}>
					{org?.frontdesk?.subheadline ??
						'Hano tubafitiye amata na fanta bikonje!'}
				</p>
				{showSearch && (
					<div ref={heroSearchRef} className='w-full flex justify-center'>
						<HeroSearch products={products} whatsappUrl={whatsappUrl} />
					</div>
				)}
			</section>

			{/* Category bar + product feed */}
			{showCatalog && (
				<section
					id='products'
					className='grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 items-start max-w-6xl mx-auto w-full'>
					<div className='flex flex-col gap-12 min-w-0'>
						<div
							className='sticky top-0 z-[60] -mx-4 px-4 pt-0 flex flex-col gap-3'
							style={{ background: 'var(--color-background)' }}>
							{showSearch && (
								<div
									className='flex items-center gap-4 overflow-hidden transition-all duration-200'
									style={{
										height: showMiniHeader ? '4rem' : '0px',
										opacity: showMiniHeader ? 1 : 0,
									}}>
									<p
										className='text-sm font-bold flex-shrink-0'
										style={{ color: 'var(--color-text)' }}>
										{org?.name ?? t('salesPortal.ourStore', 'Our store')}
									</p>
									<MiniSearch products={products} />
								</div>
							)}

							<div className='flex gap-3 overflow-x-auto p-3'>
								{sections.map((section, index) => (
									<CategoryPanel
										key={section.label}
										category={section}
										isActive={index === activeIndex}
										onClick={() => scrollToSection(index)}
										panelRef={el => (categoryPanelRefs.current[index] = el)}
									/>
								))}
							</div>
						</div>

						{sections.map((section, index) => (
							<CategorySection
								key={section.label}
								section={section}
								sectionRef={el => (sectionRefs.current[index] = el)}
							/>
						))}
					</div>

					<div className='sticky top-20 flex flex-col gap-4'>
						{showWhatsapp && (
							<WhatsappQrPanel whatsappUrl={whatsappUrl} whatsapp={whatsapp} />
						)}

						<StoreInfoList items={storeInfo} />
					</div>
				</section>
			)}

			{!showCatalog && showWhatsapp && (
				<section className='flex justify-center'>
					<WhatsappQrPanel
						whatsappUrl={whatsappUrl}
						whatsapp={whatsapp}
						className='w-full max-w-xs'
					/>
				</section>
			)}

			<StaffLoginFooter />
		</div>
	)
}

export default CatalogTemplate
