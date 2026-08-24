import { seedGroupFromCsv, seedCompanyFromCsv } from './_client.js'
import { csv } from './csv.js'

await seedGroupFromCsv({ groupId: 'africa-new-life', csv })
await seedCompanyFromCsv({ slug: 'africa-new-life-church', csv })
await seedCompanyFromCsv({ slug: 'africa-new-life-school', csv })
await seedCompanyFromCsv({ slug: 'africa-new-life-hospital', csv })
