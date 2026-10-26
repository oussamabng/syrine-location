import {loadLocalEnv} from './load-env.mjs'
import {openStore} from '../server/db/storage.mjs'
import {mkdirSync,chmodSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
loadLocalEnv()
const store=openStore()
const backups=resolve(process.env.SYRINE_BACKUP_DIR||resolve(process.env.SYRINE_DATA_DIR||resolve(process.cwd(),'data'),'backups'))
mkdirSync(backups,{recursive:true,mode:0o700})
const stamp=new Date().toISOString().replace(/[.:]/g,'-')
const target=resolve(backups,`syrine-${stamp}.sqlite`)
store.sqlite.prepare('VACUUM INTO ?').run(target)
chmodSync(target,0o600)
store.close()
console.log('SQLite consistent backup:',target)
console.log('Remember to back up uploaded files too, and copy backups to another machine.')
