const { createCrudRouter } = require('../util/crud-router')
const productsService = require('./products-service')

exports.products = createCrudRouter({ resourceName: 'products', service: productsService })
