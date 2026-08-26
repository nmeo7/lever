const { randomUUID } = require('crypto')
const { getStorage } = require('firebase-admin/storage')

const SIGNED_URL_TTL_MS = 5 * 60 * 1000

const parseDataUrl = (dataUrl) => {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
  if (!match) throw new Error('Invalid image data URL')
  const [, contentType, base64] = match
  return { contentType, buffer: Buffer.from(base64, 'base64') }
}

const uploadChatImage = async ({ businessId, dataUrl }) => {
  const { contentType, buffer } = parseDataUrl(dataUrl)
  const extension = contentType.split('/')[1] ?? 'bin'
  const path = `chat-uploads/${businessId}/${randomUUID()}.${extension}`

  const file = getStorage().bucket().file(path)
  await file.save(buffer, { contentType })

  return path
}

const getSignedImageUrl = async (path) => {
  const file = getStorage().bucket().file(path)
  const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + SIGNED_URL_TTL_MS })
  return url
}

module.exports = { uploadChatImage, getSignedImageUrl }
