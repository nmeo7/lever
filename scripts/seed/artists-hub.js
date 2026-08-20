import { seedGroup, seedCompany } from './_client.js'

const GROUP_ID = 'artists-hub'
const KIMIHURURA_SLUG = 'artists-hub-kimihurura'
const NYAMIRAMBO_SLUG = 'artists-hub-nyamirambo'

const group = {
	name: 'Kigali Artists Hub',
	description: 'Rwandan culture, live and hands-on — events, tourism, trainings, and instruments across two locations.',
}

const sharedContact = { whatsapp: '15550002002' }
const sharedBrandIdentity = { template: 'empathy' }

const kimihururaCompany = {
	name: 'Kigali Artists Hub — Kimihurura',
	contact: sharedContact,
	brandIdentity: sharedBrandIdentity,
	storefront: {
		headline: 'Rwandan culture, live and hands-on.',
		subheadline: 'Events, cultural games, trainings, and traditional instruments.',
		heroImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=500&fit=crop',
		categories: [
			{ label: 'Events', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=200&fit=crop' },
			{ label: 'Cultural Games', image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=200&h=200&fit=crop' },
			{ label: 'Trainings', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=200&h=200&fit=crop' },
			{ label: 'Instruments', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&h=200&fit=crop' },
		],
		info: [
			{ icon: '📍', text: 'Kimihurura' },
			{ icon: '🕒', text: 'Open Tue–Sun, 10 AM – 7 PM' },
			{ icon: '🎭', text: 'New events posted every month' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const nyamiramboCompany = {
	name: 'Kigali Artists Hub — Nyamirambo',
	contact: sharedContact,
	brandIdentity: sharedBrandIdentity,
	storefront: {
		headline: 'Tourism and talent, straight from the neighborhood.',
		subheadline: 'Guided tours, homestays, and talent bookings.',
		heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=500&fit=crop',
		categories: [
			{ label: 'Tourism', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=200&h=200&fit=crop' },
			{ label: 'Talent Booking', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop' },
		],
		info: [
			{ icon: '📍', text: 'Nyamirambo' },
			{ icon: '🕒', text: 'Open Tue–Sun, 10 AM – 7 PM' },
			{ icon: '🎭', text: 'Bookings available same week' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const kimihururaProducts = [
	{ name: 'Kigali Cultural Night', price: 15, category: 'Events', type: 'membership', term: 'dated', schedule: { date: null, capacity: 150 }, description: 'An evening of traditional dance, music, and storytelling.', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=400&fit=crop' },
	{ name: 'Umuganura Harvest Festival', price: 10, category: 'Events', type: 'membership', term: 'dated', schedule: { date: null, capacity: 300 }, description: 'Celebrate the traditional harvest festival with the community.', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop' },
	{ name: 'Poetry & Spoken Word Evening', price: 8, category: 'Events', type: 'membership', term: 'dated', schedule: { date: null, capacity: 60 }, description: 'An intimate evening of local poets and spoken word artists.', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
	{ name: 'Igisoro Tournament', price: 5, category: 'Cultural Games', type: 'membership', term: 'dated', schedule: { date: null, capacity: 32 }, description: 'Traditional strategy board game tournament, all skill levels.', imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=400&fit=crop' },
	{ name: 'Urukiramende Game Session', price: 4, category: 'Cultural Games', type: 'membership', term: 'dated', schedule: { date: null, capacity: 20 }, description: 'Learn and play this traditional Rwandan game with local elders.', imageUrl: 'https://images.unsplash.com/photo-1611891487122-207579d67d98?w=400&h=400&fit=crop' },
	{ name: 'Kids Cultural Games Day', price: 6, category: 'Cultural Games', type: 'membership', term: 'dated', schedule: { date: null, capacity: 50 }, description: 'A day of traditional games for children and families.', imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=400&fit=crop' },
	{ name: 'Traditional Dance Course (4 weeks)', price: 70, category: 'Trainings', type: 'membership', term: 'dated', schedule: { date: null, capacity: 15 }, description: 'Weekly sessions learning intore and other traditional dances.', imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop' },
	{ name: 'Drumming Fundamentals Course', price: 65, category: 'Trainings', type: 'membership', term: 'dated', schedule: { date: null, capacity: 10 }, description: 'Six-week course on traditional Rwandan drumming patterns.', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop' },
	{ name: 'Storytelling & Oral History Workshop', price: 30, category: 'Trainings', type: 'membership', term: 'dated', schedule: { date: null, capacity: 20 }, description: 'One-day workshop on Rwandan oral storytelling traditions.', imageUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=400&h=400&fit=crop' },
	{ name: 'Inanga (Traditional Zither)', price: 85, category: 'Instruments', type: 'physical', description: 'Handmade traditional Rwandan zither, ready to play.', imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&h=400&fit=crop' },
	{ name: 'Umuduri (Musical Bow)', price: 45, category: 'Instruments', type: 'physical', description: 'Traditional single-string musical bow, handcrafted.', imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop' },
	{ name: 'Ingoma Drum', price: 120, category: 'Instruments', type: 'physical', description: 'Traditional ceremonial drum, handmade with cowhide skin.', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop' },
]

const nyamiramboProducts = [
	{ name: 'Nyungwe Forest Cultural Tour', price: 60, category: 'Tourism', type: 'service', description: 'Guided day tour combining nature and local cultural stops.', imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=400&fit=crop' },
	{ name: 'Kigali Heritage Walk', price: 25, category: 'Tourism', type: 'service', description: 'Half-day guided walking tour of Kigali\'s cultural landmarks.', imageUrl: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=400&h=400&fit=crop' },
	{ name: 'Village Homestay Experience', price: 90, category: 'Tourism', type: 'service', description: 'Two-day immersive stay with a local family, meals included.', imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400&h=400&fit=crop' },
	{ name: 'Traditional Dance Troupe', price: 200, category: 'Talent Booking', type: 'service', description: 'Book a full intore dance troupe for your event.', imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop' },
	{ name: 'Live Traditional Music Band', price: 180, category: 'Talent Booking', type: 'service', description: 'Book musicians playing inanga, umuduri, and drums live.', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
	{ name: 'Event Emcee (MC)', price: 100, category: 'Talent Booking', type: 'service', description: 'Book a professional bilingual emcee for weddings and events.', imageUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400&h=400&fit=crop' },
]

const kimihururaCustomers = [
	{ name: 'Jean Baptiste Nsanzimana', company: '', email: 'jb.nsanzimana@example.com', phone: '+250780000101', address: 'Kimihurura, Kigali', source: 'walk-in', status: 'active', estimatedValue: 15, summary: 'Attended Cultural Night, interested in dance courses.', preferences: {}, tags: ['event-goer'], metadata: {}, attachments: [] },
]

const nyamiramboCustomers = [
	{ name: 'Aline Umutoni', company: '', email: 'aline.umutoni@example.com', phone: '+250780000102', address: 'Nyamirambo, Kigali', source: 'referral', status: 'lead', estimatedValue: 90, summary: 'Asked about the Village Homestay Experience.', preferences: {}, tags: ['tourism'], metadata: {}, attachments: [] },
]

const kimihururaConversations = [
	{ customerIndex: 0, messages: [{ id: '1', type: 'received', content: 'When is the next Cultural Night?', attachments: [], timestamp: new Date().toISOString() }, { id: '2', type: 'sent', content: 'This Saturday at 6 PM, tickets are $15.', attachments: [], timestamp: new Date().toISOString() }], context: '', summary: 'Asked about upcoming event.', lastMessage: 'This Saturday at 6 PM, tickets are $15.' },
]

const nyamiramboConversations = [
	{ customerIndex: 0, messages: [{ id: '1', type: 'received', content: 'Is the homestay available next month?', attachments: [], timestamp: new Date().toISOString() }], context: '', summary: 'Inquiring about homestay availability.', lastMessage: 'Is the homestay available next month?' },
]

const kimihururaScoped = {
	'erp-payments': [
		{ type: 'incoming', category: 'sale', amount: 15, currency: 'USD', paymentDate: new Date().toISOString(), fiscalPeriod: new Date().toISOString().slice(0, 7), method: 'mobileMoney', notes: 'Cultural Night ticket', createdAt: new Date().toISOString() },
		{ type: 'outgoing', category: 'rent', amount: 500, currency: 'USD', paymentDate: new Date().toISOString(), fiscalPeriod: new Date().toISOString().slice(0, 7), method: 'bank', notes: 'Studio rent', createdAt: new Date().toISOString() },
	],
	'erp-assets': [
		{ name: 'Ingoma Drum Set (Performance)', categoryIds: [], serialNumber: 'IG-3301', purchaseDate: '2022-06-01', expirationDate: '', purchaseCost: 600, currentValue: 450, locationId: '', assignedPersonId: '', condition: 'good', status: 'available', metadata: {}, attachments: [], events: [] },
	],
}

const nyamiramboScoped = {
	'erp-payments': [
		{ type: 'incoming', category: 'sale', amount: 90, currency: 'USD', paymentDate: new Date().toISOString(), fiscalPeriod: new Date().toISOString().slice(0, 7), method: 'cash', notes: 'Homestay booking deposit', createdAt: new Date().toISOString() },
	],
	'erp-assets': [
		{ name: 'Tour Van', categoryIds: [], serialNumber: 'VAN-002', purchaseDate: '2021-03-10', expirationDate: '', purchaseCost: 8000, currentValue: 5200, locationId: '', assignedPersonId: '', condition: 'fair', status: 'available', metadata: {}, attachments: [], events: [] },
	],
}

await seedGroup({ groupId: GROUP_ID, group })

await seedCompany({
	slug: KIMIHURURA_SLUG,
	company: kimihururaCompany,
	groupId: GROUP_ID,
	typeId: 'generic',
	products: kimihururaProducts,
	customers: kimihururaCustomers,
	conversations: kimihururaConversations,
	companyScoped: kimihururaScoped,
})

await seedCompany({
	slug: NYAMIRAMBO_SLUG,
	company: nyamiramboCompany,
	groupId: GROUP_ID,
	typeId: 'generic',
	products: nyamiramboProducts,
	customers: nyamiramboCustomers,
	conversations: nyamiramboConversations,
	companyScoped: nyamiramboScoped,
	user: {
		email: 'owner@artists-hub.com',
		password: 'password123',
		roleId: 'admin',
		companyIds: [KIMIHURURA_SLUG, NYAMIRAMBO_SLUG],
		groupId: GROUP_ID,
	},
})
