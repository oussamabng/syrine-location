import http from 'node:http'
import { promises as fs, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname, extname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, randomUUID, timingSafeEqual, createHash, scryptSync } from 'node:crypto'
import { defaultDB } from './seed.mjs'
import { handleExtra, validateImages, hasConflict } from './extensions.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const MIME = {'.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.json':'application/json', '.woff2':'font/woff2'}
const statuses = new Set(['pending', 'confirmed', 'rejected', 'completed', 'cancelled'])
const roles = new Set(['admin', 'agent'])
function passwordHash(secret, salt=randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(secret,salt,64).toString('hex')}`
}
function verifyPassword(secret, stored) {
  if (typeof stored !== 'string' || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false
  const [salt, hash] = stored.split(':')
  return timingSafeEqual(scryptSync(secret,salt,64),Buffer.from(hash,'hex'))
}
const visibleUser = u => ({id:u.id,username:u.username,role:u.role,createdAt:u.createdAt,active:u.active!==false})
const auditEvent = (db,user,action,subject='') => {
  db.activity ??= []
  db.activity.unshift({id:randomUUID(),user:user?.username||'system',action,subject,at:new Date().toISOString()})
  db.activity=db.activity.slice(0,1000)
}


function readEnv() {
  const file = resolve(ROOT, '.env')
  if (!existsSync(file)) return
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = raw.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}
function ensurePassword() {
  if (process.env.ADMIN_PASSWORD) return { password:process.env.ADMIN_PASSWORD, generated:false }
  const file = resolve(ROOT, 'data/.admin-password')
  mkdirSync(dirname(file), { recursive:true })
  if (!existsSync(file)) writeFileSync(file, randomBytes(12).toString('base64url'), {mode:0o600})
  return { password:readFileSync(file,'utf8').trim(), generated:true }
}
function secureEqual(a,b) {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha,hb)
}
function json(res, code, data, headers = {}) {
  const content = JSON.stringify(data)
  res.writeHead(code, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...headers})
  res.end(content)
}
function error(res, code, message) { json(res, code, {error:message}) }
async function readBody(req) {
  const parts=[]; let total=0
  for await (const piece of req) {
    total+=piece.length
    if (total > 32768) throw Object.assign(new Error('Requête trop volumineuse.'),{status:413})
    parts.push(piece)
  }
  try { const value = JSON.parse(Buffer.concat(parts).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value }
  catch { throw Object.assign(new Error('JSON invalide.'),{status:400}) }
}
const clean = (value, max=250) => typeof value === 'string' ? value.trim().slice(0,max) : ''
const isDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().slice(0,10)===d
const daysBetween = (start,end) => Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)
function carFields(value, fallback = {}) {
  const name = clean(value.name ?? fallback.name, 80)
  const year = Number(value.year ?? fallback.year)
  const color = clean(value.color ?? fallback.color,40)
  const transmission = value.transmission ?? fallback.transmission
  const dailyPrice = Number(value.dailyPrice ?? fallback.dailyPrice)
  const dailyPriceEur = Number(value.dailyPriceEur ?? fallback.dailyPriceEur ?? 0)
  if (name.length<2 || !Number.isInteger(year) || year<2000 || year>2100 || !color || !['Manuelle','Automatique'].includes(transmission) || !Number.isInteger(dailyPrice) || dailyPrice<=0 || dailyPrice>2000000 || !Number.isFinite(dailyPriceEur) || dailyPriceEur<0) throw Object.assign(new Error('Données du véhicule invalides.'),{status:400})
  return {
    name, year, color, transmission, dailyPrice, dailyPriceEur,
    category:clean(value.category ?? fallback.category ?? 'SUV',30),
    seats: Math.max(1,Math.min(9,Number(value.seats ?? fallback.seats ?? 5)||5)),
    fuel:clean(value.fuel ?? fallback.fuel ?? 'Essence',30),
    description:clean(value.description ?? fallback.description ?? '',500),
    descriptions:Object.fromEntries(['fr','en','ar'].map(l=>[l,clean(value.descriptions?.[l] ?? fallback.descriptions?.[l] ?? '',500)])),
    available:typeof value.available==='boolean'?value.available:(fallback.available??true),
    featured:typeof value.featured==='boolean'?value.featured:(fallback.featured??false),
    sample:typeof value.sample==='boolean'?value.sample:(fallback.sample??true),
    images: Array.isArray(fallback.images) ? fallback.images : ['/assets/cars/coolray-silver.svg']
  }
}

// Expose the in-process controller directly to Next.js without emitting a fake
// IncomingMessage/ServerResponse pair on an actual Node HTTP server.
export function makeHandler({dataPath=resolve(ROOT,'data/db.json'), store=null, password, username=process.env.ADMIN_USERNAME||'admin', publicPath=DIST}={}) {
  let db
  if (store) {
    db = store.initialized ? store.read() : defaultDB()
    if(!store.initialized) store.write(db)
  } else if (existsSync(dataPath)) { db=JSON.parse(readFileSync(dataPath,'utf8')); db.messages ??= [] }
  else { db=defaultDB(); mkdirSync(dirname(dataPath),{recursive:true}); writeFileSync(dataPath, JSON.stringify(db,null,2)) }
  const sessions=store ? {get:store.session.get,set:(t,obj)=>store.session.set(t,obj.userId,obj.expires),delete:store.session.delete,revokeUser:store.session.revokeUser} : new Map()
  const publicAttempts=new Map()
  const attempts=new Map()
  // Migrate old v6 databases in place, without touching cars or reservations.
  if(!Array.isArray(db.users) || db.users.length===0){
    const secret=password??ensurePassword().password
    db.users=[{id:randomUUID(),username,role:'admin',hash:passwordHash(secret),active:true,createdAt:new Date().toISOString()}]
    db.activity ??= []
    if(store) store.write(db)
    else writeFileSync(dataPath,JSON.stringify(db,null,2),{mode:0o600})
  }
  db.activity ??= []
  let saving = Promise.resolve()
  const save = () => {
    const content=JSON.stringify(db,null,2)
    saving=saving.then(async()=>{
      const temp=`${dataPath}.${process.pid}.tmp`
      if(store)store.write(JSON.parse(content))
      else {await fs.writeFile(temp,content);await fs.rename(temp,dataPath)}
    })
    return saving
  }
  const getUser = req => {
    const cookie=req.headers.cookie||''
    const match=cookie.match(/(?:^|;\s*)chawki_session=([a-f0-9]{64})(?:;|$)/)
    if (!match) return null
    const session=sessions.get(match[1])
    if (!session || Date.now()>session.expires) {sessions.delete(match[1]);return null}
    const user=db.users.find(u=>u.id===session.userId && u.active!==false)
    return user || null
  }
  const cookieHeader=(token, maxAge)=>`chawki_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`
  return async (req,res)=> {
    try {
      const method=req.method||'GET'
      const url=new URL(req.url||'/', 'http://localhost')
      const pathname=url.pathname.replace(/\/+$/,'')||'/'
      if (!['GET','HEAD','POST','PATCH','DELETE'].includes(method)) return error(res,405,'Méthode non autorisée.')
      if (pathname.startsWith('/api/')) {
        if (['POST','PATCH','DELETE'].includes(method)) {
          const origin=req.headers.origin
          const allowed=process.env.NODE_ENV==='production'
            ? [process.env.PUBLIC_ORIGIN].filter(Boolean)
            : [process.env.PUBLIC_ORIGIN,'http://localhost:3000','http://127.0.0.1:3000'].filter(Boolean)
          if(origin && !allowed.includes(origin)) return error(res,403,'Origine non autorisée.')
          if(['POST','PATCH'].includes(method) && pathname!=='/api/admin/upload' && !String(req.headers['content-type']||'').includes('application/json')) return error(res,415,'Content-Type application/json requis.')
        }
        if(await handleExtra({req,res,method,pathname,url,db,current:pathname.startsWith('/api/admin/')&&pathname!=='/api/admin/login'?getUser(req):null,save}))return
        if (method==='GET' && pathname==='/api/health') return json(res,200,{ok:true})
        if (method==='GET' && pathname==='/api/public') return json(res,200,{brand:'Chawki Auto Oran — maquette non officielle',cars:db.cars.filter(car=>car.available)})
        if (method==='GET' && pathname.startsWith('/api/public/cars/')) {
          const car=db.cars.find(c=>c.id===pathname.split('/').at(-1)&&c.available)
          return car?json(res,200,{car}):error(res,404,'Véhicule introuvable.')
        }
        if (method==='POST' && pathname==='/api/public/reservations') {
          const ip=req.socket.remoteAddress||'unknown'
          const previous=publicAttempts.get(ip)||{count:0,until:0}
          if(previous.until>Date.now() && previous.count>=10) return error(res,429,'Trop de demandes. Veuillez réessayer plus tard.')
          publicAttempts.set(ip,{count:previous.until>Date.now()?previous.count+1:1,until:Date.now()+3600000})
          const body=await readBody(req)
          const car=db.cars.find(c=>c.id===body.carId && c.available)
          if (!car) return error(res,404,'Véhicule non disponible.')
          const fullName=clean(body.fullName,100), phone=clean(body.phone,35), email=clean(body.email,120)
          const pickup=clean(body.pickup,100), note=clean(body.note,1000)
          const startDate=clean(body.startDate,10), endDate=clean(body.endDate,10)
          const days=isDate(startDate)&&isDate(endDate)?daysBetween(startDate,endDate):0
          const today=new Date().toISOString().slice(0,10)
          if(days<5 || fullName.length<3 || !/^[+\d ()-]{8,25}$/.test(phone) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || !pickup || days<1 || days>90 || startDate<today) return error(res,400,'Vérifiez le nom, le téléphone, les dates et le lieu de prise en charge. La date de retour doit être après le départ.')
          if(hasConflict(db,car.id,startDate,endDate)) return error(res,409,'Ce véhicule est déjà réservé sur cette période.')
          const now=new Date().toISOString()
          const booking={id:randomUUID(),reference:'SYR-'+Date.now().toString(36).toUpperCase().slice(-6)+'-'+randomBytes(2).toString('hex').toUpperCase(),carId:car.id,carName:`${car.name} ${car.year}`,fullName,phone,email,pickup,startDate,endDate,days,dailyPrice:car.dailyPrice,totalEstimate:days*car.dailyPrice,note,trackToken:randomBytes(24).toString('hex'),status:'pending',createdAt:now,updatedAt:now}
          db.bookings.unshift(booking)
          await save()
          return json(res,201,{booking,notice:'Demande reçue, non confirmée. L’agence doit vérifier les dates.'})
        }
        if(method==='POST' && pathname==='/api/public/messages') {
          const ip=req.socket.remoteAddress||'unknown'
          const previous=publicAttempts.get(ip)||{count:0,until:0}
          if(previous.until>Date.now() && previous.count>=10) return error(res,429,'Trop de demandes. Veuillez réessayer plus tard.')
          publicAttempts.set(ip,{count:previous.until>Date.now()?previous.count+1:1,until:Date.now()+3600000})
          const body=await readBody(req)
          const fullName=clean(body.fullName,100), reply=clean(body.reply,130)
          const subject=clean(body.subject,120), message=clean(body.message,2000)
          if(fullName.length<3 || reply.length<5 || message.length<8) return error(res,400,'Complétez le nom, vos coordonnées et votre message.')
          const record={id:randomUUID(),fullName,reply,subject,message,createdAt:new Date().toISOString(),status:'unread'}
          db.messages.unshift(record);await save();return json(res,201,{message:{id:record.id,status:record.status}})
        }
        if(method==='POST' && pathname==='/api/admin/login') {
          const ip=req.socket.remoteAddress||'unknown', limit=attempts.get(ip)||{count:0,until:0}
          if(limit.count>=8 && limit.until>Date.now()) return error(res,429,'Trop de tentatives. Réessayez dans 10 minutes.')
          const body=await readBody(req)
          const login=clean(body.username,80).toLowerCase()
          const secret=typeof body.password==='string'?body.password.slice(0,512):''
          const user=db.users.find(u=>u.username.toLowerCase()===login&&u.active!==false)
          // Check a dummy hash to reduce username enumeration timing differences.
          const valid=verifyPassword(secret,user?.hash||passwordHash('dummy-password','00000000000000000000000000000000'))
          if(!user || !valid) {
            attempts.set(ip,{count:limit.until>Date.now()?limit.count+1:1,until:Date.now()+10*60000})
            return error(res,401,'Identifiant ou mot de passe incorrect.')
          }
          attempts.delete(ip)
          const token=randomBytes(32).toString('hex')
          sessions.set(token,{userId:user.id,expires:Date.now()+8*3600000})
          return json(res,200,{authenticated:true,user:visibleUser(user)},{'Set-Cookie':cookieHeader(token,28800)})
        }
        if(method==='GET' && pathname==='/api/admin/me') {
          const current=getUser(req)
          return json(res,200,{authenticated:!!current,user:current?visibleUser(current):null})
        }
        const current=getUser(req)
        if(!current) return error(res,401,'Authentification requise.')
        if(method==='POST' && pathname==='/api/admin/logout') {
          const match=(req.headers.cookie||'').match(/chawki_session=([a-f0-9]{64})/)
          if(match) sessions.delete(match[1])
          return json(res,200,{ok:true},{'Set-Cookie':cookieHeader('',0)})
        }
        if(method==='GET' && pathname==='/api/admin/overview') {
          const pending=db.bookings.filter(b=>b.status==='pending').length
          const confirmed=db.bookings.filter(b=>b.status==='confirmed').length
          return json(res,200,{metrics:{bookings:db.bookings.length,pending,confirmed,messages:db.messages.filter(m=>m.status!=='read').length,cars:db.cars.filter(c=>c.available).length,estimates:db.bookings.filter(b=>['confirmed','completed'].includes(b.status)).reduce((a,b)=>a+(Number(b.totalEstimate)||0),0)},recentBookings:db.bookings.slice(0,6),recentActivity:db.activity.slice(0,12)})
        }
        if(method==='GET' && pathname==='/api/admin/customers') {
          const customers=new Map()
          for(const b of db.bookings) {
            const key=b.phone.replace(/\D/g,'')
            if(!key)continue
            if(!customers.has(key)) customers.set(key,{id:key,fullName:b.fullName,phone:b.phone,email:b.email||'',bookings:0,totalEstimate:0,latest:b.createdAt})
            const c=customers.get(key); c.bookings++;if(b.status==='completed')c.totalEstimate+=Number(b.totalEstimate)||0;if(!c.email&&b.email)c.email=b.email
          }
          return json(res,200,{customers:[...customers.values()]})
        }
        if(method==='GET' && pathname==='/api/admin/activity') return json(res,200,{activity:db.activity.slice(0,200)})
        if(method==='GET' && pathname==='/api/admin/users') {
          if(current.role!=='admin') return error(res,403,'Droits administrateur requis.')
          return json(res,200,{users:db.users.map(visibleUser)})
        }
        if(method==='POST' && pathname==='/api/admin/users') {
          if(current.role!=='admin') return error(res,403,'Droits administrateur requis.')
          const body=await readBody(req)
          const newName=clean(body.username,40).toLowerCase(), newPassword=body.password
          if(!/^[a-z0-9_.-]{3,40}$/.test(newName) || typeof newPassword!=='string' || newPassword.length<10 || newPassword.length>128 || !roles.has(body.role)) return error(res,400,'Identifiant invalide ou mot de passe inférieur à 12 caractères.')
          if(db.users.some(u=>u.username.toLowerCase()===newName)) return error(res,409,'Identifiant déjà utilisé.')
          const user={id:randomUUID(),username:newName,role:body.role,hash:passwordHash(newPassword),active:true,createdAt:new Date().toISOString()}
          db.users.push(user);auditEvent(db,current,'user.created',newName);await save()
          return json(res,201,{user:visibleUser(user)})
        }
        if(method==='PATCH' && /^\/api\/admin\/users\/[a-z0-9-]+$/i.test(pathname)) {
          if(current.role!=='admin') return error(res,403,'Droits administrateur requis.')
          const user=db.users.find(u=>u.id===pathname.split('/').at(-1))
          if(!user) return error(res,404,'Utilisateur introuvable.')
          const body=await readBody(req)
          if(typeof body.password==='string' && body.password.length>0){
            if(body.password.length<10||body.password.length>128) return error(res,400,'Mot de passe : minimum 10 caractères.')
            user.hash=passwordHash(body.password)
            if(store) sessions.revokeUser(user.id)
            else for(const [token, session] of sessions) if(session.userId===user.id) sessions.delete(token)
          }
          if(typeof body.active==='boolean' && user.id!==current.id)user.active=body.active
          if(roles.has(body.role) && user.id!==current.id)user.role=body.role
          auditEvent(db,current,'user.updated',user.username);await save()
          return json(res,200,{user:visibleUser(user)})
        }
        if(method==='GET' && pathname==='/api/admin/reservations') return json(res,200,{bookings:db.bookings})
        if(method==='GET' && pathname==='/api/admin/messages') return json(res,200,{messages:db.messages})
        if(method==='GET' && pathname==='/api/admin/cars') return json(res,200,{cars:db.cars})
        if(method==='GET' && pathname==='/api/admin/export.csv') {
          const fields=['reference','createdAt','carName','fullName','phone','email','startDate','endDate','days','pickup','totalEstimate','status','note']
          const esc=value=>'"'+String(value??'').replaceAll('"','""').replace(/^[=+@\-]/,'\'$&')+'"'
          const csv='\uFEFF'+[fields.join(';'),...db.bookings.map(b=>fields.map(f=>esc(b[f])).join(';'))].join('\r\n')
          res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="chawki-demandes.csv"','Cache-Control':'no-store'});return res.end(csv)
        }
        if(method==='PATCH' && /^\/api\/admin\/reservations\/[a-z0-9-]+$/i.test(pathname)) {
          const id=pathname.split('/').at(-1)
          const booking=db.bookings.find(b=>b.id===id)
          if(!booking) return error(res,404,'Demande introuvable.')
          const body=await readBody(req)
          if(!statuses.has(body.status)) return error(res,400,'Statut invalide.')
          if(body.status==='confirmed' && hasConflict(db,booking.carId,booking.startDate,booking.endDate,booking.id)) return error(res,409,'Conflit : ce véhicule est déjà réservé ou bloqué sur cette période.')
          if(booking.rental?.startedAt&&!booking.rental.returnedAt && ['rejected','cancelled','pending'].includes(body.status))return error(res,409,'Terminez la location active avant de modifier ce statut.')
          booking.status=body.status;booking.updatedAt=new Date().toISOString()
          auditEvent(db,current,'reservation.'+body.status,booking.reference)
          await save();return json(res,200,{booking})
        }
        if(method==='PATCH' && /^\/api\/admin\/messages\/[a-z0-9-]+$/i.test(pathname)) {
          const message=db.messages.find(m=>m.id===pathname.split('/').at(-1))
          if(!message) return error(res,404,'Message introuvable.')
          const body=await readBody(req)
          if(!['unread','read'].includes(body.status))return error(res,400,'Statut invalide.')
          message.status=body.status;auditEvent(db,current,'message.'+body.status,message.subject)
          await save();return json(res,200,{message})
        }
        if(method==='POST' && pathname==='/api/admin/cars') {
          if(current.role!=='admin')return error(res,403,'Droits administrateur requis.')
          const body=await readBody(req)
          const car={id:randomUUID(),...carFields(body)};validateImages(body,car)
          db.cars.unshift(car);auditEvent(db,current,'car.created',car.name);await save();return json(res,201,{car})
        }
        if(method==='PATCH' && /^\/api\/admin\/cars\/[a-z0-9-]+$/i.test(pathname)) {
          if(current.role!=='admin')return error(res,403,'Droits administrateur requis.')
          const car=db.cars.find(c=>c.id===pathname.split('/').at(-1))
          if(!car) return error(res,404,'Véhicule introuvable.')
          const body=await readBody(req);Object.assign(car,carFields(body,car));validateImages(body,car)
          auditEvent(db,current,'car.updated',car.name);await save();return json(res,200,{car})
        }
        return error(res,404,'Route API inconnue.')
      }
      if(!['GET','HEAD'].includes(method)) return error(res,405,'Méthode non autorisée.')
      let relative=decodeURIComponent(pathname)
      if(relative==='/'||relative==='/admin') relative='/index.html'
      const filepath=resolve(publicPath,'.'+relative)
      if(!filepath.startsWith(publicPath+sep) && filepath!==publicPath) return error(res,403,'Accès interdit.')
      const file=await fs.readFile(filepath).catch(()=>null)
      if(!file) {
        if(!extname(relative)) {
          const app=await fs.readFile(join(publicPath,'index.html')).catch(()=>null)
          if(app) {res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(app)}
        }
        return error(res,404,'Fichier introuvable. Lancez npm run build puis npm start, ou npm run dev.')
      }
      res.writeHead(200,{'Content-Type':MIME[extname(filepath)]||'application/octet-stream','X-Content-Type-Options':'nosniff'})
      res.end(method==='HEAD'?undefined:file)
    }catch(e){error(res,e.status||500,e.status?e.message:'Erreur interne du serveur.');if(!e.status) console.error(e)}
  }
}

// Keep the legacy standalone HTTP server for existing tests and tools.
export function makeServer(options={}) {
  return http.createServer(makeHandler(options))
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  readEnv()
  const {password,generated}=ensurePassword()
  const port=Number(process.env.PORT||3001)
  const server=makeServer({password})
  server.listen(port,()=>{
    console.log('\n  CHAWKI DEMO • API running: http://localhost:'+port)
    if(generated) console.log('  ADMIN INITIAL PASSWORD (local demo): '+password)
    else console.log('  INITIAL PASSWORD: from your .env / ADMIN_PASSWORD (only used when creating the first admin)')
    console.log('  ADMIN USERNAME: '+(process.env.ADMIN_USERNAME||'admin'))
    console.log('  Owner dashboard: http://localhost:3000/admin  (pnpm dev)')
    console.log('  Local data file: data/db.json\n')
  })
}
