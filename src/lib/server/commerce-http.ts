import {CommerceError, requireActor, type CommerceActor} from './commerce-policy.js';
import type {CommerceService} from './commerce-service.js';
interface CommerceEvent {request:Request;url:URL;params?:Record<string,string|undefined>;locals:{user?:CommerceActor|null}}
async function readJson(request:Request):Promise<unknown> {
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new CommerceError(415,'Use JSON for this request.');
  const reader=request.body?.getReader();if(!reader)throw new CommerceError(400,'A JSON body is required.');
  const chunks:Uint8Array[]=[];let length=0;
  try {while(true){const result=await reader.read();if(result.done)break;length+=result.value.byteLength;if(length>65536){await reader.cancel();throw new CommerceError(413,'Request too large.');}chunks.push(result.value);}}
  finally {reader.releaseLock();}
  const data=new Uint8Array(length);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));}catch{throw new CommerceError(400,'A valid JSON body is required.');}
}
export function createCommerceHandlers(service:CommerceService, configured:()=>void, allowedOrigin:()=>string) {
  function actor(event:CommerceEvent,write=false,prices=false) {
    const user=requireActor(event.locals.user);
    if(write){if(prices)configured();if(event.request.headers.get('origin')!==allowedOrigin())throw new CommerceError(403,'This request origin is not allowed.');}
    return user;
  }
  function response(work:(event:CommerceEvent)=>Promise<unknown>) {
    return async(event:CommerceEvent):Promise<Response>=>{try{return Response.json(await work(event));}catch(error){if(error instanceof CommerceError)return Response.json({success:false,message:error.message},{status:error.status});return Response.json({success:false,message:'The payment service is unavailable.'},{status:503});}};
  }
  return {
    checkout:{POST:response(async event=>{const user=actor(event,true,true);return service.checkout(user,await readJson(event.request));}),GET:response(event=>service.readCheckout(actor(event),event.url.searchParams.get('session_id')))},
    intent:{POST:response(async event=>{const user=actor(event,true,true);return service.intent(user,await readJson(event.request));}),GET:response(event=>service.readIntent(actor(event),event.url.searchParams.get('payment_intent_id')))},
    subscriptions:{POST:response(async event=>{const user=actor(event,true,true);return service.subscribe(user,await readJson(event.request));}),GET:response(event=>service.subscriptions(actor(event),event.url.searchParams.get('customer_id')))},
    subscription:{GET:response(event=>service.subscription(actor(event),event.params?.id)),PATCH:response(async event=>{const user=actor(event,true);return service.updateSubscription(user,event.params?.id,await readJson(event.request));}),DELETE:response(event=>service.cancelSubscription(actor(event,true),event.params?.id,event.url.searchParams.get('immediately')==='true')),PUT:response(event=>service.resumeSubscription(actor(event,true),event.params?.id))}
  };
}
