import { seedGroup, seedCompany } from './_client.js'

const GROUP_ID = 'africa-new-life'
const CHURCH_SLUG = 'africa-new-life-church'
const SCHOOL_SLUG = 'africa-new-life-school'
const HOSPITAL_SLUG = 'africa-new-life-hospital'

const group = {
	name: 'Africa New Life Rwanda',
	description:
		'Faith-based community development in Rwanda — church, school, and hospital serving the whole child and family.',
}

const sharedContact = { whatsapp: '15550003003' }
const sharedBrandIdentity = { template: 'empathy' }

const churchCompany = {
	name: 'Africa New Life — Kigali Community Church',
	contact: sharedContact,
	brandIdentity: sharedBrandIdentity,
	frontdesk: {
		template: 'informational',
		headline: 'Growing faith, transforming lives.',
		subheadline: 'Worship services, theology training, and community outreach.',
		heroImage:
			'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&h=500&fit=crop',
		categories: [
			{
				label: 'Worship Services',
				image:
					'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=200&h=200&fit=crop',
			},
			{
				label: 'Theology Training',
				image:
					'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop',
			},
			{
				label: 'Outreach',
				image:
					'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=200&h=200&fit=crop',
			},
		],
		info: [
			{ icon: '📍', text: 'Kigali, Rwanda' },
			{ icon: '🕒', text: 'Services Sun 8 AM & 10 AM' },
			{ icon: '✝️', text: 'Africa College of Theology graduates serving here' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const schoolCompany = {
	name: 'Africa New Life — Sponsorship School',
	contact: sharedContact,
	brandIdentity: sharedBrandIdentity,
	moduleOverrides: [{ id: 'customers', label: 'Students' }],
	frontdesk: {
		headline: 'Education that breaks the cycle of poverty.',
		subheadline:
			'Child sponsorship, tutoring, and vocational training programs.',
		heroImage:
			'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=500&fit=crop',
		categories: [
			{
				label: 'Child Sponsorship',
				image:
					'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=200&h=200&fit=crop',
			},
			{
				label: 'Tutoring',
				image:
					'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&h=200&fit=crop',
			},
			{
				label: 'Vocational Training',
				image:
					'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=200&fit=crop',
			},
		],
		info: [
			{ icon: '📍', text: 'Kigali, Rwanda' },
			{ icon: '🕒', text: 'Open Mon–Fri, 7 AM – 4 PM' },
			{ icon: '🎓', text: '19,000+ students sponsored since 2001' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const hospitalCompany = {
	name: 'Africa New Life — Healthy Body Clinic',
	contact: sharedContact,
	brandIdentity: sharedBrandIdentity,
	moduleOverrides: [{ id: 'customers', label: 'Patients' }],
	frontdesk: {
		headline: 'Healthy bodies for a healthy community.',
		subheadline: 'Medical checkups, maternal care, and family health services.',
		heroImage:
			'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop',
		categories: [
			{
				label: 'Checkups',
				image:
					'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop',
			},
			{
				label: 'Maternal Care',
				image:
					'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&h=200&fit=crop',
			},
			{
				label: 'Family Health',
				image:
					'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=200&h=200&fit=crop',
			},
		],
		info: [
			{ icon: '📍', text: 'Kigali, Rwanda' },
			{ icon: '🕒', text: 'Open daily, 8 AM – 6 PM' },
			{ icon: '🏥', text: 'Serving sponsored children and their families' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const churchProducts = [
	{
		name: 'Sunday Worship Service',
		price: 0,
		category: 'Worship Services',
		type: 'membership',
		term: 'dated',
		schedule: { date: null, capacity: 400 },
		description: 'Weekly community worship service, open to all.',
		imageUrl:
			'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=400&fit=crop',
	},
	{
		name: 'Africa College of Theology — Certificate Program',
		price: 120,
		category: 'Theology Training',
		type: 'membership',
		term: 'dated',
		schedule: { date: null, capacity: 40 },
		description: 'One-year theology certificate for pastors and lay leaders.',
		imageUrl:
			'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
	},
	{
		name: 'Community Outreach Visit',
		price: 0,
		category: 'Outreach',
		type: 'service',
		description: 'Home visits and prayer support for sponsored families.',
		imageUrl:
			'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=400&h=400&fit=crop',
	},
]

const schoolProducts = [
	{
		name: 'Child Sponsorship (Monthly)',
		price: 39,
		category: 'Child Sponsorship',
		type: 'membership',
		term: 'recurring',
		description:
			'Monthly sponsorship covering education, meals, and health checks for one child.',
		imageUrl:
			'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=400&fit=crop',
	},
	{
		name: 'After-School Tutoring Program',
		price: 10,
		category: 'Tutoring',
		type: 'membership',
		term: 'dated',
		schedule: { date: null, capacity: 50 },
		description: 'Weekly tutoring sessions in math, English, and science.',
		imageUrl:
			'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop',
	},
	{
		name: 'Sewing Vocational Program',
		price: 25,
		category: 'Vocational Training',
		type: 'membership',
		term: 'dated',
		schedule: { date: null, capacity: 20 },
		description:
			'Skills training program for women, based on the sewing empowerment initiative.',
		imageUrl:
			'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
	},
]

const hospitalProducts = [
	{
		name: 'General Health Checkup',
		price: 5,
		category: 'Checkups',
		type: 'service',
		description: 'Basic health screening for children and adults.',
		imageUrl:
			'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop',
	},
	{
		name: 'Prenatal & Maternal Care Visit',
		price: 8,
		category: 'Maternal Care',
		type: 'service',
		description: 'Prenatal checkup and maternal health consultation.',
		imageUrl:
			'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&h=400&fit=crop',
	},
	{
		name: 'Family Health Package',
		price: 20,
		category: 'Family Health',
		type: 'membership',
		term: 'recurring',
		description: 'Quarterly health package covering a full family household.',
		imageUrl:
			'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=400&fit=crop',
	},
]

const churchCustomers = [
	{
		name: 'Alice Uwimana',
		company: '',
		email: 'alice.uwimana@example.com',
		phone: '+250780000201',
		address: 'Kigali, Rwanda',
		source: 'walk-in',
		status: 'active',
		estimatedValue: 0,
		summary:
			'Regular Sunday service attendee, interested in theology certificate.',
		preferences: {},
		tags: ['congregant'],
		metadata: {},
		attachments: [],
	},
]

const schoolCustomers = [
	{
		name: 'Emmanuel Habimana',
		company: '',
		email: 'emmanuel.habimana@example.com',
		phone: '+250780000202',
		address: 'Kigali, Rwanda',
		source: 'referral',
		status: 'active',
		estimatedValue: 39,
		summary: 'Sponsored student, doing well in the tutoring program.',
		preferences: {},
		tags: ['student'],
		metadata: {},
		attachments: [],
	},
]

const hospitalCustomers = [
	{
		name: 'Grace Mukamana',
		company: '',
		email: 'grace.mukamana@example.com',
		phone: '+250780000203',
		address: 'Kigali, Rwanda',
		source: 'walk-in',
		status: 'lead',
		estimatedValue: 8,
		summary: 'Booked a prenatal checkup for next week.',
		preferences: {},
		tags: ['patient', 'maternal-care'],
		metadata: {},
		attachments: [],
	},
]

const churchConversations = [
	{
		customerIndex: 0,
		messages: [
			{
				id: '1',
				type: 'received',
				content: 'What time is the Sunday service?',
				attachments: [],
				timestamp: new Date().toISOString(),
			},
			{
				id: '2',
				type: 'sent',
				content: 'We have services at 8 AM and 10 AM every Sunday.',
				attachments: [],
				timestamp: new Date().toISOString(),
			},
		],
		context: '',
		summary: 'Asked about service times.',
		lastMessage: 'We have services at 8 AM and 10 AM every Sunday.',
	},
]

const schoolConversations = [
	{
		customerIndex: 0,
		messages: [
			{
				id: '1',
				type: 'received',
				content: 'How is my sponsored student doing this term?',
				attachments: [],
				timestamp: new Date().toISOString(),
			},
		],
		context: '',
		summary: 'Sponsor asking about student progress.',
		lastMessage: 'How is my sponsored student doing this term?',
	},
]

const hospitalConversations = [
	{
		customerIndex: 0,
		messages: [
			{
				id: '1',
				type: 'received',
				content: 'Do you have prenatal appointments this week?',
				attachments: [],
				timestamp: new Date().toISOString(),
			},
		],
		context: '',
		summary: 'Asked about prenatal appointment availability.',
		lastMessage: 'Do you have prenatal appointments this week?',
	},
]

const churchScoped = {
	'erp-payments': [
		{
			type: 'incoming',
			category: 'donation',
			amount: 120,
			currency: 'FRW',
			paymentDate: new Date().toISOString(),
			fiscalPeriod: new Date().toISOString().slice(0, 7),
			method: 'bank',
			notes: 'Theology certificate tuition',
			createdAt: new Date().toISOString(),
		},
	],
	'erp-resources': [
		{
			name: 'Sanctuary Sound System',
			categoryIds: [],
			serialNumber: 'CH-1001',
			purchaseDate: '2020-02-15',
			expirationDate: '',
			purchaseCost: 3000,
			currentValue: 1800,
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

const schoolScoped = {
	'erp-payments': [
		{
			type: 'incoming',
			category: 'sponsorship',
			amount: 39,
			currency: 'FRW',
			paymentDate: new Date().toISOString(),
			fiscalPeriod: new Date().toISOString().slice(0, 7),
			method: 'card',
			notes: 'Monthly child sponsorship',
			createdAt: new Date().toISOString(),
		},
	],
	'erp-resources': [
		{
			name: 'Classroom Desks (Set of 30)',
			categoryIds: [],
			serialNumber: 'SC-2001',
			purchaseDate: '2021-08-01',
			expirationDate: '',
			purchaseCost: 1500,
			currentValue: 1100,
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

const hospitalScoped = {
	'erp-payments': [
		{
			type: 'incoming',
			category: 'service',
			amount: 8,
			currency: 'FRW',
			paymentDate: new Date().toISOString(),
			fiscalPeriod: new Date().toISOString().slice(0, 7),
			method: 'cash',
			notes: 'Prenatal checkup fee',
			createdAt: new Date().toISOString(),
		},
	],
	'erp-resources': [
		{
			name: 'Ultrasound Machine',
			categoryIds: [],
			serialNumber: 'HO-3001',
			purchaseDate: '2019-11-20',
			expirationDate: '',
			purchaseCost: 12000,
			currentValue: 7500,
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

await seedGroup({ groupId: GROUP_ID, group })

await seedCompany({
	slug: CHURCH_SLUG,
	company: churchCompany,
	groupId: GROUP_ID,
	typeId: 'generic',
	products: churchProducts,
	customers: churchCustomers,
	conversations: churchConversations,
	companyScoped: churchScoped,
	user: {
		name: 'Pastor Samuel Mugisha',
		email: 'samuel@africa-new-life.com',
		password: 'password123',
		roleId: 'employee',
		companyIds: [CHURCH_SLUG],
		groupId: GROUP_ID,
	},
})

await seedCompany({
	slug: SCHOOL_SLUG,
	company: schoolCompany,
	groupId: GROUP_ID,
	typeId: 'generic',
	products: schoolProducts,
	customers: schoolCustomers,
	conversations: schoolConversations,
	companyScoped: schoolScoped,
	user: {
		name: 'Beatrice Ingabire',
		email: 'beatrice@africa-new-life.com',
		password: 'password123',
		roleId: 'employee',
		companyIds: [SCHOOL_SLUG],
		groupId: GROUP_ID,
	},
})

await seedCompany({
	slug: HOSPITAL_SLUG,
	company: hospitalCompany,
	groupId: GROUP_ID,
	typeId: 'generic',
	products: hospitalProducts,
	customers: hospitalCustomers,
	conversations: hospitalConversations,
	companyScoped: hospitalScoped,
	users: [
		{
			name: 'Dr. Claude Niyonzima',
			email: 'claude@africa-new-life.com',
			password: 'password123',
			roleId: 'employee',
			companyIds: [HOSPITAL_SLUG],
			groupId: GROUP_ID,
		},
		{
			name: 'Diane Mutesi',
			email: 'owner@africa-new-life.com',
			password: 'password123',
			roleId: 'admin',
			companyIds: [CHURCH_SLUG, SCHOOL_SLUG, HOSPITAL_SLUG],
			groupId: GROUP_ID,
		},
	],
})
