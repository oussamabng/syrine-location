import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {NextRequest} from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const mime:Record<string,string>={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
export async function GET(_req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const {path}=await params;
  if(path.length!==1||!/^[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(path[0]))return new Response(null,{status:404});
  const base=resolve(process.env.SYRINE_UPLOAD_DIR || resolve(process.env.SYRINE_DATA_DIR || resolve(process.cwd(),'data'),'uploads'));
  const target=resolve(base,path[0]);
  if(!target.startsWith(base+sep))return new Response(null,{status:404});
  try{const bytes=await readFile(target);return new Response(new Uint8Array(bytes),{headers:{'Content-Type':mime[extname(target)],'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}})}catch{return new Response(null,{status:404})}
}
