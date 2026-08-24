import { seedGroupFromCsv, seedCompanyFromCsv } from './_client.js'
import { csv } from './csv.js'

await seedGroupFromCsv({ groupId: 'artists-hub', csv })
await seedCompanyFromCsv({ slug: 'artists-hub-kimihurura', csv })
await seedCompanyFromCsv({ slug: 'artists-hub-nyamirambo', csv })
