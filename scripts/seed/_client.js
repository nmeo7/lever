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

const CURRENT_SCHEMA_VERSION = 1

const stampNewDoc = data => {
	const now = new Date().toISOString()
	return { ...data, createdAt: now, updatedAt: now, version: CURRENT_SCHEMA_VERSION }
}

const replaceCompanyScoped = async ({ collectionName, companyId, groupId = null, docs }) => {
	const existing = await db.collection(collectionName).where('companyId', '==', companyId).get()
	await Promise.all(existing.docs.map(doc => doc.ref.delete()))
	await Promise.all(docs.map(doc => db.collection(collectionName).add(stampNewDoc({ ...doc, companyId, groupId }))))
}

export const seedBusinessType = async ({ typeId, type }) => {
	await db.collection('erp-organizationModel').doc(typeId).set(stampNewDoc(type))
}

export const seedModuleDefinitions = async modules => {
	await Promise.all(modules.map(module => db.collection('erp-moduleDefinitions').doc(module.id).set(stampNewDoc(module))))
}

export const seedRoleDefinitions = async roles => {
	await Promise.all(roles.map(role => db.collection('erp-roleDefinitions').doc(role.id).set(stampNewDoc(role))))
}

export const seedGroup = async ({ groupId, group }) => {
	await db.collection('erp-groups').doc(groupId).set(stampNewDoc(group))
	return groupId
}

const seedPeopleUsers = async ({ users }) => {
	await Promise.all(
		users.map(async ({ name, email, password, roleId, companyIds, groupId, isPlatformAdmin }) => {
			const existing = await db.collection('erp-people').where('email', '==', email).limit(1).get()
			await Promise.all(existing.docs.map(doc => doc.ref.delete()))

			await db.collection('erp-people').add(stampNewDoc({
				name: name ?? email,
				email,
				passwordHash: hashPassword(password),
				isActive: true,
				roleId,
				companyIds,
				groupId: groupId ?? null,
				isPlatformAdmin: isPlatformAdmin ?? false,
			}))

			console.log(`  user: ${email} / ${password} (role: ${roleId})`)
		}),
	)
}

export const seedCompany = async ({
	slug,
	company,
	groupId = null,
	typeId,
	roleOverrides,
	moduleOverrides,
	products = [],
	customers = [],
	conversations = [],
	companyScoped = {},
	user,
	users,
}) => {
	const companyRef = db.collection('erp-companies').doc(slug)
	await companyRef.set(stampNewDoc({
		...company,
		slug,
		groupId,
		typeId,
		roleOverrides: roleOverrides ?? {},
		moduleOverrides: moduleOverrides ?? {},
	}))

	await replaceCompanyScoped({ collectionName: 'erp-products', companyId: slug, groupId, docs: products.map(p => ({ ...p, published: true })) })

	const existingCustomers = await db.collection('erp-customers').where('companyId', '==', slug).get()
	await Promise.all(existingCustomers.docs.map(doc => doc.ref.delete()))
	const customerRefs = await Promise.all(
		customers.map(customer => db.collection('erp-customers').add(stampNewDoc({ ...customer, companyId: slug, groupId }))),
	)

	const existingConversations = await db.collection('erp-conversations').where('companyId', '==', slug).get()
	await Promise.all(existingConversations.docs.map(doc => doc.ref.delete()))
	await Promise.all(
		conversations.map(({ customerIndex, ...conversation }, i) =>
			db.collection('erp-conversations').add(stampNewDoc({
				...conversation,
				companyId: slug,
				groupId,
				customerId: customerRefs[customerIndex ?? i]?.id ?? '',
			})),
		),
	)

	for (const [collectionName, records] of Object.entries(companyScoped)) {
		await replaceCompanyScoped({ collectionName, companyId: slug, groupId, docs: records })
	}

	const resolvedUsers = users ?? (user ? [user] : [])
	if (resolvedUsers.length) {
		await seedPeopleUsers({
			users: resolvedUsers.map(u => ({
				companyIds: u.companyIds ?? [slug],
				...u,
			})),
		})
	}

	console.log(`Seeded company "${slug}": ${products.length} products, ${customers.length} customers`)
}
