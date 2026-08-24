import { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '@/sales-portal/cartStore'

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(
		amount ?? 0,
	)

export const CartTray = ({ orgSlug }) => {
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)
	const ref = useRef(null)
	const navigate = useNavigate()

	useEffect(() => {
		const handler = e => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false)
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [])

	const items = useCartStore(state => state.getItems(orgSlug))
	const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
	const count = items.reduce((sum, i) => sum + i.quantity, 0)

	return (
		<div className='relative' ref={ref}>
			<button
				onClick={() => setOpen(v => !v)}
				className='relative w-9 h-9 flex items-center justify-center rounded-full transition-opacity opacity-70 hover:opacity-100'
				style={{ color: 'var(--color-text)' }}>
				<svg
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'>
					<circle cx='9' cy='21' r='1' />
					<circle cx='20' cy='21' r='1' />
					<path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' />
				</svg>
				{count > 0 && (
					<span
						className='absolute top-0 right-0 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center'
						style={{ background: 'var(--color-primary)' }}>
						{count > 9 ? '9+' : count}
					</span>
				)}
			</button>

			{open && (
				<div
					className='absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50 flex flex-col'
					style={{
						background: 'var(--color-surface)',
						border: '1px solid var(--color-border)',
					}}>
					<div
						className='px-4 py-3 flex items-center justify-between'
						style={{ borderBottom: '1px solid var(--color-border)' }}>
						<span
							className='text-xs font-semibold uppercase tracking-widest'
							style={{ color: 'var(--color-muted)' }}>
							{t('salesPortal.yourCart', 'Your cart')}
						</span>
						<span className='text-xs' style={{ color: 'var(--color-muted)' }}>
							{t('salesPortal.itemCount', '{{count}} items', { count })}
						</span>
					</div>

					<div className='flex flex-col max-h-72 overflow-y-auto'>
						{items.map(item => (
							<div
								key={item.productId}
								className='px-4 py-3 flex items-center gap-3'
								style={{ borderBottom: '1px solid var(--color-border)' }}>
								<div className='flex-1 min-w-0'>
									<p
										className='text-sm truncate'
										style={{ color: 'var(--color-text)' }}>
										{item.name}
									</p>
									<p
										className='text-xs'
										style={{ color: 'var(--color-muted)' }}>
										×{item.quantity}
									</p>
								</div>
								<span
									className='text-sm font-semibold flex-shrink-0'
									style={{ color: 'var(--color-primary)' }}>
									{formatCurrency(item.unitPrice * item.quantity)}
								</span>
							</div>
						))}
					</div>

					<div
						className='px-4 py-3 flex items-center justify-between'
						style={{ borderTop: '1px solid var(--color-border)' }}>
						<span
							className='text-sm font-bold'
							style={{ color: 'var(--color-text)' }}>
							{formatCurrency(total)}
						</span>
						<button
							onClick={() => {
								navigate(`/${orgSlug}/cart`)
								setOpen(false)
							}}
							className='text-sm font-semibold px-4 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90'
							style={{ background: 'var(--color-primary)' }}>
							{t('salesPortal.checkout', 'Checkout →')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const PortalLayout = () => {
	const { t } = useTranslation()
	return (
		<div
			className='min-h-screen'
			style={{
				background: 'var(--color-background)',
				color: 'var(--color-text)',
				fontFamily: 'var(--font-family)',
			}}>
			<div className='sticky top-0 z-50 max-w-6xl mx-auto px-6'>
				<div className='flex justify-between pt-5'>
					<Link
						to='/'
						title={t('common.home', 'Home')}
						className='text-sm font-bold tracking-tight transition-opacity opacity-80 hover:opacity-100'
						style={{ color: 'var(--color-text)' }}>
						Lever
					</Link>
				</div>
			</div>

			<main className='max-w-6xl mx-auto px-6 -mt-14'>
				<Outlet />
			</main>
		</div>
	)
}

export default PortalLayout
