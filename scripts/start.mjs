import {spawn} from 'node:child_process'
const processes=[spawn(process.execPath,['server/index.mjs'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/next/dist/bin/next','start'],{stdio:'inherit'})]
function stop(){for(const p of processes)p.kill('SIGTERM')}
process.on('SIGINT',stop);process.on('SIGTERM',stop)
for(const p of processes)p.on('exit',()=>stop())
