import { seedGroupFromCsv, seedCompanyFromCsv } from './_client.js'
import { csv } from './csv.js'

await seedGroupFromCsv({ groupId: 'inganzo-bridge', csv })
await seedCompanyFromCsv({ slug: 'mc-emmy-mushabizi', csv })
await seedCompanyFromCsv({ slug: 'sophie-nzayisenga', csv })
await seedCompanyFromCsv({ slug: 'inyamibwa-troupe', csv })
