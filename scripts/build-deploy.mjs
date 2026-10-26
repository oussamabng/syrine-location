/** Build a single deploy ZIP. Never bundle customer data, .env secrets or uploads. */
import {spawnSync} from 'node:child_process'
import {existsSync,mkdirSync,rmSync,cpSync,copyFileSync,writeFileSync} from 'node:fs'
import {resolve,join,relative,basename,sep} from 'node:path'
const root=resolve(import.meta.dirname,'..')
if(process.platform!=='linux' && process.env.ALLOW_NON_LINUX_PACKAGE!=='1') {
 console.error('Production ZIP requires a Linux build for your Ubuntu VPS. Use the GitHub Actions release workflow or run pnpm build:deploy on Ubuntu.');
 process.exit(1)
}
const run=(cmd,args,cwd=root)=>{
 const r=spawnSync(cmd,args,{cwd,stdio:'inherit',env:process.env})
 if(r.error||r.status!==0)throw new Error(`${cmd} ${args.join(' ')} failed (${r.error||r.status})`)
}
run(process.execPath,['node_modules/next/dist/bin/next','build'])
const from=join(root,'.next/standalone')
if(!existsSync(join(from,'server.js')))throw new Error('Next.js standalone build missing')
const stage=join(root,'.syrine-release')
rmSync(stage,{recursive:true,force:true})
mkdirSync(stage,{recursive:true})
cpSync(from,stage,{recursive:true,filter:(src)=>{const rel=relative(from,src);const top=rel.split(sep)[0];return top!=='data'&&!basename(src).startsWith('.env')}})
const publicPath=join(root,'public')
cpSync(publicPath,join(stage,'public'),{recursive:true,filter:(src)=>relative(publicPath,src).split(sep)[0]!=='uploads'})
cpSync(join(root,'.next/static'),join(stage,'.next/static'),{recursive:true})
mkdirSync(join(stage,'scripts'),{recursive:true})
mkdirSync(join(stage,'server'),{recursive:true})
cpSync(join(root,'server/db'),join(stage,'server/db'),{recursive:true})
copyFileSync(join(root,'server/seed.mjs'),join(stage,'server/seed.mjs'))
for(const helper of ['backup-db.mjs','reset-admin.mjs','load-env.mjs'])copyFileSync(join(root,'scripts',helper),join(stage,'scripts',helper))
copyFileSync(join(root,'.env.example'),join(stage,'.env.example'))
copyFileSync(join(root,'deploy','README.md'),join(stage,'DEPLOY.md'))
const tag=new Date().toISOString().replace(/[:.]/g,'-')
const filename=`Syrine-Production-${tag}.zip`
const output=join(root,filename)
run('zip',['-q','-r',output,'.'],stage)
console.log('\nCreated release:',output)
console.log('Do not replace SYRINE_DATA_DIR when deploying. Run ONE Node.js process.')
