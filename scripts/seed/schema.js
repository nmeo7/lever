import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { createAnyDoc } from './_client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaJsonPath = resolve(__dirname, '../../schema.json')
const schemaJson = JSON.parse(readFileSync(schemaJsonPath, 'utf-8'))

const isEnumString = (value) => typeof value === 'string' && value.includes(' | ')
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isFieldConfig = (value) => isPlainObject(value) && ('type' in value || 'label' in value || 'options' in value || 'required' in value || 'placeholder' in value || 'initialValue' in value)

const inferType = (value) => {
	if (typeof value === 'number') return 'number'
	if (typeof value === 'boolean') return 'checkbox'
	if (Array.isArray(value)) return 'tags'
	return 'text'
}

const toFieldConfig = (key, value) => {
	if (isFieldConfig(value)) return { name: key, type: 'text', ...value }
	if (isEnumString(value)) return { name: key, type: 'select', options: value.split('|').map((v) => v.trim()) }
	return { name: key, type: inferType(value) }
}

const buildFields = (definition) =>
	isPlainObject(definition)
		? Object.entries(definition)
				.filter(([, value]) => !isPlainObject(value) || isFieldConfig(value) || isEnumString(value))
				.map(([key, value]) => toFieldConfig(key, value))
		: []

const flattenSchema = (schema) => {
	const fields = {}

	for (const superkey of Object.values(schema)) {
		for (const [collectionName, definition] of Object.entries(superkey)) {
			fields[collectionName] = buildFields(definition)
		}
	}

	return { fields }
}

export const seedSchema = async () => {
	const { fields } = flattenSchema(schemaJson)

	const fieldsByCollection = Object.fromEntries(
		Object.entries(fields).map(([name, config]) => [`erp-${name}`, config]),
	)

	await createAnyDoc({ collection: 'erp-settings', id: 'schema', data: fieldsByCollection })

	console.log(`Seeded schema: ${Object.keys(fieldsByCollection).length} collections`)
}
