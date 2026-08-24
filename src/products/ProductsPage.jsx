import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Modal, Form, Input, InputNumber, Select } from 'antd'
import { Plus, Search, X } from 'lucide-react'
import PageShell from '@/util/components/PageShell'
import { fetchProducts, createProduct, searchProducts, PRODUCT_TYPES } from './productsApi'

const formatCurrency = amount =>
	new Intl.NumberFormat('en-US', { style: 'currency', currency: 'FRW' }).format(amount ?? 0)

const ProductCard = ({ product }) => {
	const { t } = useTranslation()
	return (
	<div
		className='neu-raised rounded-2xl overflow-hidden flex flex-col'
		style={{ background: 'var(--neu-bg)' }}>
		<div className='h-32 flex items-center justify-center' style={{ background: 'var(--color-background)' }}>
			{product.imageUrl ? (
				<img src={product.imageUrl} alt={product.name} className='w-full h-full object-cover' />
			) : (
				<span className='text-xs' style={{ color: 'var(--color-muted)' }}>{t('products.noImage', 'No image')}</span>
			)}
		</div>
		<div className='p-3 flex flex-col gap-1'>
			<div className='flex items-center justify-between gap-2'>
				<p className='text-sm font-semibold truncate' style={{ color: 'var(--color-text)' }}>{product.name}</p>
				<span
					className='text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0'
					style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
					{product.productType}
				</span>
			</div>
			<p className='text-sm font-bold' style={{ color: 'var(--color-primary)' }}>
				{formatCurrency(product.sellingPrice)}
			</p>
			{product.category && (
				<p className='text-xs' style={{ color: 'var(--color-muted)' }}>{product.category}</p>
			)}
			{product.description && (
				<p className='text-xs line-clamp-2' style={{ color: 'var(--color-muted)' }}>{product.description}</p>
			)}
			{product.tags?.length > 0 && (
				<div className='flex flex-wrap gap-1 mt-1'>
					{product.tags.map((tag) => (
						<span
							key={tag}
							className='text-[10px] px-2 py-0.5 rounded-full'
							style={{ background: 'var(--color-background)', color: 'var(--color-muted)' }}>
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	</div>
	)
}

const AddProductModal = ({ open, onClose }) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const [form] = Form.useForm()

	const { mutate, isPending, error, reset } = useMutation({
		mutationFn: (values) => createProduct({ ...values, sellingPrice: Number(values.sellingPrice) || 0 }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] })
			form.resetFields()
			onClose()
		},
	})

	const handleClose = () => {
		reset()
		form.resetFields()
		onClose()
	}

	return (
		<Modal
			title={t('products.addProduct', 'Add product')}
			open={open}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={isPending}
			okText={t('products.saveProduct', 'Save product')}
			destroyOnHidden>
			<Form form={form} layout='vertical' onFinish={mutate} className='pt-2'>
				<Form.Item name='name' label={t('common.name', 'Name')} rules={[{ required: true, message: t('people.nameRequired', 'Name is required') }]}>
					<Input />
				</Form.Item>

				<Form.Item name='imageUrl' label={t('products.imageUrl', 'Image URL')}>
					<Input />
				</Form.Item>

				<Form.Item name='productType' label={t('common.type', 'Type')} initialValue='physical' rules={[{ required: true }]}>
					<Select options={PRODUCT_TYPES.map(({ value, label }) => ({ value, label }))} />
				</Form.Item>

				<Form.Item name='sellingPrice' label={t('products.price', 'Price')}>
					<InputNumber min={0} step={0.01} className='w-full' />
				</Form.Item>

				<Form.Item name='category' label={t('products.category', 'Category')}>
					<Input />
				</Form.Item>

				<Form.Item name='tags' label={t('products.tags', 'Tags')}>
					<Select mode='tags' open={false} tokenSeparators={[',']} placeholder={t('products.tagsPlaceholder', 'Type a tag and press enter')} />
				</Form.Item>

				<Form.Item name='description' label={t('products.description', 'Description')}>
					<Input.TextArea rows={3} />
				</Form.Item>

				{error && <p className='text-xs' style={{ color: '#dc2626' }}>{error.message}</p>}
			</Form>
		</Modal>
	)
}

const ProductsPage = () => {
	const { t } = useTranslation()
	const [panelOpen, setPanelOpen] = useState(false)
	const [searchInput, setSearchInput] = useState('')
	const [searchResults, setSearchResults] = useState(null)

	const { data: products, isLoading } = useQuery({
		queryKey: ['products'],
		queryFn: fetchProducts,
	})

	const { mutate: runSearch, isPending: isSearching } = useMutation({
		mutationFn: searchProducts,
		onSuccess: setSearchResults,
	})

	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter' && searchInput.trim()) runSearch(searchInput.trim())
		if (e.key === 'Enter' && !searchInput.trim()) setSearchResults(null)
	}

	const clearSearch = () => {
		setSearchInput('')
		setSearchResults(null)
	}

	const visibleProducts = searchResults ?? products

	return (
		<PageShell title={t('products.title', 'Products')}>
			<div className='flex flex-col gap-5'>
				<div className='flex items-center gap-3'>
					<div className='relative max-w-md flex-1'>
						<Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2' style={{ color: 'var(--color-muted)' }} />
						<input
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							onKeyDown={handleSearchKeyDown}
							placeholder={t('products.searchPlaceholder', 'Search products by meaning, e.g. "monthly plans"')}
							className='w-full rounded-xl pl-9 pr-8 py-2 text-sm outline-none border'
							style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
						/>
						{searchResults && (
							<button onClick={clearSearch} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100' style={{ color: 'var(--color-text)' }}>
								<X size={14} strokeWidth={1.75} />
							</button>
						)}
					</div>
					<button
						onClick={() => setPanelOpen(true)}
						className='flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl shrink-0'
						style={{ background: 'var(--color-primary)', color: 'var(--color-surface)' }}>
						<Plus size={15} strokeWidth={2} />
						{t('products.addProduct', 'Add product')}
					</button>
				</div>

				{isLoading || isSearching ? (
					<p className='text-sm' style={{ color: 'var(--color-muted)' }}>{t('common.loading', 'Loading…')}</p>
				) : !visibleProducts?.length ? (
					<div
						className='rounded-2xl flex items-center justify-center h-48 text-sm'
						style={{ border: '2px dashed var(--color-border)', color: 'var(--color-muted)' }}>
						{t('products.emptyState', 'No products found')}
					</div>
				) : (
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
						{visibleProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>

			<AddProductModal open={panelOpen} onClose={() => setPanelOpen(false)} />
		</PageShell>
	)
}

export default ProductsPage
