import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDoc, getDocs, doc, collection, query, where } from 'firebase/firestore'
import {
	Users,
	MessageSquare,
	Package,
	Shuffle,
	CreditCard,
	Archive,
	Monitor,
	UserRound,
	Tag,
	BarChart3,
	Calendar,
	FileText,
	Building2,
} from 'lucide-react'
import { db } from '@/firebase'
import { useAuthStore } from '@/auth/store'
import HeaderControls, { useUserOrg } from '@/util/components/HeaderControls'
import { useModuleLabels, resolveModuleLabel } from '@/util/moduleLabels'
import { useT } from '@/i18n/useTranslateWithOverrides'

const now = new Date()
const CURRENT_MONTH = now.toISOString().slice(0, 7)
const PREV_MONTH = new Date(now.getFullYear(), now.getMonth() - 1, 1)
	.toISOString()
	.slice(0, 7)

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'FRW',
		maximumFractionDigits: 0,
	}).format(amount)

const priorityClasses = {
	urgent: 'text-red-500',
	high: 'text-orange-500',
	medium: 'text-yellow-500',
	low: 'text-gray-400',
}

const useStats = () => {
	const cashflow = useQuery({
		queryKey: ['revenue-mtd'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-payments'), where('type', '==', 'incoming')),
			)
			const docs = snap.docs.map(d => d.data())
			const current = docs
				.filter(d => d.fiscalPeriod?.startsWith(CURRENT_MONTH))
				.reduce((sum, d) => sum + (d.amount ?? 0), 0)
			const prev = docs
				.filter(d => d.fiscalPeriod?.startsWith(PREV_MONTH))
				.reduce((sum, d) => sum + (d.amount ?? 0), 0)
			const pct = prev > 0 ? Math.round(((current - prev) / prev) * 100) : null
			return { current, pct }
		},
	})
	return { cashflow }
}

const usePendingJobs = () =>
	useQuery({
		queryKey: ['dashboard-jobs'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-jobs'), where('status', '==', 'pending')),
			)
			return snap.docs.slice(0, 10).map(d => ({ id: d.id, ...d.data() }))
		},
	})

const flattenModules = modules =>
	new Set(Object.values(modules ?? {}).flat())

const useVisibleModules = (roleId, org) =>
	useQuery({
		queryKey: ['visible-modules', roleId, org?.roleOverrides?.[roleId]],
		queryFn: async () => {
			const override = org?.roleOverrides?.[roleId]?.modules
			if (override) return flattenModules(override)

			const snap = await getDoc(doc(db, 'erp-roleDefinitions', roleId))
			return flattenModules(snap.exists() ? snap.data().modules : null)
		},
		enabled: !!roleId,
		staleTime: Infinity,
	})

const EntityCard = ({ icon: Icon, label, stat, loading, to, sub }) => {
	const navigate = useNavigate()
	return (
		<button
			onClick={() => navigate(to)}
			className='neu-raised-hover group w-full rounded-2xl p-5 text-left flex flex-col gap-3 border transition-all hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5'
			style={{ background: 'var(--neu-bg)', borderColor: 'var(--color-border)' }}>
			<span className='w-10 h-10 rounded-xl flex items-center justify-center bg-black/5'>
				<Icon size={20} strokeWidth={1.75} className='text-black' />
			</span>
			<div>
				<p className='text-xs mb-0.5 text-black/50 group-hover:font-bold'>{label}</p>
				<p className='text-2xl font-bold text-black'>{loading ? '…' : stat}</p>
				{!loading && sub && (
					<p className='text-xs mt-0.5 font-medium text-black/50 group-hover:font-bold'>{sub}</p>
				)}
			</div>
		</button>
	)
}

const NavRow = ({ icon: Icon, label, to }) => {
	const navigate = useNavigate()
	return (
		<div className='py-1.5'>
			<button
				onClick={() => navigate(to)}
				className='inline-flex items-center gap-2 text-sm text-left opacity-70 hover:opacity-100 text-black group'>
				<Icon size={16} strokeWidth={1.75} />
				<span className='transition-all group-hover:underline group-hover:font-bold group-hover:pl-1.5'>
					{label}
				</span>
			</button>
		</div>
	)
}

const ALL_ROUTES = [
	{ labelKey: 'dashboard.nav.customers', label: 'Customers', to: '/app/customers', keywords: 'crm people contacts', moduleId: 'customers' },
	{
		labelKey: 'dashboard.nav.conversations',
		label: 'Conversations',
		to: '/app/conversations',
		keywords: 'chat messages crm',
		moduleId: 'conversations',
	},
	{ labelKey: 'dashboard.nav.orders', label: 'Orders', to: '/app/orders', keywords: 'commerce sales', moduleId: 'orders' },
	{
		labelKey: 'dashboard.nav.payments',
		label: 'Payments',
		to: '/app/payments',
		keywords: 'cashflow finance money commerce',
		moduleId: 'payments',
	},
	{
		labelKey: 'dashboard.nav.products',
		label: 'Products',
		to: '/app/products',
		keywords: 'commerce catalog items',
		moduleId: 'products',
	},
	{
		labelKey: 'dashboard.nav.inventory',
		label: 'Inventory',
		to: '/app/inventory',
		keywords: 'stock warehouse commerce',
		moduleId: 'inventory',
	},
	{ labelKey: 'dashboard.nav.people', label: 'People', to: '/app/people', keywords: 'hr staff employees org', moduleId: 'people' },
	{ labelKey: 'dashboard.nav.resources', label: 'Resources', to: '/app/resources', keywords: 'equipment org', moduleId: 'resources' },
	{
		labelKey: 'dashboard.nav.knowledge',
		label: 'Knowledge',
		to: '/app/knowledge',
		keywords: 'contracts templates rules playbooks org',
		moduleId: 'knowledge',
	},
	{
		labelKey: 'dashboard.nav.operations',
		label: 'Operations',
		to: '/app/operations',
		keywords: 'automation process org',
		moduleId: 'operations',
	},
	{
		labelKey: 'dashboard.nav.plans',
		label: 'Plans',
		to: '/app/plans',
		keywords: 'schedule calendar goals decisions org',
		moduleId: 'plans',
	},
	{ labelKey: 'dashboard.nav.jobs', label: 'Jobs', to: '/app/jobs', keywords: 'tasks work pending', moduleId: 'jobs' },
	{ labelKey: 'dashboard.nav.settings', label: 'Settings', to: '/app/settings', keywords: 'config org', moduleId: 'settings' },
	{
		labelKey: 'dashboard.nav.reports',
		label: 'Reports',
		to: '/app/reports',
		keywords: 'analytics revenue finance charts',
		moduleId: 'reports',
	},
]

const GlobalSearch = ({ visibleModuleIds, customersLabel, t }) => {
	const [query, setQuery] = useState('')
	const navigate = useNavigate()
	const trimmed = query.trim().toLowerCase()
	const routes = ALL_ROUTES.map(route =>
		route.moduleId === 'customers'
			? { ...route, label: customersLabel }
			: { ...route, label: t(route.labelKey, route.label) },
	)
	const results = trimmed
		? routes.filter(
				({ label, keywords, moduleId }) =>
					visibleModuleIds.has(moduleId) &&
					(label.toLowerCase().includes(trimmed) || keywords.includes(trimmed)),
			)
		: []

	const handleKeyDown = e => {
		if (e.key === 'Enter' && query.trim()) {
			navigate(`/app/chat?q=${encodeURIComponent(query.trim())}`)
		}
	}

	return (
		<div className='relative w-full max-w-2xl'>
			<input
				type='text'
				placeholder={t('dashboard.searchPlaceholder', 'Ask anything...')}
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				className='neu-raised w-full rounded-2xl px-5 py-3.5 text-sm outline-none text-black transition-transform hover:scale-[1.01] focus:scale-[1.01]'
				style={{ background: 'var(--neu-bg)' }}
			/>
			{results.length > 0 && (
				<div
					className='absolute left-0 right-0 top-full mt-1 rounded-2xl overflow-hidden z-10 flex flex-col border'
					style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
					{results.map(({ label, to }) => (
						<button
							key={to}
							onClick={() => {
								navigate(to)
								setQuery('')
							}}
							className='px-5 py-3 text-sm text-left hover:opacity-70 transition-opacity text-black'>
							{label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

const DashboardPage = () => {
	const { cashflow } = useStats()
	const { data: pendingJobs, isLoading: loadingJobs } = usePendingJobs()
	const user = useAuthStore(s => s.user)
	const activeCompanyId = useAuthStore(s => s.activeCompanyId)
	const { data: org } = useUserOrg(activeCompanyId)
	const { data: visibleModuleIds = new Set() } = useVisibleModules(user?.roleId, org)
	const { data: labels } = useModuleLabels(org)
	const customersLabel = resolveModuleLabel(labels, 'customers', 'Customers')
	const { t } = useT(org)
	const navigate = useNavigate()

	return (
		<div className='p-6 max-w-6xl mx-auto flex flex-col gap-8'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div
					className='flex items-center gap-2 cursor-pointer'
					onClick={() => navigate('/app')}>
					<div className='w-7 h-7 rounded-lg flex items-center justify-center bg-black text-white text-xs font-bold'>
						{org?.name?.slice(0, 1).toUpperCase() ?? 'E'}
					</div>
					<span className='font-semibold text-sm'>
						{org?.name ?? t('dashboard.defaultOrgName', 'Backoffice')}
					</span>
				</div>
				<HeaderControls />
			</div>

			{/* Hero */}
			<section className='text-center flex flex-col items-center gap-4 py-16'>
				<h1 className='text-5xl font-bold leading-tight text-black'>
					{t('dashboard.heroGreeting', 'Happy Friday, Jane!')}
				</h1>
				<p className='text-lg max-w-xl text-black/50'>
					{t(
						'dashboard.heroSummary',
						"ACME has one order waiting, inventory of Item X will run out on Wednesday, and customer Alice hasn't received a reply for 18 hours.",
					)}{' '}
					<span className='italic underline cursor-pointer'>{t('dashboard.seeMore', 'See more')}</span>
				</p>
				<GlobalSearch visibleModuleIds={visibleModuleIds} customersLabel={customersLabel} t={t} />
			</section>

			{/* Stat cards + nav */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				{/* Work */}
				<div>
					{visibleModuleIds.has('conversations') && (
						<EntityCard
							icon={MessageSquare}
							label={t('dashboard.todaysConversations', "Today's Conversations")}
							stat='12'
							loading={false}
							to='/app/conversations'
						/>
					)}
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: Users, label: customersLabel, to: '/app/customers', moduleId: 'customers' },
							{ icon: UserRound, label: t('dashboard.nav.people', 'People'), to: '/app/people', moduleId: 'people' },
							{ icon: Monitor, label: t('dashboard.nav.resources', 'Resources'), to: '/app/resources', moduleId: 'resources' },
							...(user?.isPlatformAdmin || (user?.groupId && user?.roleId === 'admin')
								? [{ icon: Building2, label: t('dashboard.nav.controlPanel', 'Control Panel'), to: '/app/control-panel', moduleId: null }]
								: []),
						]
							.filter(({ moduleId }) => moduleId === null || visibleModuleIds.has(moduleId))
							.map(({ icon, label, to }) => (
								<NavRow key={to} icon={icon} label={label} to={to} />
							))}
					</div>
				</div>

				{/* Resources */}
				<div>
					{visibleModuleIds.has('orders') && (
						<EntityCard
							icon={Package}
							label={t('dashboard.todaysOrders', "Today's Orders")}
							stat='5'
							loading={false}
							to='/app/orders'
						/>
					)}
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: Archive, label: t('dashboard.nav.inventory', 'Inventory'), to: '/app/inventory', moduleId: 'inventory' },
							{ icon: Tag, label: t('dashboard.nav.products', 'Products'), to: '/app/products', moduleId: 'products' },
						]
							.filter(({ moduleId }) => visibleModuleIds.has(moduleId))
							.map(({ icon, label, to }) => (
								<NavRow key={to} icon={icon} label={label} to={to} />
							))}
					</div>
				</div>

				{/* Insights */}
				<div>
					{visibleModuleIds.has('payments') && (
						<EntityCard
							icon={CreditCard}
							label={t('dashboard.cashflowMtd', 'Cashflow MTD')}
							stat={
								cashflow.data ? `+${formatCurrency(cashflow.data.current)}` : '—'
							}
							loading={cashflow.isLoading}
							to='/app/payments'
							sub={
								cashflow.data?.pct != null
									? `${cashflow.data.pct >= 0 ? '↑' : '↓'} ${Math.abs(cashflow.data.pct)}% ${t('dashboard.vsLastMonth', 'vs last month')}`
									: undefined
							}
						/>
					)}
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: BarChart3, label: t('dashboard.nav.reports', 'Reports'), to: '/app/reports', moduleId: 'reports' },
							{ icon: Calendar, label: t('dashboard.nav.plans', 'Plans'), to: '/app/plans', moduleId: 'plans' },
							{ icon: FileText, label: t('dashboard.nav.knowledge', 'Knowledge'), to: '/app/knowledge', moduleId: 'knowledge' },
							{ icon: Shuffle, label: t('dashboard.nav.operations', 'Operations'), to: '/app/operations', moduleId: 'operations' },
						]
							.filter(({ moduleId }) => visibleModuleIds.has(moduleId))
							.map(({ icon, label, to }) => (
								<NavRow key={to} icon={icon} label={label} to={to} />
							))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default DashboardPage
