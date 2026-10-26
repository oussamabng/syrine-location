/** Bridges a Next.js route handler to the existing Syrine HTTP controller in-process.
 * No second HTTP server or localhost proxy is started. */
import {Readable} from 'node:stream'
import {makeServer} from './index.mjs'
import {openStore} from './db/storage.mjs'
import {randomBytes} from 'node:crypto'
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'

let controller
function initialPassword() {
  if(process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD
  const base=process.env.SYRINE_DATA_DIR || resolve(process.cwd(),'data')
  const path=resolve(base,'.admin-password')
  mkdirSync(dirname(path),{recursive:true,mode:0o700})
  if(!existsSync(path))writeFileSync(path,randomBytes(24).toString('base64url')+'\n',{mode:0o600,flag:'wx'})
  return readFileSync(path,'utf8').trim()
}
export function controllerServer(){
  controller ??= makeServer({store:openStore(),password:initialPassword()})
  return controller
}
export async function handleWebRequest(webRequest,path){
  const url=new URL(webRequest.url)
  const req=Readable.from(webRequest.body||[])
  req.url='/api/'+path.map(encodeURIComponent).join('/')+url.search
  req.method=webRequest.method
  req.headers=Object.fromEntries(webRequest.headers)
  // Configure Nginx to set X-Real-IP and reject direct remote access to Node.
  req.socket={remoteAddress:webRequest.headers.get('x-real-ip')||webRequest.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'}
  return await new Promise((resolve,reject)=>{
    let status=200,headers={},ended=false
    const timer=setTimeout(()=>{if(!ended){ended=true;reject(new Error('API handler timed out'))}},30000)
    const res={
      writeHead(code,responseHeaders={}){status=code;headers=responseHeaders;return this},
      end(body){if(ended)return;ended=true;clearTimeout(timer);resolve(new Response(body??null,{status,headers}))}
    }
    try{controllerServer().emit('request',req,res)}catch(error){clearTimeout(timer);reject(error)}
  })
}
