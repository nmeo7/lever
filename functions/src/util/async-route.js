const { HttpsError } = require('firebase-functions/v2/https')
const { requireAuthFromRequest, requireCompanyAccess } = require('./auth')

const STATUS_BY_CODE = {
  unauthenticated: 401,
  'permission-denied': 403,
  'invalid-argument': 400,
  'not-found': 404,
  'failed-precondition': 409,
}

const respondToError = (res, path, err) => {
  if (err instanceof HttpsError) {
    return res.status(STATUS_BY_CODE[err.code] ?? 400).json({ error: err.message })
  }
  console.error('Request failed', { path, error: err.message })
  res.status(500).json({ error: err.message })
}

const asyncRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (err) {
    respondToError(res, req.path, err)
  }
}

const requireAuth = async (req, res, next) => {
  try {
    req.user = await requireAuthFromRequest(req)
    next()
  } catch (err) {
    respondToError(res, req.path, err)
  }
}

const requireCompanyAccessFrom = (source) => (req, res, next) => {
  try {
    const rawCompanyId = source === 'query' ? req.query.companyId : req.body?.companyId
    req.companyId = requireCompanyAccess(req.user, rawCompanyId)
    if (source === 'body') delete req.body.companyId
    next()
  } catch (err) {
    respondToError(res, req.path, err)
  }
}

module.exports = { asyncRoute, requireAuth, requireCompanyAccessFrom }
