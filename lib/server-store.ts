import 'server-only'
import {openStore} from '@/server/db/storage.mjs'
import {defaultDB} from '@/server/seed.mjs'

let store: ReturnType<typeof openStore> | undefined
export function getReadonlyData() {
  // The Next.js server and its route handlers always read the same SQLite file.
  store ??= openStore()
  if(!store.initialized) store.write(defaultDB())
  const data=store.read()
  // Keep the public seed fleet visible on first run; the API persists these at initialization.
  return data
}
