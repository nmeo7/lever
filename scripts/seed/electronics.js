import { seedOrg } from './_client.js'

const SLUG = 'electronics'

const org = {
	slug: SLUG,
	name: 'ByteMart Electronics',
	contact: { whatsapp: '15550004004' },
	brandIdentity: { template: 'winter' },
	storefront: {
		headline: 'The latest tech, in stock now.',
		subheadline: 'Phones, laptops, audio, gaming, and accessories — with same-day delivery in Kigali.',
		heroImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=500&fit=crop',
		categories: [
			{ label: 'Phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
			{ label: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
			{ label: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
			{ label: 'Gaming', image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200&h=200&fit=crop' },
			{ label: 'Accessories', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&h=200&fit=crop' },
		],
		info: [
			{ icon: '📍', text: 'Kigali Heights' },
			{ icon: '🕒', text: 'Open daily, 9 AM – 9 PM' },
			{ icon: '🚚', text: 'Same-day delivery in Kigali' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const products = [
	{ name: 'Nova X12 Smartphone', price: 399, category: 'Phones', type: 'physical', description: '128GB storage, 6.5" display, dual camera.', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
	{ name: 'Nova Lite Smartphone', price: 199, category: 'Phones', type: 'physical', description: '64GB storage, budget-friendly daily driver.', imageUrl: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop' },
	{ name: 'Phone Case (Universal)', price: 8, category: 'Phones', type: 'physical', description: 'Shockproof silicone case, multiple sizes.', imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=400&fit=crop' },
	{ name: 'Aero 14 Laptop', price: 650, category: 'Laptops', type: 'physical', description: '14" laptop, 8GB RAM, 256GB SSD.', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
	{ name: 'Aero Pro 16 Laptop', price: 950, category: 'Laptops', type: 'physical', description: '16" laptop, 16GB RAM, 512GB SSD, dedicated GPU.', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
	{ name: 'Laptop Sleeve 15"', price: 15, category: 'Laptops', type: 'physical', description: 'Padded neoprene sleeve, water-resistant.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
	{ name: 'Wireless Earbuds Pro', price: 65, category: 'Audio', type: 'physical', description: 'Active noise cancelling, 24h battery with case.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
	{ name: 'Over-Ear Headphones', price: 85, category: 'Audio', type: 'physical', description: 'Studio-grade over-ear headphones with mic.', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop' },
	{ name: 'Bluetooth Speaker', price: 45, category: 'Audio', type: 'physical', description: 'Portable waterproof speaker, 12h battery.', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
	{ name: 'Wireless Controller', price: 40, category: 'Gaming', type: 'physical', description: 'Bluetooth controller, compatible with PC and mobile.', imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop' },
	{ name: '1TB Gaming SSD', price: 75, category: 'Gaming', type: 'physical', description: 'NVMe SSD for faster load times.', imageUrl: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=400&h=400&fit=crop' },
	{ name: 'Gaming Headset', price: 55, category: 'Gaming', type: 'physical', description: '7.1 surround sound with noise-cancelling mic.', imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop' },
	{ name: '20W USB-C Charger', price: 12, category: 'Accessories', type: 'physical', description: 'Fast-charging wall adapter.', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop' },
	{ name: '10000mAh Power Bank', price: 20, category: 'Accessories', type: 'physical', description: 'Dual-port portable charger.', imageUrl: 'https://images.unsplash.com/photo-1609592806598-04b3f7b0d4c0?w=400&h=400&fit=crop' },
]

await seedOrg({
	slug: SLUG,
	org,
	products,
	user: { email: 'owner@electronics.com', password: 'password123', role: 'owner' },
})
