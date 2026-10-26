import {defineConfig} from 'drizzle-kit';
export default defineConfig({
  dialect:'sqlite',
  schema:'./server/db/schema.mjs',
  out:'./drizzle',
  dbCredentials:{url:process.env.SYRINE_DB_PATH || './data/syrine.sqlite'},
});
