import { create } from 'zustand'

const CART_KEY = 'lever_cart'

const loadStoredCart = () => {
	const raw = localStorage.getItem(CART_KEY)
	if (!raw) return {}
	try {
		return JSON.parse(raw)
	} catch {
		return {}
	}
}

const persist = cartsByOrg =>
	localStorage.setItem(CART_KEY, JSON.stringify(cartsByOrg))

export const useCartStore = create((set, get) => ({
	cartsByOrg: loadStoredCart(),

	getItems: orgSlug => get().cartsByOrg[orgSlug] ?? [],

	addItem: (orgSlug, product, quantity = 1) =>
		set(state => {
			const items = state.cartsByOrg[orgSlug] ?? []
			const existing = items.find(item => item.productId === product.id)
			const nextItems = existing
				? items.map(item =>
						item.productId === product.id
							? { ...item, quantity: item.quantity + quantity }
							: item,
					)
				: [
						...items,
						{
							productId: product.id,
							name: product.name,
							unitPrice: product.sellingPrice,
							quantity,
						},
					]

			const cartsByOrg = { ...state.cartsByOrg, [orgSlug]: nextItems }
			persist(cartsByOrg)
			return { cartsByOrg }
		}),

	setItemQuantity: (orgSlug, productId, quantity) =>
		set(state => {
			const items = state.cartsByOrg[orgSlug] ?? []
			const nextItems =
				quantity <= 0
					? items.filter(item => item.productId !== productId)
					: items.map(item =>
							item.productId === productId ? { ...item, quantity } : item,
						)

			const cartsByOrg = { ...state.cartsByOrg, [orgSlug]: nextItems }
			persist(cartsByOrg)
			return { cartsByOrg }
		}),

	removeItem: (orgSlug, productId) =>
		set(state => {
			const items = (state.cartsByOrg[orgSlug] ?? []).filter(
				item => item.productId !== productId,
			)
			const cartsByOrg = { ...state.cartsByOrg, [orgSlug]: items }
			persist(cartsByOrg)
			return { cartsByOrg }
		}),

	clearCart: orgSlug =>
		set(state => {
			const cartsByOrg = { ...state.cartsByOrg, [orgSlug]: [] }
			persist(cartsByOrg)
			return { cartsByOrg }
		}),
}))
