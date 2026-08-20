import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDocs, collection, query, where } from 'firebase/firestore'
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	RadialBarChart,
	RadialBar,
	PolarAngleAxis,
	PieChart,
	Pie,
	Cell,
	BarChart as RBarChart,
	Bar,
} from 'recharts'
import { db } from '@/firebase'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(amount)

const useRevenueByMonth = () =>
	useQuery({
		queryKey: ['reports-revenue-by-month'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-payments'), where('type', '==', 'incoming')),
			)
			const byMonth = {}
			snap.docs.forEach(d => {
				const period = d.data().fiscalPeriod?.slice(0, 7)
				if (!period) return
				byMonth[period] = (byMonth[period] ?? 0) + (d.data().amount ?? 0)
			})
			return Object.entries(byMonth)
				.sort(([a], [b]) => a.localeCompare(b))
				.slice(-6)
				.map(([month, total]) => ({ month, total }))
		},
	})

const useOrdersByStatus = () =>
	useQuery({
		queryKey: ['reports-orders-by-status'],
		queryFn: async () => {
			const snap = await getDocs(collection(db, 'erp-orders'))
			const counts = {}
			snap.docs.forEach(d => {
				const s = d.data().status ?? 'unknown'
				counts[s] = (counts[s] ?? 0) + 1
			})
			return Object.entries(counts).map(([status, count]) => ({ status, count }))
		},
	})

const useTopProducts = () =>
	useQuery({
		queryKey: ['reports-top-products'],
		queryFn: async () => {
			const snap = await getDocs(collection(db, 'erp-orders'))
			const totals = {}
			snap.docs.forEach(d => {
				const items = d.data().items ?? []
				items.forEach(item => {
					const name = item.name ?? item.productId ?? 'Unknown'
					totals[name] = (totals[name] ?? 0) + (item.qty ?? 1)
				})
			})
			return Object.entries(totals)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 5)
				.map(([name, qty]) => ({ name, qty }))
		},
	})

const useMtdExpenses = () =>
	useQuery({
		queryKey: ['reports-mtd-expenses'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-payments'), where('type', '==', 'outgoing')),
			)
			return snap.docs
				.filter(d => d.data().fiscalPeriod?.startsWith(CURRENT_MONTH))
				.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)
		},
	})

const useMtdRevenue = () =>
	useQuery({
		queryKey: ['reports-mtd-revenue'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-payments'), where('type', '==', 'incoming')),
			)
			return snap.docs
				.filter(d => d.data().fiscalPeriod?.startsWith(CURRENT_MONTH))
				.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)
		},
	})

const useCustomerCount = () =>
	useQuery({
		queryKey: ['reports-customer-count'],
		queryFn: async () => (await getDocs(collection(db, 'erp-customers'))).size,
	})

const StatCard = ({ label, value, loading, sub, trend }) => (
	<div
		className='rounded-2xl p-5 flex flex-col gap-1'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<p className='text-xs font-medium uppercase tracking-wide' style={{ color: 'var(--color-muted)' }}>{label}</p>
		<p className='text-3xl font-bold tabular-nums' style={{ color: 'var(--color-text)' }}>
			{loading ? '…' : value}
		</p>
		{sub && (
			<p className='text-xs flex items-center gap-1' style={{ color: trend != null ? (trend >= 0 ? '#10b981' : '#ef4444') : 'var(--color-muted)' }}>
				{trend != null && (trend >= 0 ? '↑' : '↓')} {sub}
			</p>
		)}
	</div>
)

const Section = ({ title, children, className = '' }) => (
	<div
		className={`rounded-2xl p-6 flex flex-col gap-4 ${className}`}
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<h2 className='text-sm font-semibold uppercase tracking-widest' style={{ color: 'var(--color-muted)' }}>
			{title}
		</h2>
		{children}
	</div>
)

const EmptyState = () => (
	<p className='text-sm py-8 text-center' style={{ color: 'var(--color-muted)' }}>No data yet</p>
)

const RevenueTrendChart = ({ rows }) => (
	<ResponsiveContainer width='100%' height={220}>
		<LineChart data={rows} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
			<CartesianGrid strokeDasharray='3 3' stroke='var(--color-border)' vertical={false} />
			<XAxis dataKey='month' tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
			<YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
			<Tooltip
				formatter={value => formatCurrency(value)}
				contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }}
			/>
			<Line type='monotone' dataKey='total' stroke='#6366f1' strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
		</LineChart>
	</ResponsiveContainer>
)

const GaugeChart = ({ value, target, label, color = '#6366f1' }) => {
	const pct = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0
	const data = [{ value: pct, fill: color }]
	return (
		<div className='flex flex-col items-center gap-1'>
			<ResponsiveContainer width='100%' height={140}>
				<RadialBarChart
					innerRadius='70%'
					outerRadius='100%'
					data={data}
					startAngle={90}
					endAngle={-270}>
					<PolarAngleAxis type='number' domain={[0, 100]} angleAxisId={0} tick={false} />
					<RadialBar dataKey='value' cornerRadius={20} background={{ fill: 'var(--color-border)' }} angleAxisId={0} />
				</RadialBarChart>
			</ResponsiveContainer>
			<div className='-mt-24 flex flex-col items-center'>
				<span className='text-2xl font-bold tabular-nums' style={{ color: 'var(--color-text)' }}>{pct}%</span>
			</div>
			<div className='mt-16 text-center'>
				<p className='text-xs font-medium' style={{ color: 'var(--color-text)' }}>{label}</p>
				<p className='text-[11px]' style={{ color: 'var(--color-muted)' }}>{formatCurrency(value)} of {formatCurrency(target)}</p>
			</div>
		</div>
	)
}

const OrdersDonut = ({ rows }) => (
	<div className='flex items-center gap-6'>
		<ResponsiveContainer width={140} height={140}>
			<PieChart>
				<Pie data={rows} dataKey='count' nameKey='status' innerRadius={40} outerRadius={65} paddingAngle={3}>
					{rows.map((row, i) => (
						<Cell key={row.status} fill={PALETTE[i % PALETTE.length]} />
					))}
				</Pie>
				<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} />
			</PieChart>
		</ResponsiveContainer>
		<div className='flex flex-col gap-2'>
			{rows.map((row, i) => (
				<div key={row.status} className='flex items-center gap-2 text-xs'>
					<span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ background: PALETTE[i % PALETTE.length] }} />
					<span className='capitalize' style={{ color: 'var(--color-text)' }}>{row.status}</span>
					<span className='font-semibold' style={{ color: 'var(--color-muted)' }}>{row.count}</span>
				</div>
			))}
		</div>
	</div>
)

const TopProductsBars = ({ rows }) => (
	<ResponsiveContainer width='100%' height={220}>
		<RBarChart data={rows} layout='vertical' margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
			<XAxis type='number' hide />
			<YAxis
				type='category'
				dataKey='name'
				width={140}
				tick={{ fontSize: 11, fill: 'var(--color-text)' }}
				axisLine={false}
				tickLine={false}
			/>
			<Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} />
			<Bar dataKey='qty' radius={[0, 8, 8, 0]}>
				{rows.map((row, i) => (
					<Cell key={row.name} fill={PALETTE[i % PALETTE.length]} />
				))}
			</Bar>
		</RBarChart>
	</ResponsiveContainer>
)

const ReportsPage = () => {
	const navigate = useNavigate()
	const revenue = useMtdRevenue()
	const expenses = useMtdExpenses()
	const revenueByMonth = useRevenueByMonth()
	const ordersByStatus = useOrdersByStatus()
	const topProducts = useTopProducts()
	const customerCount = useCustomerCount()

	const profit = (revenue.data ?? 0) - (expenses.data ?? 0)
	const prevMonthTotal = revenueByMonth.data?.at(-2)?.total ?? 0
	const revenueTrend = prevMonthTotal > 0 ? Math.round(((revenue.data - prevMonthTotal) / prevMonthTotal) * 100) : null
	const revenueTarget = Math.max((revenueByMonth.data ?? []).reduce((max, r) => Math.max(max, r.total), 0), revenue.data ?? 0, 1)
	const expenseBudget = Math.max(revenueTarget * 0.6, expenses.data ?? 0, 1)

	return (
		<div className='p-6 max-w-6xl mx-auto flex flex-col gap-6'>
			<button
				onClick={() => navigate('/app')}
				className='text-xs transition-opacity opacity-50 hover:opacity-100 inline-flex items-center gap-1 self-start'
				style={{ color: 'var(--color-text)' }}>
				← Home
			</button>
			<h1 className='text-lg font-semibold' style={{ color: 'var(--color-text)' }}>Reports</h1>

			{/* Big stat numbers */}
			<div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
				<StatCard
					label='Revenue MTD'
					value={formatCurrency(revenue.data ?? 0)}
					loading={revenue.isLoading}
					sub={revenueTrend != null ? `${Math.abs(revenueTrend)}% vs last month` : 'Incoming payments this month'}
					trend={revenueTrend}
				/>
				<StatCard
					label='Expenses MTD'
					value={formatCurrency(expenses.data ?? 0)}
					loading={expenses.isLoading}
					sub='Outgoing payments this month'
				/>
				<StatCard
					label='Net Profit MTD'
					value={formatCurrency(profit)}
					loading={revenue.isLoading || expenses.isLoading}
					sub='Revenue minus expenses'
				/>
				<StatCard
					label='Total Customers'
					value={customerCount.data ?? 0}
					loading={customerCount.isLoading}
					sub='All-time records'
				/>
			</div>

			{/* Revenue trend — line chart */}
			<Section title='Revenue trend — last 6 months'>
				{revenueByMonth.isLoading ? (
					<EmptyState />
				) : !revenueByMonth.data?.length ? (
					<EmptyState />
				) : (
					<RevenueTrendChart rows={revenueByMonth.data} />
				)}
			</Section>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Gauges */}
				<Section title='Performance vs. peak'>
					{revenue.isLoading || expenses.isLoading ? (
						<EmptyState />
					) : (
						<div className='grid grid-cols-2 gap-2'>
							<GaugeChart value={revenue.data ?? 0} target={revenueTarget} label='Revenue' color='#6366f1' />
							<GaugeChart value={expenses.data ?? 0} target={expenseBudget} label='Expenses' color='#f59e0b' />
						</div>
					)}
				</Section>

				{/* Orders by status — donut */}
				<Section title='Orders by status'>
					{ordersByStatus.isLoading ? (
						<EmptyState />
					) : !ordersByStatus.data?.length ? (
						<EmptyState />
					) : (
						<OrdersDonut rows={ordersByStatus.data} />
					)}
				</Section>

				{/* Top products */}
				<Section title='Top products by units sold'>
					{topProducts.isLoading ? (
						<EmptyState />
					) : !topProducts.data?.length ? (
						<EmptyState />
					) : (
						<TopProductsBars rows={topProducts.data} />
					)}
				</Section>
			</div>
		</div>
	)
}

export default ReportsPage
