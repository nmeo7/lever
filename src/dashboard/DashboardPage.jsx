import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDocs, collection, query, where } from 'firebase/firestore'
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

const now = new Date()
const CURRENT_MONTH = now.toISOString().slice(0, 7)
const PREV_MONTH = new Date(now.getFullYear(), now.getMonth() - 1, 1)
	.toISOString()
	.slice(0, 7)

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
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

const EntityCard = ({ icon: Icon, label, stat, loading, to, sub }) => {
	const navigate = useNavigate()
	return (
		<button
			onClick={() => navigate(to)}
			className='w-full rounded-2xl p-5 text-left flex flex-col gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-0.5 bg-white border border-black/10'>
			<span className='w-10 h-10 rounded-xl flex items-center justify-center bg-black/5'>
				<Icon size={20} strokeWidth={1.75} className='text-black' />
			</span>
			<div>
				<p className='text-xs mb-0.5 text-black/50'>{label}</p>
				<p className='text-2xl font-bold text-black'>{loading ? '…' : stat}</p>
				{!loading && sub && (
					<p className='text-xs mt-0.5 font-medium text-black/50'>{sub}</p>
				)}
			</div>
		</button>
	)
}

const NavRow = ({ icon: Icon, label, to }) => {
	const navigate = useNavigate()
	return (
		<button
			onClick={() => navigate(to)}
			className='flex items-center gap-2 py-1.5 text-sm text-left transition-opacity opacity-70 hover:opacity-100 text-black'>
			<Icon size={16} strokeWidth={1.75} />
			{label}
		</button>
	)
}

const ALL_ROUTES = [
	{ label: 'Customers', to: '/app/customers', keywords: 'crm people contacts' },
	{
		label: 'Conversations',
		to: '/app/conversations',
		keywords: 'chat messages crm',
	},
	{ label: 'Orders', to: '/app/orders', keywords: 'commerce sales' },
	{
		label: 'Payments',
		to: '/app/payments',
		keywords: 'cashflow finance money commerce',
	},
	{
		label: 'Products',
		to: '/app/products',
		keywords: 'commerce catalog items',
	},
	{
		label: 'Inventory',
		to: '/app/inventory',
		keywords: 'stock warehouse commerce',
	},
	{ label: 'People', to: '/app/people', keywords: 'hr staff employees org' },
	{ label: 'Assets', to: '/app/assets', keywords: 'equipment org' },
	{
		label: 'Documents',
		to: '/app/documents',
		keywords: 'contracts templates rules playbooks org',
	},
	{
		label: 'Operations',
		to: '/app/operations',
		keywords: 'automation process org',
	},
	{
		label: 'Milestones',
		to: '/app/milestones',
		keywords: 'schedule calendar plans decisions org',
	},
	{ label: 'Jobs', to: '/app/jobs', keywords: 'tasks work pending' },
	{ label: 'Settings', to: '/app/settings', keywords: 'config org' },
	{
		label: 'Reports',
		to: '/app/reports',
		keywords: 'analytics revenue finance charts',
	},
]

const GlobalSearch = () => {
	const [query, setQuery] = useState('')
	const navigate = useNavigate()
	const trimmed = query.trim().toLowerCase()
	const results = trimmed
		? ALL_ROUTES.filter(
				({ label, keywords }) =>
					label.toLowerCase().includes(trimmed) || keywords.includes(trimmed),
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
				placeholder='Ask anything...'
				value={query}
				onChange={e => setQuery(e.target.value)}
				onKeyDown={handleKeyDown}
				className='w-full rounded-2xl px-5 py-3.5 text-sm outline-none bg-white border border-black/10 text-black'
			/>
			{results.length > 0 && (
				<div className='absolute left-0 right-0 top-full mt-1 rounded-2xl overflow-hidden z-10 flex flex-col bg-white border border-black/10'>
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
	const { data: org } = useUserOrg(user?.orgId)
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
						{org?.name ?? 'Backoffice'}
					</span>
				</div>
				<HeaderControls />
			</div>

			{/* Hero */}
			<section className='text-center flex flex-col items-center gap-4 py-16'>
				<h1 className='text-5xl font-bold leading-tight text-black'>
					Happy Friday, Jane!
				</h1>
				<p className='text-lg max-w-xl text-black/50'>
					ACME has one order waiting, inventory of Item X will run out on
					Wednesday, and customer Alice hasn't received a reply for 18 hours.{' '}
					<span className='italic underline cursor-pointer'>See more</span>
				</p>
				<GlobalSearch />
			</section>

			{/* Stat cards + nav */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				{/* Work */}
				<div>
					<EntityCard
						icon={MessageSquare}
						label="Today's Conversations"
						stat='12'
						loading={false}
						to='/app/conversations'
					/>
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: Users, label: 'Customers', to: '/app/customers' },
							{ icon: UserRound, label: 'People', to: '/app/people' },
							{ icon: Monitor, label: 'Assets', to: '/app/assets' },
							...(user?.role === 'admin'
								? [{ icon: Building2, label: 'Tenants', to: '/app/tenants' }]
								: []),
						].map(({ icon, label, to }) => (
							<NavRow key={to} icon={icon} label={label} to={to} />
						))}
					</div>
				</div>

				{/* Resources */}
				<div>
					<EntityCard
						icon={Package}
						label="Today's Orders"
						stat='5'
						loading={false}
						to='/app/orders'
					/>
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: Archive, label: 'Inventory', to: '/app/inventory' },
							{ icon: Tag, label: 'Products', to: '/app/products' },
						].map(({ icon, label, to }) => (
							<NavRow key={to} icon={icon} label={label} to={to} />
						))}
					</div>
				</div>

				{/* Insights */}
				<div>
					<EntityCard
						icon={CreditCard}
						label='Cashflow MTD'
						stat={
							cashflow.data ? `+${formatCurrency(cashflow.data.current)}` : '—'
						}
						loading={cashflow.isLoading}
						to='/app/payments'
						sub={
							cashflow.data?.pct != null
								? `${cashflow.data.pct >= 0 ? '↑' : '↓'} ${Math.abs(cashflow.data.pct)}% vs last month`
								: undefined
						}
					/>
					<div className='flex flex-col gap-1 mt-2'>
						{[
							{ icon: BarChart3, label: 'Reports', to: '/app/reports' },
							{ icon: Calendar, label: 'Milestones', to: '/app/milestones' },
							{ icon: FileText, label: 'Documents', to: '/app/documents' },
							{ icon: Shuffle, label: 'Operations', to: '/app/operations' },
						].map(({ icon, label, to }) => (
							<NavRow key={to} icon={icon} label={label} to={to} />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

export default DashboardPage
