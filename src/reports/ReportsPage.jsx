import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7)

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
			const total = snap.docs
				.filter(d => d.data().fiscalPeriod?.startsWith(CURRENT_MONTH))
				.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)
			return total
		},
	})

const useMtdRevenue = () =>
	useQuery({
		queryKey: ['reports-mtd-revenue'],
		queryFn: async () => {
			const snap = await getDocs(
				query(collection(db, 'erp-payments'), where('type', '==', 'incoming')),
			)
			const total = snap.docs
				.filter(d => d.data().fiscalPeriod?.startsWith(CURRENT_MONTH))
				.reduce((sum, d) => sum + (d.data().amount ?? 0), 0)
			return total
		},
	})

const StatCard = ({ label, value, loading, sub }) => (
	<div
		className='rounded-2xl p-5 flex flex-col gap-1'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{label}</p>
		<p className='text-2xl font-bold' style={{ color: 'var(--color-text)' }}>
			{loading ? '…' : value}
		</p>
		{sub && <p className='text-xs' style={{ color: 'var(--color-muted)' }}>{sub}</p>}
	</div>
)

const BarChart = ({ rows, valueKey, labelKey, color = 'var(--color-primary)' }) => {
	const max = Math.max(...rows.map(r => r[valueKey]), 1)
	return (
		<div className='flex flex-col gap-2'>
			{rows.map(row => (
				<div key={row[labelKey]} className='flex items-center gap-3'>
					<span className='text-xs w-24 truncate shrink-0' style={{ color: 'var(--color-muted)' }}>
						{row[labelKey]}
					</span>
					<div className='flex-1 h-2 rounded-full overflow-hidden' style={{ background: 'var(--color-border)' }}>
						<div
							className='h-full rounded-full'
							style={{ width: `${(row[valueKey] / max) * 100}%`, background: color }}
						/>
					</div>
					<span className='text-xs w-10 text-right shrink-0' style={{ color: 'var(--color-text)' }}>
						{row[valueKey]}
					</span>
				</div>
			))}
		</div>
	)
}

const Section = ({ title, children }) => (
	<div
		className='rounded-2xl p-6 flex flex-col gap-4'
		style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
		<h2 className='text-sm font-semibold uppercase tracking-widest' style={{ color: 'var(--color-muted)' }}>
			{title}
		</h2>
		{children}
	</div>
)

const ReportsPage = () => {
	const navigate = useNavigate()
	const revenue = useMtdRevenue()
	const expenses = useMtdExpenses()
	const revenueByMonth = useRevenueByMonth()
	const ordersByStatus = useOrdersByStatus()
	const topProducts = useTopProducts()

	const profit = (revenue.data ?? 0) - (expenses.data ?? 0)

	return (
		<div className='p-6 max-w-6xl mx-auto flex flex-col gap-6'>
			<button
				onClick={() => navigate('/app')}
				className='text-xs transition-opacity opacity-50 hover:opacity-100 inline-flex items-center gap-1 self-start'
				style={{ color: 'var(--color-text)' }}>
				← Home
			</button>
			<h1 className='text-lg font-semibold' style={{ color: 'var(--color-text)' }}>Reports</h1>

			{/* MTD summary */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
				<StatCard
					label='Revenue MTD'
					value={formatCurrency(revenue.data ?? 0)}
					loading={revenue.isLoading}
					sub='Incoming payments this month'
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
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{/* Revenue by month */}
				<Section title='Revenue — last 6 months'>
					{revenueByMonth.isLoading ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
					) : revenueByMonth.data?.length === 0 ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>No data</p>
					) : (
						<BarChart
							rows={revenueByMonth.data ?? []}
							labelKey='month'
							valueKey='total'
						/>
					)}
				</Section>

				{/* Orders by status */}
				<Section title='Orders by status'>
					{ordersByStatus.isLoading ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
					) : ordersByStatus.data?.length === 0 ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>No data</p>
					) : (
						<BarChart
							rows={ordersByStatus.data ?? []}
							labelKey='status'
							valueKey='count'
							color='var(--color-accent, #6366f1)'
						/>
					)}
				</Section>

				{/* Top products */}
				<Section title='Top products by units sold'>
					{topProducts.isLoading ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>Loading…</p>
					) : topProducts.data?.length === 0 ? (
						<p className='text-sm' style={{ color: 'var(--color-muted)' }}>No data</p>
					) : (
						<BarChart
							rows={topProducts.data ?? []}
							labelKey='name'
							valueKey='qty'
							color='#10b981'
						/>
					)}
				</Section>
			</div>
		</div>
	)
}

export default ReportsPage
