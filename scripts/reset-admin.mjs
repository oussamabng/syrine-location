import {loadLocalEnv} from './load-env.mjs'
// Recovery utility: stop the server first; preserves other users and all business data.
import {randomBytes,scryptSync} from 'node:crypto'
import {openStore} from '../server/db/storage.mjs'
import {mkdirSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
loadLocalEnv()
const store=openStore()
const snapshot=store.read()
const user=snapshot.users?.find(u=>u.role==='admin'&&u.active!==false)
if(!user){console.error('No active admin account found; no changes made.');process.exitCode=1}
else {
  // SQLite online backup including WAL state. Never delete the backup.
  const file=store.file,backup=file+'.before-admin-reset-'+Date.now()+'.sqlite'
  store.sqlite.prepare('VACUUM INTO ?').run(backup)
  const secret=randomBytes(24).toString('base64url')
  const salt=randomBytes(16).toString('hex')
  user.hash=salt+':'+scryptSync(secret,salt,64).toString('hex')
  store.write(snapshot)
  store.session.revokeUser(user.id)
  const hint=resolve(process.env.SYRINE_DATA_DIR||resolve(process.cwd(),'data'),'.admin-password')
  mkdirSync(dirname(hint),{recursive:true,mode:0o700})
  writeFileSync(hint,secret+'\n',{mode:0o600})
  console.log('Admin:',user.username)
  console.log('One-time new password:',secret)
  console.log('SQLite backup:',backup)
  console.log('Restart the app; change the password after login and keep this output private.')
}
store.close()
