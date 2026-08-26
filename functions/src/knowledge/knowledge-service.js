const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, updateDoc, deleteDoc, getDoc, searchDocs, resolveGroupId } = require('../util/data')
const { encryptFields, decryptFields } = require('../util/field-encryption')

const COLLECTION = 'erp-knowledge'
const KNOWLEDGE_TYPES = ['contract', 'template', 'rule', 'rights_and_responsibilities', 'playbook', 'note', 'checklists']
const ENCRYPTED_FIELDS = ['content']

const listKnowledge = async (companyId) => {
  const entries = await listDocs(COLLECTION, 'createdAt', companyId)
  return entries.map((entry) => decryptFields(entry, ENCRYPTED_FIELDS))
}

const createKnowledgeEntry = async (companyId, { title, type, classification, content }) => {
  if (!title) throw new HttpsError('invalid-argument', 'title is required')
  if (!KNOWLEDGE_TYPES.includes(type)) throw new HttpsError('invalid-argument', `type must be one of ${KNOWLEDGE_TYPES.join(', ')}`)

  const groupId = await resolveGroupId(companyId)

  return createDoc(COLLECTION, encryptFields({
    companyId,
    groupId,
    title,
    type,
    classification: classification ?? '',
    content: content ?? '',
  }, ENCRYPTED_FIELDS))
}

const updateKnowledgeEntry = async (companyId, id, { title, type, classification, content }) => {
  const existing = await getDoc(COLLECTION, id)
  if (!existing || existing.companyId !== companyId) throw new HttpsError('not-found', 'Knowledge entry not found')

  if (title !== undefined && !title) throw new HttpsError('invalid-argument', 'title is required')
  if (type !== undefined && !KNOWLEDGE_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', `type must be one of ${KNOWLEDGE_TYPES.join(', ')}`)
  }

  return updateDoc(COLLECTION, id, encryptFields({
    ...(title !== undefined ? { title } : {}),
    ...(type !== undefined ? { type } : {}),
    ...(classification !== undefined ? { classification } : {}),
    ...(content !== undefined ? { content } : {}),
  }, ENCRYPTED_FIELDS))
}

const deleteKnowledgeEntry = async (companyId, id) => {
  const existing = await getDoc(COLLECTION, id)
  if (!existing || existing.companyId !== companyId) throw new HttpsError('not-found', 'Knowledge entry not found')
  return deleteDoc(COLLECTION, id)
}

const searchKnowledge = async (companyId, { query, limit }) => {
  const entries = await searchDocs(COLLECTION, { query, limit, companyId })
  return entries.map((entry) => decryptFields(entry, ENCRYPTED_FIELDS))
}

module.exports = { listKnowledge, createKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, searchKnowledge, KNOWLEDGE_TYPES, ENCRYPTED_FIELDS }
