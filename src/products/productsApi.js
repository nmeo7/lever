import { createCrudApi } from '@/util/crudApi'

export const productsCrud = createCrudApi('products', 'products')
export const PRODUCTS_COLLECTION = 'erp-products'
