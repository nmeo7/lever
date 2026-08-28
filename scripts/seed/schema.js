import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createAnyDoc } from './_client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaJsonPath = resolve(__dirname, '../../schema.json')
const schemaJson = JSON.parse(readFileSync(schemaJsonPath, 'utf-8'))

const isEnumString = (value) => typeof value === 'string' && value.includes(' | ')
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const collectNestedAndOptions = (collectionName, node, path, nested, options) => {
	if (Array.isArray(node)) {
		if (node.length && isPlainObject(node[0])) {
			nested[path.join('.')] = Object.keys(node[0])
			for (const [key, value] of Object.entries(node[0])) {
				if (isEnumString(value)) options[`${path.join('.')}.${key}`] = value.split('|').map((v) => v.trim())
				else if (Array.isArray(value) || isPlainObject(value)) collectNestedAndOptions(collectionName, value, [...path, key], nested, options)
			}
		}
		return
	}

	if (!isPlainObject(node)) return

	for (const [key, value] of Object.entries(node)) {
		if (isEnumString(value)) {
			options[`${path.join('.')}.${key}`] = value.split('|').map((v) => v.trim())
		} else if (Array.isArray(value) || isPlainObject(value)) {
			collectNestedAndOptions(collectionName, value, [...path, key], nested, options)
		}
	}
}

const flattenSchema = (schema) => {
	const fields = {}
	const nested = {}
	const options = {}

	for (const superkey of Object.values(schema)) {
		for (const [collectionName, definition] of Object.entries(superkey)) {
			fields[collectionName] = isPlainObject(definition) ? Object.keys(definition) : []
			collectNestedAndOptions(collectionName, definition, [collectionName], nested, options)
		}
	}

	return { fields, nested, options }
}

export const seedSchema = async () => {
	const { fields, nested, options } = flattenSchema(schemaJson)

	const fieldsByCollection = Object.fromEntries(
		Object.entries(fields).map(([name, keys]) => [`erp-${name}`, keys]),
	)

	await createAnyDoc({ collection: 'erp-settings', id: 'schema', data: { ...fieldsByCollection, ...nested } })
	await createAnyDoc({ collection: 'erp-settings', id: 'schemaOptions', data: options })

	console.log(`Seeded schema: ${Object.keys(fieldsByCollection).length} collections, ${Object.keys(nested).length} nested fields, ${Object.keys(options).length} option sets`)
}
