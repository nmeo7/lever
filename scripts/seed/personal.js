import { seedCompanyFromCsv } from './_client.js'
import { csv } from './csv.js'

await seedCompanyFromCsv({ slug: 'personal', csv })
