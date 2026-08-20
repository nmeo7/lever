import { seedCompany } from './_client.js'

const SLUG = 'gym'

const company = {
	name: 'Ironclad Fitness',
	contact: { whatsapp: '15550001001' },
	brandIdentity: { template: 'winter' },
	storefront: {
		headline: 'Train hard. Recover smart.',
		subheadline: 'Memberships, classes, and gear for every stage of your fitness journey.',
		heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=500&fit=crop',
		categories: [
			{ label: 'Memberships', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
			{ label: 'Classes', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=200&fit=crop' },
			{ label: 'Supplements', image: 'https://images.unsplash.com/photo-1579722820258-8f723e6d9a3b?w=200&h=200&fit=crop' },
			{ label: 'Apparel', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=200&h=200&fit=crop' },
			{ label: 'Personal Training', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
		],
		info: [
			{ icon: '📍', text: 'Kacyiru' },
			{ icon: '🕒', text: 'Open 5 AM – 11 PM' },
			{ icon: '🏋️', text: 'Free trial day for new members' },
			{ icon: '⚡', text: 'Human takeover within 5 minutes' },
		],
	},
}

const products = [
	{ name: 'Monthly Membership', price: 45, category: 'Memberships', type: 'membership', term: 'ongoing', billingPeriod: 'monthly', description: 'Unlimited gym floor access for one month.', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop' },
	{ name: 'Annual Membership', price: 420, category: 'Memberships', type: 'membership', term: 'ongoing', billingPeriod: 'yearly', description: 'Full year access, two months free.', imageUrl: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop' },
	{ name: 'Day Pass', price: 8, category: 'Memberships', type: 'membership', term: 'dated', schedule: { date: null, capacity: null }, description: 'Single-day access for visitors.', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop' },
	{ name: 'HIIT Class Pack (10)', price: 60, category: 'Classes', type: 'service', description: 'Ten high-intensity interval training sessions.', imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop' },
	{ name: 'Yoga Class Pack (10)', price: 55, category: 'Classes', type: 'service', description: 'Ten guided yoga and mobility sessions.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' },
	{ name: 'Spin Class Drop-In', price: 10, category: 'Classes', type: 'membership', term: 'dated', schedule: { date: null, capacity: 20 }, description: 'Single indoor cycling session.', imageUrl: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=400&h=400&fit=crop' },
	{ name: 'Whey Protein 2kg', price: 32, category: 'Supplements', type: 'physical', description: 'Chocolate flavor, 24g protein per serving.', imageUrl: 'https://images.unsplash.com/photo-1579722820258-8f723e6d9a3b?w=400&h=400&fit=crop' },
	{ name: 'Pre-Workout 300g', price: 24, category: 'Supplements', type: 'physical', description: 'Energy and focus blend, fruit punch.', imageUrl: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&h=400&fit=crop' },
	{ name: 'BCAA Capsules', price: 18, category: 'Supplements', type: 'physical', description: '90-capsule bottle for muscle recovery.', imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop' },
	{ name: 'Performance Tee', price: 15, category: 'Apparel', type: 'physical', description: 'Moisture-wicking training t-shirt.', imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=400&fit=crop' },
	{ name: 'Compression Leggings', price: 28, category: 'Apparel', type: 'physical', description: 'High-waist leggings with side pockets.', imageUrl: 'https://images.unsplash.com/photo-1506629905607-c28b47e8b6b3?w=400&h=400&fit=crop' },
	{ name: 'Gym Duffel Bag', price: 22, category: 'Apparel', type: 'physical', description: 'Water-resistant bag with shoe compartment.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
	{ name: '1-on-1 Session', price: 25, category: 'Personal Training', type: 'service', description: 'One hour with a certified trainer.', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop' },
	{ name: '5-Session Package', price: 110, category: 'Personal Training', type: 'service', description: 'Five personal training sessions, save 12%.', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop' },
]

const customers = [
	{ name: 'Alice Uwase', company: '', email: 'alice.uwase@example.com', phone: '+250780000001', address: 'Kacyiru, Kigali', source: 'walk-in', status: 'active', estimatedValue: 420, summary: 'Annual member, attends HIIT classes weekly.', preferences: {}, tags: ['member'], metadata: {}, attachments: [] },
	{ name: 'Eric Mugisha', company: '', email: 'eric.mugisha@example.com', phone: '+250780000002', address: 'Remera, Kigali', source: 'referral', status: 'active', estimatedValue: 45, summary: 'Monthly member, interested in personal training.', preferences: {}, tags: ['member', 'lead-pt'], metadata: {}, attachments: [] },
]

const conversations = [
	{ customerIndex: 0, messages: [{ id: '1', type: 'received', content: 'Do you have a free trial day?', attachments: [], timestamp: new Date().toISOString() }, { id: '2', type: 'sent', content: 'Yes! Come by anytime, first day is on us.', attachments: [], timestamp: new Date().toISOString() }], context: '', summary: 'Asked about free trial.', lastMessage: 'Yes! Come by anytime, first day is on us.' },
]

const companyScoped = {
	'erp-payments': [
		{ type: 'incoming', category: 'sale', amount: 45, currency: 'USD', paymentDate: new Date().toISOString(), fiscalPeriod: new Date().toISOString().slice(0, 7), method: 'card', notes: 'Monthly membership', createdAt: new Date().toISOString() },
		{ type: 'outgoing', category: 'rent', amount: 800, currency: 'USD', paymentDate: new Date().toISOString(), fiscalPeriod: new Date().toISOString().slice(0, 7), method: 'bank', notes: 'Facility rent', createdAt: new Date().toISOString() },
	],
	'erp-assets': [
		{ name: 'Treadmill (x4)', categoryIds: [], serialNumber: 'TM-2201', purchaseDate: '2023-01-15', expirationDate: '', purchaseCost: 4800, currentValue: 3600, locationId: '', assignedPersonId: '', condition: 'good', status: 'available', metadata: {}, attachments: [], events: [] },
	],
}

await seedCompany({
	slug: SLUG,
	company,
	typeId: 'gym',
	products,
	customers,
	conversations,
	companyScoped,
	user: { email: 'owner@gym.com', password: 'password123', roleId: 'admin' },
})
