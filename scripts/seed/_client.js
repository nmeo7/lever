import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createHash } from 'crypto'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = resolve(__dirname, '../../service-account.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

const app = initializeApp({ credential: cert(serviceAccount) })
export const db = getFirestore(app)

const hashPassword = password => createHash('sha256').update(password).digest('hex')

const seedUser = async ({ slug, email, password, role }) => {
	const existing = await db.collection('erp-users').where('email', '==', email).limit(1).get()
	await Promise.all(existing.docs.map(doc => doc.ref.delete()))

	await db.collection('erp-users').add({
		email,
		passwordHash: hashPassword(password),
		isActive: true,
		role,
		personId: null,
		orgId: slug,
	})

	console.log(`  user: ${email} / ${password} (role: ${role})`)
}

export const seedOrg = async ({ slug, org, products, user }) => {
	const orgRef = db.collection('erp-organization').doc(slug)
	await orgRef.set(org)

	const existing = await db.collection('erp-products').where('orgId', '==', slug).get()
	await Promise.all(existing.docs.map(doc => doc.ref.delete()))

	await Promise.all(
		products.map(product =>
			db.collection('erp-products').add({ ...product, orgId: slug, published: true }),
		),
	)

	console.log(`Seeded "${slug}": 1 organization + ${products.length} products`)

	if (user) {
		await seedUser({ slug, ...user })
	}
}
