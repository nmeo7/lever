import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createHash } from 'crypto'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = resolve(__dirname, '../../service-account-prod.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

const app = initializeApp({ credential: cert(serviceAccount) })
export const db = getFirestore(app)

const hashPassword = (password) => createHash('sha256').update(String(password)).digest('hex')

const CURRENT_SCHEMA_VERSION = 1

const stampNewDoc = (data) => {
	const now = new Date().toISOString()
	return { ...data, createdAt: now, updatedAt: now, version: CURRENT_SCHEMA_VERSION }
}

const createAnyDoc = async ({ collection, id, data }) => {
	const docRef = id ? db.collection(collection).doc(id) : db.collection(collection).doc()
	await docRef.set(stampNewDoc(data))
	return docRef.id
}

const replaceCompanyScoped = async ({ collectionName, companyId, groupId = null, docs }) => {
	const existing = await db.collection(collectionName).where('companyId', '==', companyId).get()
	await Promise.all(existing.docs.map((doc) => doc.ref.delete()))
	await Promise.all(docs.map((doc) => createAnyDoc({ collection: collectionName, data: { ...doc, companyId, groupId } })))
}

export const seedBusinessType = async ({ typeId, type }) => {
	await createAnyDoc({ collection: 'erp-organizationModel', id: typeId, data: type })
}

export const seedModuleDefinitions = async (modules) => {
	await Promise.all(modules.map((module) => createAnyDoc({ collection: 'erp-moduleDefinitions', id: module.id, data: module })))
}

export const seedRoleDefinitions = async (roles) => {
	await Promise.all(roles.map((role) => createAnyDoc({ collection: 'erp-roleDefinitions', id: role.id, data: role })))
}

export const seedGroup = async ({ groupId, group }) => {
	await createAnyDoc({ collection: 'erp-groups', id: groupId, data: group })
	return groupId
}

const seedPeopleUsers = async ({ users }) => {
	await Promise.all(
		users.map(async ({ name, email, password, roleId, companyIds, groupId, isPlatformAdmin }) => {
			const existing = await db.collection('erp-people').where('email', '==', email).limit(1).get()
			await Promise.all(existing.docs.map((doc) => doc.ref.delete()))

			await createAnyDoc({
				collection: 'erp-people',
				data: {
					name: name ?? email,
					email,
					passwordHash: hashPassword(password),
					isActive: true,
					roleId,
					companyIds,
					groupId: groupId ?? null,
					isPlatformAdmin: isPlatformAdmin ?? false,
				},
			})

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
	await createAnyDoc({
		collection: 'erp-companies',
		id: slug,
		data: { ...company, slug, groupId, typeId, roleOverrides: roleOverrides ?? {}, moduleOverrides: moduleOverrides ?? {} },
	})

	await replaceCompanyScoped({ collectionName: 'erp-products', companyId: slug, groupId, docs: products.map((p) => ({ ...p, published: true })) })

	const existingCustomers = await db.collection('erp-customers').where('companyId', '==', slug).get()
	await Promise.all(existingCustomers.docs.map((doc) => doc.ref.delete()))
	const customerIds = await Promise.all(
		customers.map((customer) => createAnyDoc({ collection: 'erp-customers', data: { ...customer, companyId: slug, groupId } })),
	)

	const customerIdByEmail = Object.fromEntries(customers.map((customer, i) => [customer.email, customerIds[i]]))

	const existingConversations = await db.collection('erp-conversations').where('companyId', '==', slug).get()
	await Promise.all(existingConversations.docs.map((doc) => doc.ref.delete()))
	await Promise.all(
		conversations.map(({ customerEmail, ...conversation }) =>
			createAnyDoc({
				collection: 'erp-conversations',
				data: { ...conversation, companyId: slug, groupId, customerId: customerIdByEmail[customerEmail] ?? '' },
			}),
		),
	)

	for (const [collectionName, records] of Object.entries(companyScoped)) {
		await replaceCompanyScoped({ collectionName, companyId: slug, groupId, docs: records })
	}

	const resolvedUsers = users ?? (user ? [user] : [])
	if (resolvedUsers.length) {
		await seedPeopleUsers({ users: resolvedUsers.map((u) => ({ companyIds: u.companyIds ?? [slug], ...u })) })
	}

	console.log(`Seeded company "${slug}": ${products.length} products, ${customers.length} customers`)
}

export const seedCompanyFromCsv = async ({ slug, csv }) => {
	const { companies, products, customers, conversations, payments, resources, taxonomy, people } = csv
	const company = companies.find((row) => row.slug === slug)
	if (!company) throw new Error(`No company row found for slug "${slug}"`)

	const { slug: _slug, groupId, typeId, name, contact, brandIdentity, frontdesk, roleOverrides, moduleOverrides } = company
	const companyProducts = products.filter((row) => row.companyId === slug).map(({ companyId, ...rest }) => rest)
	const companyCustomers = customers.filter((row) => row.companyId === slug).map(({ companyId, groupId: _g, ...rest }) => rest)
	const companyConversations = conversations.filter((row) => row.companyId === slug).map(({ companyId, groupId: _g, ...rest }) => rest)
	const companyPayments = payments.filter((row) => row.companyId === slug).map(({ companyId, groupId: _g, ...rest }) => rest)
	const companyResources = resources.filter((row) => row.companyId === slug).map(({ companyId, groupId: _g, ...rest }) => rest)
	const companyTaxonomy = taxonomy.filter((row) => row.companyId === slug).map(({ companyId, groupId: _g, ...rest }) => rest)
	const companyPeople = people.filter((row) => row.companyIds.includes(slug)).map(({ companyIds, groupId: _g, ...rest }) => ({ ...rest, companyIds }))

	await seedCompany({
		slug,
		company: { name, contact, brandIdentity, frontdesk, roleOverrides, moduleOverrides },
		groupId,
		typeId,
		products: companyProducts,
		customers: companyCustomers,
		conversations: companyConversations,
		companyScoped: {
			...(companyPayments.length ? { 'erp-payments': companyPayments } : {}),
			...(companyResources.length ? { 'erp-resources': companyResources } : {}),
			...(companyTaxonomy.length ? { 'erp-taxonomy': companyTaxonomy } : {}),
		},
		users: companyPeople,
	})
}

export const seedGroupFromCsv = async ({ groupId, csv }) => {
	const group = csv.groups.find((row) => row.groupId === groupId)
	if (!group) throw new Error(`No group row found for groupId "${groupId}"`)
	const { groupId: _id, ...rest } = group
	await seedGroup({ groupId, group: rest })
}
