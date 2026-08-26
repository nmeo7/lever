const { randomUUID } = require('crypto')
const { getStorage } = require('firebase-admin/storage')
const { HttpsError } = require('firebase-functions/v2/https')
const { createDoc, getDoc } = require('./data')

const ATTACHMENTS_COLLECTION = 'erp-attachments'

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
  if (!match) throw new Error('Invalid image data URL')
  const [, contentType, base64] = match
  return { contentType, buffer: Buffer.from(base64, 'base64') }
}

const uploadAttachment = async ({ companyId, dataUrl }) => {
  const { contentType, buffer } = parseDataUrl(dataUrl)
  const extension = contentType.split('/')[1] ?? 'bin'
  const storagePath = `chat-uploads/${companyId}/${randomUUID()}.${extension}`

  await getStorage().bucket().file(storagePath).save(buffer, { contentType })

  const { id } = await createDoc(ATTACHMENTS_COLLECTION, { companyId, storagePath, contentType })
  return id
}

const requireOwnedAttachment = async (attachmentId, companyId) => {
  const attachment = await getDoc(ATTACHMENTS_COLLECTION, attachmentId)
  if (!attachment) throw new HttpsError('not-found', `Attachment "${attachmentId}" not found`)
  if (attachment.companyId !== companyId) throw new HttpsError('permission-denied', 'No access to this attachment')
  return attachment
}

const downloadAttachmentAsDataUrl = async (attachmentId, companyId) => {
  const attachment = await requireOwnedAttachment(attachmentId, companyId)
  const [buffer] = await getStorage().bucket().file(attachment.storagePath).download()
  return `data:${attachment.contentType};base64,${buffer.toString('base64')}`
}

const downloadAttachmentFile = async (attachmentId, companyId) => {
  const attachment = await requireOwnedAttachment(attachmentId, companyId)
  const [buffer] = await getStorage().bucket().file(attachment.storagePath).download()
  return { buffer, contentType: attachment.contentType }
}

module.exports = { uploadAttachment, downloadAttachmentAsDataUrl, downloadAttachmentFile }
