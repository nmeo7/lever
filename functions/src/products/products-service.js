const { createCrudService } = require('../util/crud')

const COLLECTION = 'erp-products'

const productsService = createCrudService({ collection: COLLECTION })

module.exports = { ...productsService }
