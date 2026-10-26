import {handleWebRequest} from '@/server/next-adapter.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
type Context={params:Promise<{path:string[]}>};
async function respond(request:Request,context:Context){
  const {path}=await context.params;
  return handleWebRequest(request,path);
}
export {respond as GET,respond as POST,respond as PATCH,respond as DELETE,respond as HEAD};
