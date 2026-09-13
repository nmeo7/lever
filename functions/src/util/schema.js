const RESERVED_FIELD_NAMES = ['id', 'companyId', 'groupId', 'createdAt', 'updatedAt']

const normalizeField = (field) => (typeof field === 'string' ? { name: field } : field)

const editableFields = (schema) =>
  schema.map(normalizeField).filter((field) => !RESERVED_FIELD_NAMES.includes(field.name))

module.exports = { RESERVED_FIELD_NAMES, normalizeField, editableFields }
