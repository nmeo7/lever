import { readCsv } from './csv-reader.js'

export const csv = {
	groups: readCsv('groups.csv'),
	companies: readCsv('companies.csv'),
	products: readCsv('products.csv'),
	customers: readCsv('customers.csv'),
	conversations: readCsv('conversations.csv'),
	payments: readCsv('payments.csv'),
	resources: readCsv('resources.csv'),
	people: readCsv('people.csv'),
	modules: readCsv('modules.csv'),
	roles: readCsv('roles.csv'),
	businessTypes: readCsv('business-types.csv'),
}
