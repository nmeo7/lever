import { seedOrg } from './_client.js'

const SLUG = 'personal'

const org = {
	slug: SLUG,
	name: 'My Life',
	contact: { whatsapp: '15550006006' },
	brandIdentity: { template: 'empathy' },
	storefront: {
		headline: 'Welcome to My Life',
		subheadline: 'Personal workspace — no public storefront yet.',
		categories: [],
		info: [],
	},
}

const products = []

await seedOrg({
	slug: SLUG,
	org,
	products,
	user: { email: 'owner@personal.com', password: 'password123', role: 'owner' },
})
