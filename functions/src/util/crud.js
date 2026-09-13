const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, updateDoc, deleteDoc, getDoc, searchDocs, resolveGroupId, batchUpsert } = require('./data')
const { getSchema } = require('../org-settings/org-settings-service')
const { editableFields, RESERVED_FIELD_NAMES } = require('./schema')

const stripReservedFields = (fields) =>
  Object.fromEntries(Object.entries(fields).filter(([name]) => !RESERVED_FIELD_NAMES.includes(name)))

const requireOwnedDoc = async (collection, companyId, id) => {
  const existing = await getDoc(collection, id)
  if (!existing || existing.companyId !== companyId) throw new HttpsError('not-found', 'Not found')
  return existing
}

const validateAgainstSchema = (fields, { partial }, schema) => {
  for (const field of editableFields(schema)) {
    const value = fields[field.name]
    if (value === undefined) {
      if (!partial && field.required) throw new HttpsError('invalid-argument', `${field.name} is required`)
      continue
    }
    if (field.required && !value) throw new HttpsError('invalid-argument', `${field.name} is required`)
    if (field.type === 'tags' && !Array.isArray(value)) {
      throw new HttpsError('invalid-argument', `${field.name} must be an array`)
    }
    if (field.type === 'select' && field.options?.length && !field.options.includes(value)) {
      throw new HttpsError('invalid-argument', `${field.name} must be one of ${field.options.join(', ')}`)
    }
  }
}

const buildDocFromSchema = (schema, { companyId, groupId, fields }) => {
  const defaultForType = (type) => (type === 'number' ? 0 : type === 'tags' ? [] : type === 'checkbox' ? false : '')
  const values = Object.fromEntries(
    editableFields(schema).map((field) => [field.name, fields[field.name] ?? field.initialValue ?? defaultForType(field.type)]),
  )
  return { ...values, companyId, groupId }
}

const createCrudService = ({ collection, orderByField = 'createdAt', validate, buildDoc, applyUpdate }) => {
  const list = (companyId) => listDocs(collection, orderByField, companyId)

  const resolveValidate = async (fields, mode, companyId) => {
    if (validate) return validate(fields, mode, companyId)
    const schema = await getSchema(companyId, collection)
    return validateAgainstSchema(fields, mode, schema)
  }

  const resolveBuildDoc = async (args) => {
    if (buildDoc) return buildDoc(args)
    const schema = await getSchema(args.companyId, collection)
    return buildDocFromSchema(schema, args)
  }

  const create = async (companyId, fields, user) => {
    await resolveValidate(fields, { partial: false }, companyId)
    const groupId = await resolveGroupId(companyId)
    return createDoc(collection, await resolveBuildDoc({ companyId, groupId, fields, user }))
  }

  const update = async (companyId, id, fields) => {
    await resolveValidate(fields, { partial: true }, companyId)
    await requireOwnedDoc(collection, companyId, id)
    return updateDoc(collection, id, applyUpdate ? applyUpdate(fields) : stripReservedFields(fields))
  }

  const remove = async (companyId, id) => {
    await requireOwnedDoc(collection, companyId, id)
    return deleteDoc(collection, id)
  }

  const search = (companyId, { query, limit }) => searchDocs(collection, { query, limit, companyId })

  const batchCreate = (companyId, rows) => batchUpsert(companyId, rows, create)

  return { list, create, update, remove, search, batchCreate }
}

module.exports = { createCrudService, requireOwnedDoc }
