import { seedCompany } from './_client.js'

const SLUG = 'personal'

const company = {
	name: 'My Life',
	contact: { whatsapp: '15550006006' },
	brandIdentity: { template: 'empathy' },
	frontdesk: {
		headline: 'Welcome to My Life',
		subheadline: 'Personal workspace — no public storefront yet.',
		categories: [],
		info: [],
	},
}

const products = []

await seedCompany({
	slug: SLUG,
	company,
	typeId: 'generic',
	products,
	user: { email: 'owner@personal.com', password: 'password123', roleId: 'admin' },
})
