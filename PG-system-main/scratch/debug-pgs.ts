import { initialPGs, type PG } from '../lib/data-store'

console.log('--- Current initialPGs data ---')
initialPGs.forEach((pg: PG) => {
  console.log(`PG: ${pg.pg_name}, Room Type: ${pg.room_type}, AC: ${pg.ac_type}`)
})
