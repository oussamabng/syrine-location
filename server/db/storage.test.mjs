import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {openStore} from './storage.mjs'
import {defaultDB} from '../seed.mjs'

test('migrate v9 JSON to SQLite and persist all records and sessions',()=>{
 const dir=mkdtempSync(join(tmpdir(),'syrine-sqlite-'))
 try {
  const legacy=join(dir,'db.json'),file=join(dir,'db.sqlite')
  const original=defaultDB();original.users=[{id:'admin-1',username:'admin',role:'admin',hash:'preserved',active:true,createdAt:'now'}]
  original.bookings=[{id:'b-1',carId:original.cars[0].id,startDate:'2026-11-03',endDate:'2026-11-09',status:'confirmed',reference:'SYR-TEST'}]
  original.messages=[{id:'msg-1',fullName:'Test'}];original.site={contact:{phone:'+213555555555'}}
  original.blocks=[{id:'block-1',carId:original.cars[0].id,startDate:'2026-12-01',endDate:'2026-12-04'}]
  writeFileSync(legacy,JSON.stringify(original))
  const store=openStore({file,legacyPath:legacy})
  assert.equal(store.initialized,true)
  assert.deepEqual(store.read().bookings,original.bookings)
  assert.deepEqual(store.read().cars,original.cars)
  assert.equal(store.read().users[0].hash,'preserved')
  assert.ok(existsSync(legacy+'.before-sqlite.bak'))
  store.session.set('secret','admin-1',Date.now()+100000)
  store.close()
  const reopened=openStore({file,legacyPath:legacy})
  assert.equal(reopened.session.get('secret').userId,'admin-1')
  reopened.session.revokeUser('admin-1');assert.equal(reopened.session.get('secret'),undefined)
  const updated=reopened.read();updated.bookings[0].status='completed';reopened.write(updated)
  assert.equal(reopened.read().bookings[0].status,'completed')
  reopened.close()
  assert.equal(JSON.parse(readFileSync(legacy,'utf8')).bookings[0].status,'confirmed')
 }finally{rmSync(dir,{recursive:true,force:true})}
})
