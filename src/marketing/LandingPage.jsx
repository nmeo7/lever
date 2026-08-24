import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
	Bookmark,
	Share2,
	ArrowUpRight,
	Tag,
	Store,
	Search,
	User,
} from 'lucide-react'

const DEMO_ORG_SLUG = import.meta.env.VITE_ORG_ID ?? 'default'

const HEADER_HEIGHT = '92px'
const BOTTOM_NAV_HEIGHT = '64px'
const CARD_VERTICAL_MARGIN = '48px'

const NAV_ITEMS = [
	{ key: 'products', labelKey: 'marketing.nav.products', label: 'Products', icon: Tag },
	{ key: 'shops', labelKey: 'marketing.nav.shops', label: 'Shops', icon: Store },
	{ key: 'profile', labelKey: 'marketing.nav.profile', label: 'Profile', icon: User },
]

const SEARCH_SCROLL_TARGET_ID = 'discover-search'

const CARD_ACCENTS = ['#fbeaea', '#fbf1e3', '#e7f3ee', '#e8eef6', '#efe9f6', '#f7ebf1']

const DISCOVER_CARDS = [
	{
		id: 'luxury-under-50k',
		tags: ['Calm home'],
		title: 'Luxury under 50k',
		image:
			'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
		description:
			'Small hacks that make your room feel boutique, without passing 50,000 RWF.',
		badge: 'Curated by Amina',
		items: [
			'Scented candle',
			'Minimalist bedside lamp',
			'Framed wall print',
			'Woven throw',
		],
	},
	{
		id: 'movie-night',
		tags: ['Entertainment'],
		title: 'Movie night in a box',
		image:
			'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
		description:
			'Turn your living room into a cinema for a night with a projector, speakers, and an extra screen.',
		badge: 'Loved by Kigali hosts',
		items: ['Projector', 'Speakers', 'Portable screen'],
	},
	{
		id: 'kiyovu-jersey',
		tags: ['Sports', 'Promoted'],
		title: 'Kiyovu home jersey (replica)',
		image:
			'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
		description:
			'The 2026 home kit, true to the crest — order before matchday.',
		badge: null,
		items: [],
	},
	{
		id: 'first-apartment',
		tags: ['Move-in ready'],
		title: 'First apartment starter kit',
		image:
			'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
		description:
			'Everything you need for day one, bundled so you only checkout once.',
		badge: 'Curated by Eric',
		items: ['Cookware set', 'Mattress topper', 'Cutlery set', 'Curtains'],
	},
	{
		id: 'desk-glow-up',
		tags: ['Work from home'],
		title: 'Desk glow-up',
		image:
			'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=800&q=80',
		description: 'A calmer desk setup for the days you never leave the house.',
		badge: 'Curated by Sandrine',
		items: ['Monitor stand', 'Desk lamp', 'Cable organizer', 'Plant pot'],
	},
	{
		id: 'self-care-sunday',
		tags: ['Self care'],
		title: 'Self-care Sunday box',
		image:
			'https://images.unsplash.com/photo-1596178060810-72660ce7ca94?w=800&q=80',
		description:
			'A slow-morning bundle for the one day a week that belongs to you.',
		badge: 'Curated by Amina',
		items: ['Face mask set', 'Herbal tea', 'Bath salts', 'Journal'],
	},
]

const SearchSection = () => {
	const { t } = useTranslation()
	const [input, setInput] = useState('')

	return (
		<div
			className='flex-shrink-0 flex flex-col gap-3 p-5 rounded-xl shadow-md'
			style={{
				width: 'min(90vw, 380px)',
				scrollSnapAlign: 'start',
				background: 'var(--color-primary)',
			}}>
			<h3 className='text-lg font-bold leading-tight text-white'>
				{t('marketing.searchHeading', 'What are you looking for?')}
			</h3>
			<form
				onSubmit={e => e.preventDefault()}
				className='flex items-center gap-2 rounded-lg px-3 py-2 bg-white'>
				<Search
					size={16}
					strokeWidth={2}
					style={{ color: 'var(--color-primary)', flexShrink: 0 }}
				/>
				<input
					type='text'
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder={t('marketing.searchPlaceholder', 'Search bundles, moments, products')}
					className='flex-1 text-sm bg-transparent outline-none'
					style={{ color: 'var(--color-primary)' }}
				/>
			</form>
		</div>
	)
}

const DiscoverCard = ({ card, accent }) => {
	const { t } = useTranslation()
	return (
	<article
		className='relative rounded-xl overflow-hidden flex-shrink-0 flex flex-col'
		style={{
			width: 'min(90vw, 380px)',
			maxHeight: `calc(100vh - ${HEADER_HEIGHT} - ${BOTTOM_NAV_HEIGHT} - ${CARD_VERTICAL_MARGIN})`,
			overflowY: 'auto',
			scrollSnapAlign: 'start',
			background: accent,
		}}>
		<div className='p-5 flex flex-col gap-3' style={{ background: accent }}>
			<div className='flex flex-wrap gap-2'>
				{card.tags.map(tag => (
					<span
						key={tag}
						className='neu-flat inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full'
						style={{ background: accent, color: 'var(--color-text)' }}>
						{tag}
					</span>
				))}
			</div>
			<h3
				className='text-2xl font-bold leading-tight'
				style={{ color: 'var(--color-text)' }}>
				{card.title}
			</h3>
		</div>

		<img
			src={card.image}
			alt={card.title}
			className='w-full object-cover'
			style={{ height: '360px' }}
		/>

		<div
			className='p-5 flex-1 flex flex-col gap-4'
			style={{ background: accent }}>
			<p
				className='text-sm leading-relaxed'
				style={{ color: 'var(--color-text)' }}>
				{card.description}
			</p>

			{card.badge && (
				<div className='flex items-center gap-2'>
					<span
						className='w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white'
						style={{ background: 'var(--color-primary)' }}>
						{card.badge.replace(/^(Curated by|Loved by)\s/, '')[0]}
					</span>
					<span
						className='text-xs font-semibold'
						style={{ color: 'var(--color-text)' }}>
						{card.badge}
					</span>
				</div>
			)}

			{card.items.length > 0 && (
				<div className='rounded-lg p-3 flex flex-wrap gap-2 border border-black/10'>
					{card.items.slice(0, 3).map(item => (
						<span
							key={item}
							className='neu-flat text-xs font-medium px-3 py-1.5 rounded-full text-white'
							style={{ background: 'var(--color-primary)' }}>
							{item}
						</span>
					))}
					{card.items.length > 3 && (
						<span
							className='text-xs font-semibold px-3 py-1.5 rounded-full text-white'
							style={{ background: 'var(--color-text)' }}>
							{t('marketing.moreInside', '+ more inside')}
						</span>
					)}
				</div>
			)}
		</div>

		<div
			className='px-5 py-4 flex items-center justify-between'
			style={{ background: accent }}>
			<div className='flex items-center gap-2'>
				<button
					className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-black/10 transition-opacity hover:opacity-70'
					style={{ color: 'var(--color-primary)' }}>
					<Bookmark size={13} strokeWidth={2} />
					{t('common.save', 'Save')}
				</button>
				<button
					className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-black/10 transition-opacity hover:opacity-70'
					style={{ color: 'var(--color-primary)' }}>
					<Share2 size={13} strokeWidth={2} />
					{t('marketing.share', 'Share')}
				</button>
			</div>
			<Link
				to={`/${DEMO_ORG_SLUG}`}
				className='inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full text-white shadow-md transition-opacity hover:opacity-90'
				style={{ background: 'var(--color-primary)' }}>
				{t('marketing.open', 'Open')}
				<ArrowUpRight size={13} strokeWidth={2} />
			</Link>
		</div>
	</article>
	)
}

const SearchHeader = () => {
	const { t } = useTranslation()
	const scrollToSearch = () =>
		document
			.getElementById(SEARCH_SCROLL_TARGET_ID)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' })

	return (
		<header className='sticky top-0 z-10 w-full px-5 pt-6 pb-4 flex flex-col items-center gap-4'>
			<div
				className='w-full flex items-center justify-between gap-4'
				style={{ maxWidth: 'min(90vw, 380px)' }}>
				<span className='inline-flex items-center gap-2 flex-shrink-0'>
					<span
						className='w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md'
						style={{ background: 'var(--color-primary)' }}>
						IK
					</span>
				</span>

				<button
					onClick={scrollToSearch}
					title={t('marketing.search', 'Search')}
					className='flex-shrink-0 rounded-full p-2.5 text-white shadow-md transition-opacity hover:opacity-90'
					style={{ background: 'var(--color-secondary)' }}>
					<Search size={20} strokeWidth={2} />
				</button>
			</div>
		</header>
	)
}

const BottomNav = ({ activeKey, onSelect }) => {
	const { t } = useTranslation()
	return (
	<nav
		className='fixed bottom-0 left-0 right-0 z-20 flex justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.08)]'
		style={{ height: BOTTOM_NAV_HEIGHT, background: 'var(--color-surface)' }}>
		<div
			className='w-full flex items-center justify-center gap-10'
			style={{ maxWidth: 'min(90vw, 380px)' }}>
			{NAV_ITEMS.map(({ key, labelKey, label, icon: Icon }) => {
				const isActive = key === activeKey
				return (
					<button
						key={key}
						onClick={() => onSelect(key)}
						className='flex flex-col items-center justify-center gap-1 h-full transition-opacity'
						style={{
							color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
							opacity: isActive ? 1 : 0.7,
						}}>
						<Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
						<span className='text-[11px] font-medium'>{t(labelKey, label)}</span>
					</button>
				)
			})}
		</div>
	</nav>
	)
}

const LandingPage = () => {
	const { t } = useTranslation()
	const [activeNav, setActiveNav] = useState('products')

	return (
		<div
			className='min-h-screen flex flex-col'
			style={{
				color: 'var(--color-text)',
				fontFamily: 'var(--font-family)',
			}}>
			<SearchHeader />

			<main
				className='flex-1 flex flex-col gap-4 pt-4'
				style={{ paddingBottom: BOTTOM_NAV_HEIGHT }}>
				<div
					className='flex-1 flex flex-col items-center gap-6 px-4 pt-4 pb-2'
					style={{
						overflowY: 'auto',
						scrollSnapType: 'y mandatory',
						maxHeight: `calc(100vh - ${HEADER_HEIGHT} - ${BOTTOM_NAV_HEIGHT})`,
					}}>
					<div id={SEARCH_SCROLL_TARGET_ID}>
						<SearchSection />
					</div>

					{DISCOVER_CARDS.map((card, index) => (
						<DiscoverCard
							key={card.id}
							card={card}
							accent={CARD_ACCENTS[index % CARD_ACCENTS.length]}
						/>
					))}

					<Link
						to={`/${DEMO_ORG_SLUG}`}
						className='flex-shrink-0 rounded-xl flex flex-col items-center justify-center gap-3 text-center p-8 text-white shadow-lg transition-opacity hover:opacity-90'
						style={{
							width: 'min(90vw, 380px)',
							minHeight: '200px',
							scrollSnapAlign: 'start',
							background: 'var(--color-primary)',
						}}>
						<p className='text-lg font-bold'>{t('marketing.seeEverything', 'See everything in the store')}</p>
						<span className='inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full bg-white'
							style={{ color: 'var(--color-primary)' }}>
							{t('marketing.visitDemoStore', 'Visit the demo store')}
							<ArrowUpRight size={13} strokeWidth={2} />
						</span>
					</Link>
				</div>
			</main>

			<BottomNav activeKey={activeNav} onSelect={setActiveNav} />
		</div>
	)
}

export default LandingPage
