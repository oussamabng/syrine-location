import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { makeServer } from './index.mjs'

test('public catalogue → booking → protected owner review → status update → persisted JSON',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'syrine-test-'))
  const path=join(dir,'db.json')
  const app=makeServer({dataPath:path,password:'testing-admin-password'})
  await new Promise(done=>app.listen(0,'127.0.0.1',done))
  const base='http://127.0.0.1:'+app.address().port
  const get=async(url,init={})=>fetch(base+url,init)
  try{
    const publicResponse=await get('/api/public')
    assert.equal(publicResponse.status,200)
    const {cars}=await publicResponse.json()
    assert.equal(cars.length,13)
    assert.equal(cars[0].dailyPrice,12500)
    assert.equal((await get('/api/admin/reservations')).status,401)
    const today=new Date();today.setUTCDate(today.getUTCDate()+1)
    const tomorrow=new Date(today);tomorrow.setUTCDate(tomorrow.getUTCDate()+5)
    const fields={carId:cars[0].id,fullName:'Test Client',phone:'+213555555555',email:'test@example.com',pickup:'Oran',startDate:today.toISOString().slice(0,10),endDate:tomorrow.toISOString().slice(0,10),note:'LOCAL TEST'}
    const created=await get('/api/public/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)})
    assert.equal(created.status,201)
    const {booking}=await created.json()
    assert.equal(booking.totalEstimate,62500)
    assert.equal(booking.status,'pending')
    assert.ok(booking.reference.startsWith('SYR-'))
    const forbidden=await get('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'wrong'})})
    assert.equal(forbidden.status,401)
    const login=await get('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'testing-admin-password'})})
    assert.equal(login.status,200)
    const cookie=login.headers.get('set-cookie').split(';')[0]
    const me=await get('/api/admin/me',{headers:{cookie}}).then(r=>r.json())
    assert.equal(me.user.role,'admin')
    assert.equal(me.user.username,'admin')
    assert.equal(me.user.hash,undefined)
    const owner=await get('/api/admin/reservations',{headers:{cookie}})
    assert.equal(owner.status,200)
    assert.equal((await owner.json()).bookings.length,1)
    const changed=await get('/api/admin/reservations/'+booking.id,{method:'PATCH',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({status:'confirmed'})})
    assert.equal(changed.status,200)
    assert.equal((await changed.json()).booking.status,'confirmed')
    const csv=await get('/api/admin/export.csv',{headers:{cookie}})
    assert.equal(csv.status,200)
    assert.ok((await csv.text()).includes('Test Client'))
    const saved=JSON.parse(readFileSync(path,'utf8'))
    assert.equal(saved.bookings[0].status,'confirmed')
    const invalid=await get('/api/public/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,startDate:'2000-01-01'})})
    assert.equal(invalid.status,400)
    const newCar=await get('/api/admin/cars',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({name:'Local Test Car',year:2026,color:'Blanc',transmission:'Manuelle',dailyPrice:8000,dailyPriceEur:28})})
    assert.equal(newCar.status,201)
    assert.equal((await get('/api/public').then(r=>r.json())).cars.length,14)
    const messageResponse=await get('/api/public/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:'Contact Local',reply:'+213555555555',subject:'Question',message:'Bonjour, disponible en Novembre ?'})})
    assert.equal(messageResponse.status,201)
    const messages=await get('/api/admin/messages',{headers:{cookie}})
    const messageRows=await messages.json()
    assert.equal(messageRows.messages.length,1)
    const updatedMessage=await get('/api/admin/messages/'+messageRows.messages[0].id,{method:'PATCH',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({status:'read'})})
    assert.equal(updatedMessage.status,200)
    const customers=await get('/api/admin/customers',{headers:{cookie}})
    assert.equal((await customers.json()).customers.length,1)
    const activity=await get('/api/admin/activity',{headers:{cookie}})
    assert.ok((await activity.json()).activity.length>=2)
    const createAgent=await get('/api/admin/users',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({username:'manager.test',password:'a-strong-password-123',role:'agent'})})
    assert.equal(createAgent.status,201)
    const agentLogin=await get('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'manager.test',password:'a-strong-password-123'})})
    assert.equal(agentLogin.status,200)
    const agentCookie=agentLogin.headers.get('set-cookie').split(';')[0]
    assert.equal((await get('/api/admin/reservations',{headers:{cookie:agentCookie}})).status,200)
    assert.equal((await get('/api/admin/users',{headers:{cookie:agentCookie}})).status,403)
    assert.equal((await get('/api/admin/cars/'+cars[0].id,{method:'PATCH',headers:{cookie:agentCookie,'Content-Type':'application/json'},body:JSON.stringify({dailyPrice:13500})})).status,403)
    const users=await get('/api/admin/users',{headers:{cookie}}).then(r=>r.json())
    assert.equal(users.users.length,2)
    assert.equal(users.users[0].hash,undefined)
    const logout=await get('/api/admin/logout',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:'{}'})
    assert.equal(logout.status,200)
    assert.equal((await get('/api/admin/reservations',{headers:{cookie}})).status,401)
  }finally{await new Promise(resolve=>app.close(resolve));rmSync(dir,{recursive:true,force:true})}
})

test('v6 data migration preserves reservations and cars, creates a hashed admin user',async()=>{
  const { defaultDB }=await import('./seed.mjs')
  const { writeFileSync }=await import('node:fs')
  const dir=mkdtempSync(join(tmpdir(),'syrine-migration-'))
  const path=join(dir,'db.json')
  const old=defaultDB()
  old.bookings=[{id:'legacy-booking',reference:'SYR-OLD',status:'pending',fullName:'Legacy Customer'}]
  old.cars[0].dailyPrice=14700
  writeFileSync(path,JSON.stringify(old))
  const app=makeServer({dataPath:path,password:'migration-test-password',username:'admin'})
  await new Promise(done=>app.listen(0,'127.0.0.1',done))
  const base='http://127.0.0.1:'+app.address().port
  try{
    const login=await fetch(base+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'migration-test-password'})})
    assert.equal(login.status,200)
    const persisted=JSON.parse(readFileSync(path,'utf8'))
    assert.equal(persisted.bookings[0].reference,'SYR-OLD')
    assert.equal(persisted.cars[0].dailyPrice,14700)
    assert.equal(persisted.users.length,1)
    assert.equal(persisted.users[0].role,'admin')
    assert.equal(persisted.users[0].hash.includes('migration-test-password'),false)
    assert.ok(persisted.users[0].hash.includes(':'))
  }finally{await new Promise(resolve=>app.close(resolve));rmSync(dir,{recursive:true,force:true})}
})

test('v8 admin parity: calendar conflict, rental lifecycle, CMS history, photos, settings, role protection and persistence',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'syrine-v8-'))
  const path=join(dir,'db.json')
  const app=makeServer({dataPath:path,password:'v8-admin-test-password'})
  await new Promise(done=>app.listen(0,'127.0.0.1',done))
  const base='http://127.0.0.1:'+app.address().port
  const req=(path,method='GET',data,auth)=>fetch(base+path,{method,headers:{...(auth?{cookie:auth}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data)})
  try {
    const login=await req('/api/admin/login','POST',{username:'admin',password:'v8-admin-test-password'})
    assert.equal(login.status,200)
    const cookie=login.headers.get('set-cookie').split(';')[0]
    const cars=(await (await req('/api/public')).json()).cars
    const tomorrow=new Date();tomorrow.setUTCDate(tomorrow.getUTCDate()+10)
    const end=new Date(tomorrow);end.setUTCDate(end.getUTCDate()+6)
    const period={carId:cars[0].id,startDate:tomorrow.toISOString().slice(0,10),endDate:end.toISOString().slice(0,10)}
    const b=await req('/api/admin/calendar/blocks','POST',{...period,reason:'Maintenance'},cookie);assert.equal(b.status,201)
    const blocked=(await b.json()).block
    assert.equal((await req('/api/public/availability/'+cars[0].id)).status,200)
    assert.equal((await req('/api/public/reservations','POST',{...period,fullName:'Test Client',phone:'+213555555555',pickup:'Oran'})).status,409)
    assert.equal((await req('/api/admin/calendar/blocks/'+blocked.id,'DELETE',undefined,cookie)).status,200)
    const bookingResult=await req('/api/public/reservations','POST',{...period,fullName:'Test Client',phone:'+213555555555',pickup:'Oran'})
    assert.equal(bookingResult.status,201)
    const booking=(await bookingResult.json()).booking
    assert.equal((await req('/api/admin/reservations/'+booking.id,'PATCH',{status:'confirmed'},cookie)).status,200)
    assert.equal((await req('/api/public/reservations','POST',{...period,fullName:'Second Client',phone:'+213555555556',pickup:'Oran'})).status,409)
    assert.equal((await req('/api/admin/reservations/'+booking.id+'/rental','PATCH',{action:'start'},cookie)).status,200)
    const tracked=await req('/api/public/track?token='+booking.trackToken);assert.equal(tracked.status,200);assert.ok((await tracked.json()).rental.startedAt)
    assert.equal((await req('/api/admin/reservations/'+booking.id+'/rental','PATCH',{action:'end'},cookie)).status,200)
    assert.equal((await req('/api/admin/reservations/'+booking.id,'DELETE',undefined,cookie)).status,200)
    assert.equal((await req('/api/admin/cars/'+cars[0].id,'PATCH',{images:['/cars/demo.webp','/uploads/foo.webp']},cookie)).status,200)
    const photo=(await (await req('/api/public')).json()).cars[0];assert.equal(photo.images.length,2)
    const settings=await req('/api/admin/settings','PATCH',{appearance:{accent:'#ffdd00',mode:'light'}},cookie);assert.equal(settings.status,200)
    const published=(await (await req('/api/public/site')).json()).site;assert.equal(published.appearance.mode,'light')
    const text={fr:'Informations',en:'Information',ar:'معلومات'}
    const created=await req('/api/admin/content/terms','POST',{t:text,b:text},cookie);assert.equal(created.status,201)
    const term=(await created.json()).item
    assert.equal((await req('/api/admin/content/terms/'+term.id,'PATCH',{off:true},cookie)).status,200)
    const {cms}=await (await req('/api/admin/content','GET',undefined,cookie)).json()
    assert.equal(cms.termsHistory.length,2)
    assert.equal((await req('/api/admin/content/terms/restore/'+cms.termsHistory[0].id,'POST',{},cookie)).status,200)
    assert.equal((await req('/api/admin/content/faq','POST',{q:text,a:text},cookie)).status,201)
    const agent=await req('/api/admin/users','POST',{username:'v8agent',password:'v8-agent-password-123',role:'agent'},cookie);assert.equal(agent.status,201)
    const agentLogin=await req('/api/admin/login','POST',{username:'v8agent',password:'v8-agent-password-123'});const agentCookie=agentLogin.headers.get('set-cookie').split(';')[0]
    assert.equal((await req('/api/admin/settings','PATCH',{appearance:{accent:'#ffffff',mode:'dark'}},agentCookie)).status,403)
    assert.equal((await req('/api/admin/content/faq','POST',{q:text,a:text},agentCookie)).status,403)
    assert.equal((await req('/api/admin/cars/'+cars[0].id,'DELETE',undefined,cookie)).status,200)
    const stored=JSON.parse(readFileSync(path,'utf8'))
    assert.equal(stored.site.appearance.mode,'light');assert.equal(stored.cms.faq.length,1);assert.equal(stored.cars.length,12)
  } finally {await new Promise(done=>app.close(done));rmSync(dir,{recursive:true,force:true})}
})
