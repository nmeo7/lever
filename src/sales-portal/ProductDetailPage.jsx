import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { doc, getDoc } from 'firebase/firestore'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { db } from '@/firebase'
import { useCartStore } from './cartStore'

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(
		amount ?? 0,
	)

const useProduct = productId =>
	useQuery({
		queryKey: ['store-product', productId],
		queryFn: async () => {
			const snap = await getDoc(doc(db, 'erp-products', productId))
			return snap.exists() ? { id: snap.id, ...snap.data() } : null
		},
		enabled: !!productId,
	})

const ProductDetailPage = () => {
	const { t } = useTranslation()
	const { orgSlug, id } = useParams()
	const navigate = useNavigate()
	const { data: product, isLoading } = useProduct(id)
	const addItem = useCartStore(state => state.addItem)
	const [added, setAdded] = useState(false)

	const handleAddToCart = () => {
		addItem(orgSlug, product, 1)
		setAdded(true)
	}

	if (isLoading) {
		return (
			<p className='p-6 text-sm' style={{ color: 'var(--color-muted)' }}>
				{t('common.loading', 'Loading…')}
			</p>
		)
	}

	if (!product) {
		return (
			<p className='p-6 text-sm' style={{ color: 'var(--color-muted)' }}>
				{t('salesPortal.productNotFound', 'Product not found')}
			</p>
		)
	}

	return (
		<div className='flex flex-col gap-5 max-w-2xl mx-auto px-4 py-6'>
			<button
				onClick={() => navigate(`/${orgSlug}`)}
				className='flex items-center gap-1 text-xs transition-opacity opacity-60 hover:opacity-100 self-start'
				style={{ color: 'var(--color-text)' }}>
				<ArrowLeft size={14} strokeWidth={1.75} />
				{t('salesPortal.backToStore', 'Back to store')}
			</button>

			<div
				className='rounded-2xl overflow-hidden'
				style={{ background: 'var(--color-surface)' }}>
				{product.imageUrl ? (
					<img
						src={product.imageUrl}
						alt={product.name}
						className='w-full h-72 object-cover'
					/>
				) : (
					<div
						className='w-full h-72 flex items-center justify-center text-sm'
						style={{
							background: 'var(--color-background)',
							color: 'var(--color-muted)',
						}}>
						{t('products.noImage', 'No image')}
					</div>
				)}
			</div>

			<div className='flex flex-col gap-2'>
				<h1
					className='text-2xl font-bold'
					style={{ color: 'var(--color-text)' }}>
					{product.name}
				</h1>
				{product.category && (
					<p className='text-xs' style={{ color: 'var(--color-muted)' }}>
						{product.category}
					</p>
				)}
				<p
					className='text-xl font-bold'
					style={{ color: 'var(--color-primary)' }}>
					{formatCurrency(product.sellingPrice)}
				</p>
				{product.description && (
					<p className='text-sm' style={{ color: 'var(--color-muted)' }}>
						{product.description}
					</p>
				)}
				{product.tags?.length > 0 && (
					<div className='flex flex-wrap gap-1.5 mt-1'>
						{product.tags.map(tag => (
							<span
								key={tag}
								className='text-xs px-2.5 py-1 rounded-full'
								style={{
									background: 'var(--color-surface)',
									color: 'var(--color-muted)',
								}}>
								{tag}
							</span>
						))}
					</div>
				)}
			</div>

			<button
				onClick={handleAddToCart}
				className='flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-opacity hover:opacity-90'
				style={{ background: 'var(--color-primary)', color: '#fff' }}>
				<ShoppingCart size={16} strokeWidth={2} />
				{added ? t('salesPortal.addedToCart', 'Added to cart') : t('salesPortal.addToCart', 'Add to cart')}
			</button>
		</div>
	)
}

export default ProductDetailPage
