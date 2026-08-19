import { callAuthedFunction } from '@/util/functionsClient'

export const fetchProducts = async () => {
	const { products } = await callAuthedFunction('products')
	return products
}

export const createProduct = async (product) => {
	return callAuthedFunction('products', { method: 'POST', body: product })
}

export const searchProducts = async (query) => {
	const { products } = await callAuthedFunction('products', {
		method: 'POST',
		path: '/search',
		body: { query },
	})
	return products
}

export const PRODUCT_TYPES = [
	{ value: 'physical', label: 'Physical' },
	{ value: 'service', label: 'Service' },
	{ value: 'subscription', label: 'Subscription' },
	{ value: 'access', label: 'Access' },
]
