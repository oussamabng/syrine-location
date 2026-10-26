import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
const root=resolve(import.meta.dirname,'..')
const children=[]
function run(name,command,args){
 const child=spawn(command,args,{cwd:root,env:process.env,stdio:'inherit',shell:false})
 children.push(child)
 child.on('exit',(code)=>{if(!closing){console.error(`${name} stopped (${code}). Shutting down.`);stop(code||1)}})
 return child
}
let closing=false
function stop(code=0){if(closing)return;closing=true;for(const child of children)child.kill('SIGTERM');process.exitCode=code}
process.on('SIGINT',()=>stop(0));process.on('SIGTERM',()=>stop(0));
run('Syrine API',process.execPath,['server/index.mjs'])
run('Next.js',process.execPath,['node_modules/next/dist/bin/next','dev'])
