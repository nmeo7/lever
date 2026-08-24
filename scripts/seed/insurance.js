import { seedCompany } from './_client.js'

const SLUG = 'insurance'

const company = {
	name: 'Umutekano Insurance',
	contact: { whatsapp: '15550003003' },
	brandIdentity: { template: 'winter' },
	frontdesk: {
		template: 'services',
		headline: 'Protection you can count on.',
		subheadline:
			'Auto, health, home, life, and business cover — talk to us and get a quote today.',
		heroImage:
			'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=500&fit=crop',
		categories: [
			{
				label: 'Auto',
				image:
					'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=200&fit=crop',
			},
			{
				label: 'Health',
				image:
					'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop',
			},
			{
				label: 'Home',
				image:
					'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
			},
			{
				label: 'Life',
				image:
					'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop',
			},
			{
				label: 'Business',
				image:
					'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
			},
		],
		info: [
			{ icon: '📍', text: 'Kigali City Centre' },
			{ icon: '🕒', text: 'Open Mon–Fri, 8 AM – 6 PM' },
			{ icon: '📞', text: '24/7 claims hotline' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const products = [
	{
		name: 'Auto Basic Plan',
		price: 25,
		category: 'Auto',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Third-party liability cover, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=400&fit=crop',
	},
	{
		name: 'Auto Comprehensive Plan',
		price: 60,
		category: 'Auto',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Full collision and theft cover, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=400&fit=crop',
	},
	{
		name: 'Motorcycle Plan',
		price: 15,
		category: 'Auto',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Cover for motorcycles and scooters, monthly.',
		imageUrl:
			'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&h=400&fit=crop',
	},
	{
		name: 'Health Individual Plan',
		price: 40,
		category: 'Health',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Outpatient and inpatient cover, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop',
	},
	{
		name: 'Health Family Plan',
		price: 95,
		category: 'Health',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Covers up to 5 dependents, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=400&h=400&fit=crop',
	},
	{
		name: 'Dental Add-On',
		price: 12,
		category: 'Health',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Optional dental cover add-on, monthly.',
		imageUrl:
			'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop',
	},
	{
		name: 'Home Basic Plan',
		price: 20,
		category: 'Home',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Fire and theft cover for renters, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop',
	},
	{
		name: 'Home Owner Plan',
		price: 45,
		category: 'Home',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Structure and contents cover for homeowners.',
		imageUrl:
			'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=400&fit=crop',
	},
	{
		name: 'Life Term Plan',
		price: 30,
		category: 'Life',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: '20-year term life cover, monthly premium.',
		imageUrl:
			'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop',
	},
	{
		name: 'Life Whole Plan',
		price: 70,
		category: 'Life',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Lifetime cover with savings component.',
		imageUrl:
			'https://images.unsplash.com/photo-1518281420975-50db6e5d0a97?w=400&h=400&fit=crop',
	},
	{
		name: 'Business Liability Plan',
		price: 55,
		category: 'Business',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'General liability cover for small businesses.',
		imageUrl:
			'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop',
	},
	{
		name: 'Business Property Plan',
		price: 80,
		category: 'Business',
		type: 'membership',
		term: 'ongoing',
		billingPeriod: 'monthly',
		conditional: true,
		description: 'Covers commercial property and equipment.',
		imageUrl:
			'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
	},
]

const customers = [
	{
		name: 'Diane Mukamana',
		company: '',
		email: 'diane.mukamana@example.com',
		phone: '+250780000401',
		address: 'Kigali City Centre',
		source: 'walk-in',
		status: 'active',
		estimatedValue: 40,
		summary: 'Health Individual Plan holder, monthly premium.',
		preferences: {},
		tags: ['policyholder'],
		metadata: {},
		attachments: [],
	},
]

const companyScoped = {
	'erp-payments': [
		{
			type: 'incoming',
			category: 'subscription',
			amount: 40,
			currency: 'FRW',
			paymentDate: new Date().toISOString(),
			fiscalPeriod: new Date().toISOString().slice(0, 7),
			method: 'bank',
			notes: 'Health Individual Plan premium',
			createdAt: new Date().toISOString(),
		},
	],
	'erp-resources': [
		{
			name: 'Office Workstations (x6)',
			categoryIds: [],
			serialNumber: 'WS-901',
			purchaseDate: '2022-02-10',
			expirationDate: '',
			purchaseCost: 4200,
			currentValue: 3000,
			locationId: '',
			assignedPersonId: '',
			condition: 'good',
			status: 'available',
			metadata: {},
			attachments: [],
			events: [],
		},
	],
}

await seedCompany({
	slug: SLUG,
	company,
	typeId: 'generic',
	products,
	customers,
	companyScoped,
	user: {
		email: 'owner@insurance.com',
		password: 'password123',
		roleId: 'admin',
	},
})
