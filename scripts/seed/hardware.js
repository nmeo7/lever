import { seedOrg } from './_client.js'

const SLUG = 'hardware'

const org = {
	slug: SLUG,
	name: 'BuildRight Hardware',
	contact: { whatsapp: '15550005005' },
	brandIdentity: { template: 'empathy' },
	storefront: {
		headline: 'Everything for the job, in one place.',
		subheadline: 'Tools, paint, plumbing, electrical, and garden supplies for builders and DIYers.',
		heroImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop',
		categories: [
			{ label: 'Tools', image: 'https://images.unsplash.com/photo-1581147036324-c1c9b6a0e6b4?w=200&h=200&fit=crop' },
			{ label: 'Paint', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=200&h=200&fit=crop' },
			{ label: 'Plumbing', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200&h=200&fit=crop' },
			{ label: 'Electrical', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop' },
			{ label: 'Garden', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop' },
		],
		info: [
			{ icon: '📍', text: 'Nyabugogo' },
			{ icon: '🕒', text: 'Open Mon–Sat, 7 AM – 7 PM' },
			{ icon: '🚚', text: 'Delivery available' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const products = [
	{ name: 'Cordless Drill 18V', price: 55, category: 'Tools', type: 'physical', description: 'Includes battery, charger, and case.', imageUrl: 'https://images.unsplash.com/photo-1581147036324-c1c9b6a0e6b4?w=400&h=400&fit=crop' },
	{ name: 'Claw Hammer 16oz', price: 9, category: 'Tools', type: 'physical', description: 'Fiberglass handle, steel head.', imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=400&fit=crop' },
	{ name: 'Tool Set (45-piece)', price: 42, category: 'Tools', type: 'physical', description: 'Sockets, wrenches, and screwdrivers in a case.', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop' },
	{ name: 'Measuring Tape 5m', price: 6, category: 'Tools', type: 'physical', description: 'Retractable steel tape with lock.', imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop' },
	{ name: 'Interior Paint 5L', price: 28, category: 'Paint', type: 'physical', description: 'Matte white, washable finish.', imageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop' },
	{ name: 'Exterior Paint 5L', price: 34, category: 'Paint', type: 'physical', description: 'Weather-resistant, choice of colors.', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop' },
	{ name: 'Paint Roller Kit', price: 8, category: 'Paint', type: 'physical', description: 'Roller, tray, and brush set.', imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&h=400&fit=crop' },
	{ name: 'PVC Pipe 3m', price: 7, category: 'Plumbing', type: 'physical', description: '1-inch diameter, standard fitting.', imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=400&fit=crop' },
	{ name: 'Faucet Mixer Tap', price: 24, category: 'Plumbing', type: 'physical', description: 'Chrome-finish kitchen mixer tap.', imageUrl: 'https://images.unsplash.com/photo-1584622781867-1c5e343df8ab?w=400&h=400&fit=crop' },
	{ name: 'Pipe Wrench 14"', price: 14, category: 'Plumbing', type: 'physical', description: 'Adjustable wrench for pipe fittings.', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop' },
	{ name: 'LED Bulb Pack (4)', price: 10, category: 'Electrical', type: 'physical', description: '9W bulbs, warm white, E27 base.', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop' },
	{ name: 'Extension Cable 10m', price: 12, category: 'Electrical', type: 'physical', description: '3-socket extension cable with surge protection.', imageUrl: 'https://images.unsplash.com/photo-1601060506872-3e3a5a95935f?w=400&h=400&fit=crop' },
	{ name: 'Circuit Breaker 20A', price: 9, category: 'Electrical', type: 'physical', description: 'Single-pole breaker for home panels.', imageUrl: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop' },
	{ name: 'Garden Hose 20m', price: 18, category: 'Garden', type: 'physical', description: 'Kink-resistant hose with spray nozzle.', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop' },
	{ name: 'Pruning Shears', price: 11, category: 'Garden', type: 'physical', description: 'Bypass pruners for stems and small branches.', imageUrl: 'https://images.unsplash.com/photo-1585513553738-84f8c0e5d1e2?w=400&h=400&fit=crop' },
]

await seedOrg({
	slug: SLUG,
	org,
	products,
	user: { email: 'owner@hardware.com', password: 'password123', role: 'owner' },
})
