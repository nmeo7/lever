import { seedCompany } from './_client.js'

const SLUG = 'platform'

const company = {
	name: 'Lever',
	contact: { whatsapp: '15550000000' },
	brandIdentity: { template: 'empathy' },
	frontdesk: {
		headline: 'Bring your business online.',
		subheadline:
			'One storefront and backoffice for gyms, shops, studios, and more — pick a plan and get onboarded.',
		heroImage:
			'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=500&fit=crop',
		categories: [
			{
				label: 'Memberships',
				image:
					'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
			},
		],
		info: [
			{ icon: '📍', text: 'Kigali, Rwanda' },
			{ icon: '🕒', text: 'Support Mon–Fri, 8 AM – 6 PM' },
			{ icon: '🚀', text: 'Onboarding in under a week' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const products = [
	{
		name: 'Starter Plan',
		price: 20,
		category: 'Memberships',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		description: 'Storefront + backoffice for one business, up to 50 products.',
		imageUrl:
			'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
	},
	{
		name: 'Growth Plan',
		price: 45,
		category: 'Memberships',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		description: 'Unlimited products, priority support, custom branding.',
		imageUrl:
			'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
	},
	{
		name: 'Enterprise Plan',
		price: 120,
		category: 'Memberships',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		description:
			'Multi-location support, dedicated onboarding, custom integrations.',
		imageUrl:
			'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=400&fit=crop',
	},
]

await seedCompany({
	slug: SLUG,
	company,
	typeId: 'generic',
	products,
	user: { email: 'admin@lev.rw', password: 'password123', roleId: 'admin', isPlatformAdmin: true },
})
