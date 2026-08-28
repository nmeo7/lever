import { seedBusinessType, seedModuleDefinitions, seedRoleDefinitions } from './_client.js'
import { seedSchema } from './schema.js'
import { csv } from './csv.js'

await seedModuleDefinitions(csv.modules)
await seedRoleDefinitions(csv.roles)
await Promise.all(csv.businessTypes.map(({ typeId, ...type }) => seedBusinessType({ typeId, type })))
await seedSchema()

console.log(`Seeded shared: ${csv.businessTypes.length} business types, ${csv.modules.length} module definitions, ${csv.roles.length} role definitions`)
