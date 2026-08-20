const admin = require('firebase-admin')
const { FieldValue } = require('firebase-admin/firestore')
const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { getOrgConfig } = require('./get-org-config')
const { generateEmbedding } = require('../ai')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()
const storage = admin.storage()

const toVectorValue = (embedding) => FieldValue.vector(embedding)

const findSimilar = async ({ collectionRef, queryVector, limit = 10 }) => {
  const vectorQuery = collectionRef.findNearest({
    vectorField: 'embedding',
    queryVector,
    limit,
    distanceMeasure: 'COSINE',
  })

  const snap = await vectorQuery.get()
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const stripInternalFields = ({ embedding, embeddingSourceHash, ...rest }) => rest

const resolveGroupId = async (companyId) => {
  const snap = await db.collection('erp-companies').doc(companyId).get()
  return snap.exists ? (snap.data().groupId ?? null) : null
}

const CURRENT_SCHEMA_VERSION = 1

const stampNewDoc = (data) => {
  const now = new Date().toISOString()
  return { ...data, createdAt: now, updatedAt: now, version: CURRENT_SCHEMA_VERSION }
}

const stampUpdatedDoc = (data) => ({ ...data, updatedAt: new Date().toISOString() })

const listDocs = async (collectionName, orderByField, companyId) => {
  const snap = await db
    .collection(collectionName)
    .where('companyId', '==', companyId)
    .orderBy(orderByField, 'desc')
    .get()
  return snap.docs.map((doc) => ({ id: doc.id, ...stripInternalFields(doc.data()) }))
}

const createDoc = async (collectionName, data, id) => {
  const docRef = id ? db.collection(collectionName).doc(id) : db.collection(collectionName).doc()
  await docRef.set(stampNewDoc(data))
  return { id: docRef.id }
}

const updateDoc = async (collectionName, id, data) => {
  await db.collection(collectionName).doc(id).update(stampUpdatedDoc(data))
  return { id }
}

const createDocInTx = (tx, docRef, data) => {
  tx.set(docRef, stampNewDoc(data))
}

const updateDocInTx = (tx, docRef, data) => {
  tx.update(docRef, stampUpdatedDoc(data))
}

const deleteDoc = async (collectionName, id) => {
  await db.collection(collectionName).doc(id).delete()
  return { id }
}

const getDoc = async (collectionName, id) => {
  const snap = await db.collection(collectionName).doc(id).get()
  return snap.exists ? { id: snap.id, ...stripInternalFields(snap.data()) } : null
}

const searchDocs = async (collectionName, { query, limit = 10, companyId }) => {
  if (!query?.trim()) return []

  const config = await getOrgConfig()
  const queryVector = await generateEmbedding({ apiKey: config.openai_api_key, text: query })
  if (!queryVector) return []

  const collectionRef = db.collection(collectionName).where('companyId', '==', companyId)
  const results = await findSimilar({ collectionRef, queryVector, limit })
  return results.map(stripInternalFields)
}

const embedForSearch = async (collectionName, docId, text) => {
  const config = await getOrgConfig()
  const embedding = await generateEmbedding({ apiKey: config.openai_api_key, text })
  if (!embedding) return
  await db.collection(collectionName).doc(docId).update({ embedding: toVectorValue(embedding), embeddingSourceHash: text })
}

const onWriteEmbeddingTrigger = ({ collectionName, idParam, buildEmbeddingText }) =>
  onDocumentWritten({ document: `${collectionName}/{${idParam}}`, secrets: ['JWT_SECRET'] }, async (event) => {
    const after = event.data?.after
    if (!after?.exists) return

    const doc = after.data()
    const text = buildEmbeddingText(doc)
    if (doc.embeddingSourceHash === text) return

    const config = await getOrgConfig()
    const embedding = await generateEmbedding({ apiKey: config.openai_api_key, text })
    if (!embedding) return

    await after.ref.update({ embedding: toVectorValue(embedding), embeddingSourceHash: text })
  })

module.exports = {
  admin,
  db,
  storage,
  toVectorValue,
  findSimilar,
  resolveGroupId,
  listDocs,
  createDoc,
  updateDoc,
  createDocInTx,
  updateDocInTx,
  deleteDoc,
  getDoc,
  searchDocs,
  embedForSearch,
  onWriteEmbeddingTrigger,
}
