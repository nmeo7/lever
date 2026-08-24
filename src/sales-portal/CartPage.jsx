import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useOrg } from '@/org/useOrg'
import { placeFrontdeskOrder } from '@/orders/ordersApi'
import { useCartStore } from './cartStore'

const formatCurrency = (amount) =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(amount ?? 0)

const CartLine = ({ item, onQuantityChange, onRemove }) => {
	const { t } = useTranslation()
	return (
	<div className='flex items-center justify-between gap-3 py-3' style={{ borderBottom: '1px solid var(--color-border)' }}>
		<div className='flex flex-col gap-0.5'>
			<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{item.name}</p>
			<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{t('salesPortal.priceEach', '{{price}} each', { price: formatCurrency(item.unitPrice) })}</p>
		</div>
		<div className='flex items-center gap-3'>
			<input
				type='number'
				min={1}
				value={item.quantity}
				onChange={(e) => onQuantityChange(Number(e.target.value) || 1)}
				className='w-16 text-sm text-center rounded-lg px-2 py-1 outline-none'
				style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
			/>
			<p className='text-sm font-semibold w-20 text-right' style={{ color: 'var(--color-text)' }}>
				{formatCurrency(item.unitPrice * item.quantity)}
			</p>
			<button onClick={onRemove} className='transition-opacity opacity-50 hover:opacity-100' style={{ color: 'var(--color-text)' }}>
				<Trash2 size={15} strokeWidth={1.75} />
			</button>
		</div>
	</div>
	)
}

const CartPage = () => {
	const { t } = useTranslation()
	const { orgSlug } = useParams()
	const navigate = useNavigate()
	const { data: org } = useOrg(orgSlug)
	const items = useCartStore((state) => state.getItems(orgSlug))
	const setItemQuantity = useCartStore((state) => state.setItemQuantity)
	const removeItem = useCartStore((state) => state.removeItem)
	const clearCart = useCartStore((state) => state.clearCart)
	const [placedOrderId, setPlacedOrderId] = useState(null)

	const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

	const { mutate: checkout, isPending, error } = useMutation({
		mutationFn: () =>
			placeFrontdeskOrder({
				companyId: org.id,
				items: items.map(({ productId, quantity }) => ({ productId, quantity })),
			}),
		onSuccess: ({ orderId }) => {
			clearCart(orgSlug)
			setPlacedOrderId(orderId)
		},
	})

	if (placedOrderId) {
		return (
			<div className='flex flex-col items-center justify-center gap-3 py-24 text-center'>
				<p className='text-lg font-bold' style={{ color: 'var(--color-text)' }}>{t('salesPortal.orderPlaced', 'Order placed!')}</p>
				<p className='text-sm' style={{ color: 'var(--color-muted)' }}>
					{t('salesPortal.reference', 'Reference: {{orderId}}', { orderId: placedOrderId.slice(0, 8) })}
				</p>
				<button
					onClick={() => navigate(`/${orgSlug}`)}
					className='text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90 mt-2'
					style={{ background: 'var(--color-primary)', color: '#fff' }}>
					{t('salesPortal.continueShopping', 'Continue shopping')}
				</button>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-4 max-w-2xl mx-auto px-4 py-6'>
			<button
				onClick={() => navigate(`/${orgSlug}`)}
				className='flex items-center gap-1 text-xs transition-opacity opacity-60 hover:opacity-100 self-start'
				style={{ color: 'var(--color-text)' }}>
				<ArrowLeft size={14} strokeWidth={1.75} />
				{t('salesPortal.backToStore', 'Back to store')}
			</button>

			<h1 className='text-xl font-bold' style={{ color: 'var(--color-text)' }}>{t('salesPortal.yourCart', 'Your cart')}</h1>

			{!items.length ? (
				<div
					className='rounded-2xl flex items-center justify-center h-40 text-sm'
					style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
					{t('salesPortal.cartEmpty', 'Your cart is empty')}
				</div>
			) : (
				<>
					<div className='flex flex-col'>
						{items.map((item) => (
							<CartLine
								key={item.productId}
								item={item}
								onQuantityChange={(quantity) => setItemQuantity(orgSlug, item.productId, quantity)}
								onRemove={() => removeItem(orgSlug, item.productId)}
							/>
						))}
					</div>

					<div className='flex items-center justify-between pt-2'>
						<p className='text-sm font-semibold' style={{ color: 'var(--color-text)' }}>{t('salesPortal.total', 'Total')}</p>
						<p className='text-lg font-bold' style={{ color: 'var(--color-primary)' }}>{formatCurrency(total)}</p>
					</div>

					{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}

					<button
						onClick={() => checkout()}
						disabled={isPending || !org?.id}
						className='text-sm font-semibold px-5 py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50'
						style={{ background: 'var(--color-primary)', color: '#fff' }}>
						{isPending ? t('salesPortal.placingOrder', 'Placing order…') : t('salesPortal.placeOrder', 'Place order')}
					</button>
				</>
			)}
		</div>
	)
}

export default CartPage
