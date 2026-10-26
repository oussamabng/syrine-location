// Standalone recovery utilities don't run through Next.js' .env loader.
import {existsSync} from 'node:fs'
import {resolve} from 'node:path'
export function loadLocalEnv(){
 for(const filename of ['.env','.env.local']){
  const file=resolve(process.cwd(),filename)
  if(existsSync(file)&&typeof process.loadEnvFile==='function')process.loadEnvFile(file)
 }
}
