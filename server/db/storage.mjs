import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, existsSync, readFileSync, copyFileSync, chmodSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { drizzle } from 'drizzle-orm/node-sqlite'
import * as schema from './schema.mjs'

const rowTables = ['cars','bookings','messages','users','blocks','activity']
const canonicalJson = value => JSON.stringify(value)
const tokenHash = token => createHash('sha256').update(token).digest('hex')
export const dbFile = () => {
  if(process.env.NODE_ENV==='production' && !process.env.SYRINE_DB_PATH && !process.env.SYRINE_DATA_DIR)
    throw new Error('Production requires SYRINE_DATA_DIR or SYRINE_DB_PATH on persistent storage')
  return resolve(process.env.SYRINE_DB_PATH || resolve(process.env.SYRINE_DATA_DIR || resolve(process.cwd(),'data'), 'syrine.sqlite'))
}

function sqlSchema(sqlite){
  sqlite.exec(`
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS cars(id TEXT PRIMARY KEY,document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,car_id TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,status TEXT NOT NULL,document TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS bookings_car_dates_idx ON bookings(car_id,start_date,end_date);
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,role TEXT NOT NULL,active INTEGER NOT NULL,document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS blocks(id TEXT PRIMARY KEY,car_id TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,document TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS blocks_car_dates_idx ON blocks(car_id,start_date,end_date);
CREATE TABLE IF NOT EXISTS activity(id TEXT PRIMARY KEY,document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS misc(name TEXT PRIMARY KEY,document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires);
PRAGMA user_version=1;
`)
}
export function openStore({file=dbFile(),legacyPath=resolve(process.cwd(),'data/db.json')}={}) {
  mkdirSync(dirname(file),{recursive:true,mode:0o700})
  const existed=existsSync(file)
  const sqlite = new DatabaseSync(file)
  sqlite.exec('PRAGMA busy_timeout=5000')
  sqlSchema(sqlite)
  try{chmodSync(file,0o600)}catch{}
  const drizzleDb = drizzle({client:sqlite,schema})
  const readRows = table => drizzleDb.select().from(table).all().map(row=>JSON.parse(row.document))
  const getMisc = name => {const row=sqlite.prepare('SELECT document FROM misc WHERE name=?').get(name);return row?JSON.parse(row.document):undefined}
  const read = () => ({version:2,cars:readRows(schema.cars),bookings:readRows(schema.bookings),messages:readRows(schema.messages),users:readRows(schema.users),blocks:readRows(schema.blocks),activity:readRows(schema.activity),site:getMisc('site'),cms:getMisc('cms')})
  const initialized = !!getMisc('initialized')
  function write(data){
    sqlite.exec('BEGIN IMMEDIATE')
    try{
      // Full-snapshot replacement retains the original API's object mutations.
      // This is supported for a SINGLE Node.js process only.
      for(const table of rowTables) sqlite.exec('DELETE FROM '+table)
      const single=Object.fromEntries(['cars','messages','activity'].map(table=>[table,sqlite.prepare(`INSERT INTO ${table}(id,document) VALUES (?,?)`)]))
      const book=sqlite.prepare('INSERT INTO bookings(id,car_id,start_date,end_date,status,document) VALUES (?,?,?,?,?,?)')
      const block=sqlite.prepare('INSERT INTO blocks(id,car_id,start_date,end_date,document) VALUES (?,?,?,?,?)')
      const user=sqlite.prepare('INSERT INTO users(id,username,role,active,document) VALUES (?,?,?,?,?)')
      for(const table of ['cars','messages','activity'])for(const item of data[table]||[])single[table].run(item.id,canonicalJson(item))
      for(const item of data.bookings||[])book.run(item.id,item.carId,item.startDate,item.endDate,item.status,canonicalJson(item))
      for(const item of data.blocks||[])block.run(item.id,item.carId,item.startDate,item.endDate,canonicalJson(item))
      for(const item of data.users||[])user.run(item.id,item.username,item.role,item.active===false?0:1,canonicalJson(item))
      const upsert=sqlite.prepare('INSERT INTO misc(name,document) VALUES(?,?) ON CONFLICT(name) DO UPDATE SET document=excluded.document')
      for(const key of ['site','cms'])if(data[key]!==undefined)upsert.run(key,canonicalJson(data[key]))
      upsert.run('initialized','true')
      sqlite.exec('COMMIT')
    }catch(error){sqlite.exec('ROLLBACK');throw error}
  }
  // Import once, without removing or modifying the user's original JSON file.
  if(!existed && existsSync(legacyPath)) {
    const source=JSON.parse(readFileSync(legacyPath,'utf8'))
    const backup=legacyPath+'.before-sqlite.bak'
    if(!existsSync(backup))copyFileSync(legacyPath,backup)
    write(source)
    sqlite.prepare('INSERT OR REPLACE INTO misc(name,document) VALUES (?,?)').run('legacy_import',canonicalJson({at:new Date().toISOString(),source:legacyPath,sha256:createHash('sha256').update(readFileSync(legacyPath)).digest('hex')}))
  }
  const session = {
    set: (token,userId,expires)=>sqlite.prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)').run(tokenHash(token),userId,expires),
    get: token=>sqlite.prepare('SELECT user_id as userId,expires FROM sessions WHERE token_hash=?').get(tokenHash(token)),
    delete: token=>sqlite.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(token)),
    revokeUser: userId=>sqlite.prepare('DELETE FROM sessions WHERE user_id=?').run(userId),
    cleanup: ()=>sqlite.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now()),
  }
  session.cleanup()
  return {sqlite,drizzleDb,read,write,session,initialized:initialized || (!existed && existsSync(legacyPath)),close:()=>sqlite.close(),file}
}
