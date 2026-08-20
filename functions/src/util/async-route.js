const { HttpsError } = require('firebase-functions/v2/https')

const STATUS_BY_CODE = {
  unauthenticated: 401,
  'permission-denied': 403,
  'invalid-argument': 400,
  'not-found': 404,
  'failed-precondition': 409,
}

const asyncRoute = (handler) => async (req, res) => {
  try {
    await handler(req, res)
  } catch (err) {
    if (err instanceof HttpsError) {
      return res.status(STATUS_BY_CODE[err.code] ?? 400).json({ error: err.message })
    }
    console.error('Request failed', { path: req.path, error: err.message })
    res.status(500).json({ error: err.message })
  }
}

module.exports = { asyncRoute }
