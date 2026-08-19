const { HttpsError } = require('firebase-functions/v2/https')
const { listDocs, createDoc, updateDoc, deleteDoc, getDoc, searchDocs } = require('../util/data')

const COLLECTION = 'erp-documents'
const DOCUMENT_TYPES = ['contract', 'template', 'rule', 'rights_and_responsibilities', 'playbook', 'note', 'checklists']

const listDocuments = () => listDocs(COLLECTION, 'createdAt')

const createDocument = async ({ title, type, classification, content }) => {
  if (!title) throw new HttpsError('invalid-argument', 'title is required')
  if (!DOCUMENT_TYPES.includes(type)) throw new HttpsError('invalid-argument', `type must be one of ${DOCUMENT_TYPES.join(', ')}`)

  const now = new Date().toISOString()

  return createDoc(COLLECTION, {
    title,
    type,
    classification: classification ?? '',
    content: content ?? '',
    createdAt: now,
    updatedAt: now,
  })
}

const updateDocument = async (id, { title, type, classification, content }) => {
  const existing = await getDoc(COLLECTION, id)
  if (!existing) throw new HttpsError('not-found', 'Document not found')

  if (title !== undefined && !title) throw new HttpsError('invalid-argument', 'title is required')
  if (type !== undefined && !DOCUMENT_TYPES.includes(type)) {
    throw new HttpsError('invalid-argument', `type must be one of ${DOCUMENT_TYPES.join(', ')}`)
  }

  return updateDoc(COLLECTION, id, {
    ...(title !== undefined ? { title } : {}),
    ...(type !== undefined ? { type } : {}),
    ...(classification !== undefined ? { classification } : {}),
    ...(content !== undefined ? { content } : {}),
    updatedAt: new Date().toISOString(),
  })
}

const deleteDocument = (id) => deleteDoc(COLLECTION, id)

const searchDocuments = ({ query, limit }) => searchDocs(COLLECTION, { query, limit })

module.exports = { listDocuments, createDocument, updateDocument, deleteDocument, searchDocuments, DOCUMENT_TYPES }
