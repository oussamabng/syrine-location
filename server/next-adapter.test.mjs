import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,rmSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {handleWebRequest} from './next-adapter.mjs'

const dir=mkdtempSync(join(tmpdir(),'syrine-unified-api-'))
process.env.SYRINE_DATA_DIR=dir
process.env.SYRINE_DB_PATH=join(dir,'main.sqlite')
process.env.ADMIN_PASSWORD='local-test-password-very-long'
process.env.PUBLIC_ORIGIN='http://localhost:3000'
const invoke=(name,method='GET',data=null,cookie='')=>{
 const request=new Request('http://localhost:3000/api/'+name,{
  method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},
  body:data?JSON.stringify(data):undefined
 })
 return handleWebRequest(request,name.split('/'))
}
test('unified API writes SQLite, confirms reservations, rejects overlaps, and saves CMS settings',async()=>{
 try{
  const catalogue=await invoke('public');assert.equal(catalogue.status,200)
  const {cars}=await catalogue.json();assert.equal(cars.length,13)
  const login=await invoke('admin/login','POST',{username:'admin',password:process.env.ADMIN_PASSWORD})
  assert.equal(login.status,200)
  const cookie=login.headers.get('set-cookie').split(';')[0]
  const first=new Date(Date.now()+2*86400000).toISOString().slice(0,10)
  const last=new Date(Date.now()+10*86400000).toISOString().slice(0,10)
  const bookingInput={carId:cars[0].id,fullName:'Integration Test',phone:'+213555555555',pickup:'Aéroport Oran',startDate:first,endDate:last}
  const booked=await invoke('public/reservations','POST',bookingInput)
  assert.equal(booked.status,201)
  const created=(await booked.json()).booking
  const confirmed=await invoke(`admin/reservations/${created.id}`,'PATCH',{status:'confirmed'},cookie)
  assert.equal(confirmed.status,200)
  const duplicate=await invoke('public/reservations','POST',bookingInput)
  assert.equal(duplicate.status,409)
  const owner=await invoke('admin/reservations','GET',null,cookie)
  assert.equal((await owner.json()).bookings[0].status,'confirmed')
  const dataPath=join(dir,'main.sqlite')
  const {DatabaseSync}=await import('node:sqlite')
  const sqlite=new DatabaseSync(dataPath)
  const statuses=sqlite.prepare('SELECT status FROM bookings').all().map(row=>row.status)
  assert.deepEqual(statuses,['confirmed'])
  sqlite.close()
 } finally {rmSync(dir,{recursive:true,force:true})}
})
