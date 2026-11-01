import './register-commerce-source.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const {parseCatalog,resolveCart,paymentTotal,checkoutUrls,CommerceError}=await import('../src/lib/server/commerce-policy.ts');
const {createCommerceService}=await import('../src/lib/server/commerce-service.ts');
const {createCommerceHandlers}=await import('../src/lib/server/commerce-http.ts');
const {confirmedCheckout,cartFingerprint,pendingCheckout,canClearPurchasedCart,isPendingCheckout}=await import('../src/lib/checkout-state.ts');

const origin='https://storefront.example.invalid';
const catalogText=JSON.stringify({'shirt|||':{kind:'one-time',name:'Supplied sample shirt',unitAmount:1999},'shirt||M|navy':{kind:'one-time',name:'Supplied sample shirt, M navy',unitAmount:2499},'monthly|||':{kind:'recurring',priceId:'price_monthly',trialDays:7}});
const actor=()=>({id:'user_alice',email:'fictional@example.invalid',name:'Fictional Example'});
const sub=(owner='user_alice')=>({id:'sub_sample',status:'active',metadata:{cocodingUserId:owner},items:{data:[{id:'si_sample',price:{id:'price_monthly'},current_period_start:1,current_period_end:2}]},cancel_at_period_end:false,canceled_at:null});
function fixture(options={}){
 const calls=[];let factories=0;
 const call=(method,result)=>(...args)=>{calls.push({method,args});if(options.providerError)throw new Error('PRIVATE_PROVIDER_DETAIL');return Promise.resolve(typeof result==='function'?result(...args):structuredClone(result));};
 const sdk={
  customers:{create:call('customer.create',data=>({id:'cus_alice',metadata:data.metadata})),retrieve:call('customer.retrieve',{id:'cus_alice',metadata:{cocodingUserId:options.customerOwner??'user_alice'}})},
  checkout:{sessions:{create:call('checkout.create',{id:'cs_sample',url:'https://checkout.example.invalid/sample'}),retrieve:call('checkout.retrieve',{id:'cs_sample',status:'complete',payment_status:'paid',amount_total:3998,currency:'usd',metadata:options.noOwner?{}:{cocodingUserId:options.owner??'user_alice'}})}},
  paymentIntents:{create:call('intent.create',{id:'pi_sample',client_secret:'FICTIONAL_CLIENT_CAPABILITY'}),retrieve:call('intent.retrieve',{id:'pi_sample',status:'succeeded',amount:3998,currency:'usd',metadata:options.noOwner?{}:{cocodingUserId:options.owner??'user_alice'}})},
  prices:{retrieve:call('price.retrieve',{id:'price_monthly',active:options.inactive!==true,currency:options.currency??'usd',type:'recurring'})},
  subscriptions:{create:call('subscription.create',data=>({...sub(),metadata:data.metadata,latest_invoice:{confirmation_secret:{client_secret:'FICTIONAL_SUBSCRIPTION_CAPABILITY'}}})),retrieve:call('subscription.retrieve',sub(options.owner??'user_alice')),update:call('subscription.update',sub()),cancel:call('subscription.cancel',sub()),list:call('subscription.list',{data:[sub(),{...sub('user_bob'),id:'sub_other'}]})}
 };
 const source=()=>parseCatalog(options.missingCatalog?undefined:catalogText);
 const service=createCommerceService(()=>{factories++;return sdk;},source,()=>checkoutUrls(origin+'/mounted/'));
 const handlers=createCommerceHandlers(service,()=>source(),()=>origin);
 return {calls,service,handlers,get factories(){return factories;}};
}
function event({user=actor(),method='POST',body={items:[{id:'shirt',quantity:2}]},headers={},query='',id='sub_sample'}={}){
 const url=new URL(origin+'/api/example'+query);
 const request=new Request(url,{method,headers:{origin,'content-type':'application/json',...headers},...(['GET','DELETE','PUT'].includes(method)?{}:{body:typeof body==='string'?body:JSON.stringify(body)})});
 return {request,url,params:{id},locals:{user}};
}
const failure=status=>error=>error instanceof CommerceError&&error.status===status;

test('server catalog owns price, currency and description despite forged client fields',async()=>{
 const f=fixture();await f.service.checkout(actor(),{items:[{id:'shirt',quantity:2,price:.01,name:'Forged name',image:'https://attacker.example.invalid/pixel'}],email:'other@example.invalid',customerId:'cus_other',metadata:{cocodingUserId:'user_bob'},successUrl:'https://attacker.example.invalid/'});
 const payload=f.calls.find(c=>c.method==='checkout.create').args[0];
 assert.deepEqual(payload.line_items,[{quantity:2,price_data:{currency:'usd',product_data:{name:'Supplied sample shirt'},unit_amount:1999}}]);
 assert.equal(payload.customer,'cus_alice');assert.deepEqual(payload.metadata,{cocodingUserId:'user_alice'});assert.deepEqual(payload.payment_intent_data.metadata,{cocodingUserId:'user_alice'});assert.equal(payload.success_url,origin+'/mounted/success?session_id={CHECKOUT_SESSION_ID}');
 assert.equal(f.calls.find(c=>c.method==='customer.create').args[0].email,'fictional@example.invalid');
});
test('payment intent uses integer server minor units and ignores amount, currency and owner overrides',async()=>{
 const f=fixture();await f.service.intent(actor(),{items:[{id:'shirt',quantity:2}],amount:.01,currency:'jpy',customerId:'cus_other',metadata:{cocodingUserId:'user_bob'}});
 const payload=f.calls.find(c=>c.method==='intent.create').args[0];assert.equal(payload.amount,3998);assert.equal(payload.currency,'usd');assert.equal(payload.customer,'cus_alice');assert.deepEqual(payload.metadata,{cocodingUserId:'user_alice'});
});
test('missing, unknown and prototype-like products never reach the provider',async()=>{
 for(const items of[[],[{id:'missing',quantity:1}],[{id:'__proto__',quantity:1}],[{id:'constructor',quantity:1}],[{id:'shirt',quantity:1,size:'XXL'}],null]){
  const f=fixture();await assert.rejects(()=>f.service.checkout(actor(),{items}),failure(400));assert.equal(f.factories,0);assert.deepEqual(f.calls,[]);
 }
});
test('quantity, duplicate totals and checkout modes cannot bypass cart bounds',()=>{
 const catalog=parseCatalog(catalogText);
 for(const quantity of[0,-1,.1,100,'2',NaN,Infinity])assert.throws(()=>resolveCart([{id:'shirt',quantity}],catalog,'payment'),failure(400));
 assert.throws(()=>resolveCart([{id:'shirt',quantity:60},{id:'shirt',quantity:60}],catalog,'payment'),failure(400));
 assert.throws(()=>resolveCart([{id:'monthly',quantity:1}],catalog,'payment'),failure(400));
 assert.throws(()=>resolveCart(Array.from({length:33},()=>({id:'shirt',quantity:1})),catalog,'payment'),failure(400));
 assert.equal(paymentTotal(resolveCart([{id:'shirt',quantity:2},{id:'shirt',quantity:1,size:'M',color:'navy'}],catalog,'payment')),6497);
});
test('malformed server catalogs and unsafe return URLs fail closed',()=>{
 for(const raw of[undefined,'','[]','{}','not-json',JSON.stringify({'shirt|||':null}),JSON.stringify({'shirt|||':{kind:'one-time',name:'Sample',unitAmount:.01}})])assert.throws(()=>parseCatalog(raw),failure(501));
 for(const url of[undefined,'http://storefront.example.invalid','https://user:secret@storefront.example.invalid','https://storefront.example.invalid/?token=example'])assert.throws(()=>checkoutUrls(url),failure(501));
 assert.deepEqual(checkoutUrls(origin+'/mounted'),{success:origin+'/mounted/success',cancel:origin+'/mounted/checkout'});
});
test('every actual HTTP payment handler rejects a missing session before reading a body or obtaining a client',async()=>{
 const f=fixture();for(const[group,method]of[['checkout','POST'],['checkout','GET'],['intent','POST'],['intent','GET'],['subscriptions','POST'],['subscriptions','GET'],['subscription','GET'],['subscription','PATCH'],['subscription','DELETE'],['subscription','PUT']]){
  const e=event({user:null,method});const response=await f.handlers[group][method](e);assert.equal(response.status,401,group+' '+method);assert.equal(e.request.bodyUsed,false);
 }assert.equal(f.factories,0);assert.deepEqual(f.calls,[]);
});
test('unconfigured creation endpoints do not consume posted fields or contact a provider',async()=>{
 const f=fixture({missingCatalog:true});for(const group of['checkout','intent','subscriptions']){const e=event();const response=await f.handlers[group].POST(e);assert.equal(response.status,501);assert.equal(e.request.bodyUsed,false);}assert.equal(f.factories,0);
});
test('foreign or missing origins and non-JSON requests stop before body consumption',async()=>{
 for(const[headers,status]of[[{origin:'https://attacker.example.invalid'},403],[{origin:''},403],[{'content-type':'text/plain'},415]]){const f=fixture(),e=event({headers});assert.equal((await f.handlers.checkout.POST(e)).status,status);assert.equal(e.request.bodyUsed,false);assert.equal(f.factories,0);}
});
test('malformed and chunked oversized JSON is bounded without provider work',async()=>{
 let f=fixture();assert.equal((await f.handlers.checkout.POST(event({body:'not-json'}))).status,400);assert.equal(f.factories,0);
 let cancelled=false;const stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(40000));c.enqueue(new Uint8Array(40000));},cancel(){cancelled=true;}});
 const request=new Request(origin+'/api/checkout',{method:'POST',headers:{origin,'content-type':'application/json'},body:stream,duplex:'half'});f=fixture();assert.equal((await f.handlers.checkout.POST({request,url:new URL(request.url),locals:{user:actor()}})).status,413);assert.equal(cancelled,true);assert.equal(f.factories,0);
});
test('checkout, intent and subscription reads deny foreign or legacy owner metadata',async()=>{
 for(const kind of['checkout','intent','subscription']){const f=fixture({owner:'user_bob'});const response=await f.handlers[kind].GET(event({method:'GET',query:kind==='checkout'?'?session_id=cs_sample':kind==='intent'?'?payment_intent_id=pi_sample':''}));assert.equal(response.status,404);}
 for(const kind of['checkout','intent']){const f=fixture({noOwner:true});const response=await f.handlers[kind].GET(event({method:'GET',query:kind==='checkout'?'?session_id=cs_sample':'?payment_intent_id=pi_sample'}));assert.equal(response.status,404);}
});
test('subscription creation binds the server session customer and ignores client trials and email',async()=>{
 const f=fixture();await f.service.subscribe(actor(),{priceId:'price_monthly',email:'other@example.invalid',customerId:'cus_other',trialDays:999,name:'Other actor'});
 const payload=f.calls.find(c=>c.method==='subscription.create').args[0];assert.equal(payload.customer,'cus_alice');assert.equal(payload.trial_period_days,7);assert.deepEqual(payload.metadata,{cocodingUserId:'user_alice'});
});
test('unconfigured or inactive recurring plans cannot create customers or subscriptions',async()=>{
 let f=fixture();await assert.rejects(()=>f.service.subscribe(actor(),{priceId:'price_unlisted'}),failure(400));assert.equal(f.factories,0);
 for(const options of[{inactive:true},{currency:'jpy'}]){f=fixture(options);await assert.rejects(()=>f.service.subscribe(actor(),{priceId:'price_monthly'}),failure(400));assert.equal(f.calls.filter(c=>c.method.endsWith('.create')).length,0);}
});
test('every subscription mutation denies a different account before updating or cancelling',async()=>{
 for(const[method,body]of[['PATCH',{cancelAtPeriodEnd:true}],['PATCH',{priceId:'price_monthly'}],['DELETE',undefined],['PUT',undefined]]){const f=fixture({owner:'user_bob'}),e=event({method,body});assert.equal((await f.handlers.subscription[method](e)).status,404);assert.equal(f.calls.some(c=>['subscription.update','subscription.cancel','subscription.create'].includes(c.method)),false);}
});
test('authorized cancellation stays available when creation catalog entries are withdrawn',async()=>{
 const f=fixture({missingCatalog:true});let response=await f.handlers.subscription.DELETE(event({method:'DELETE'}));assert.equal(response.status,200);assert.equal(f.calls.at(-1).method,'subscription.update');assert.deepEqual(f.calls.at(-1).args[1],{cancel_at_period_end:true});
 response=await f.handlers.subscription.PUT(event({method:'PUT'}));assert.equal(response.status,200);assert.deepEqual(f.calls.at(-1).args[1],{cancel_at_period_end:false});
});
test('subscription listing cannot select a different customer or create one during a GET',async()=>{
 let f=fixture();assert.equal((await f.handlers.subscriptions.GET(event({method:'GET',query:'?customer_id=cus_other'}))).status,404);assert.equal(f.factories,0);
 f=fixture();assert.deepEqual(await f.service.subscriptions(actor(),null),{subscriptions:[]});assert.equal(f.factories,0);
 const own={...actor(),stripeCustomerId:'cus_alice'};const list=await f.service.subscriptions(own,'cus_alice');assert.deepEqual(list.subscriptions.map(s=>s.id),['sub_sample']);assert.equal(f.calls.some(c=>c.method==='customer.create'),false);
});
test('a stale or foreign server customer reference cannot be charged',async()=>{
 const f=fixture({customerOwner:'user_bob'});await assert.rejects(()=>f.service.intent({...actor(),stripeCustomerId:'cus_other'},{items:[{id:'shirt',quantity:1}]}),failure(404));assert.equal(f.calls.some(c=>c.method==='intent.create'),false);
});
test('concurrent requests for one account share a single owned customer creation',async()=>{
 const f=fixture(),user=actor();await Promise.all([f.service.intent(user,{items:[{id:'shirt',quantity:1}]}),f.service.intent(user,{items:[{id:'shirt',quantity:1}]})]);assert.equal(f.calls.filter(c=>c.method==='customer.create').length,1);assert.equal(user.stripeCustomerId,'cus_alice');
});
test('HTTP provider failures expose no provider details and never fabricate success',async()=>{
 const f=fixture({providerError:true});const response=await f.handlers.checkout.POST(event());assert.equal(response.status,503);const body=await response.json();assert.equal(body.success,false);assert.equal(JSON.stringify(body).includes('PRIVATE_PROVIDER_DETAIL'),false);
});
test('the storefront subscription action has a real hosted payment path without a client-secret URL',async()=>{
 const f=fixture();const result=await f.service.checkout(actor(),{mode:'subscription',priceId:'price_monthly',trialDays:999});assert.equal(result.url,'https://checkout.example.invalid/sample');
 const payload=f.calls.find(c=>c.method==='checkout.create').args[0];assert.equal(payload.mode,'subscription');assert.deepEqual(payload.line_items,[{quantity:1,price:'price_monthly'}]);assert.equal(payload.subscription_data.trial_period_days,7);assert.deepEqual(payload.subscription_data.metadata,{cocodingUserId:'user_alice'});assert.equal(f.calls.some(c=>c.method==='subscription.create'),false);
});
test('an absent, unpaid, incomplete or mismatched checkout cannot become a confirmed receipt',()=>{
 const valid={id:'cs_sample',status:'complete',paymentStatus:'paid',mode:'payment',amountTotal:39.98,currency:'usd'};
 assert.equal(confirmedCheckout(valid,'cs_sample').amount,39.98);
 for(const [change,id]of[[{},''],[{id:'cs_other'},'cs_sample'],[{paymentStatus:'unpaid'},'cs_sample'],[{status:'open'},'cs_sample'],[{amountTotal:null},'cs_sample'],[{currency:'jpy'},'cs_sample'],[{mode:'setup'},'cs_sample']])assert.throws(()=>confirmedCheckout({...valid,...change},id));
 assert.equal(confirmedCheckout({...valid,paymentStatus:'no_payment_required',mode:'subscription',amountTotal:0},'cs_sample').paymentStatus,'no_payment_required');
});
test('cart clearing requires the same paid session and unchanged captured cart, never a subscription',()=>{
 const items=[{id:'shirt',quantity:2}],stored=pendingCheckout('cs_sample',items),receipt=confirmedCheckout({id:'cs_sample',status:'complete',paymentStatus:'paid',mode:'payment',amountTotal:39.98,currency:'usd'},'cs_sample');
 assert.equal(canClearPurchasedCart(receipt,stored,items),true);
 for(const current of[[{id:'shirt',quantity:3}],[{id:'other',quantity:2}],[...items,{id:'new',quantity:1}]])assert.equal(canClearPurchasedCart(receipt,stored,current),false);
 assert.equal(canClearPurchasedCart({...receipt,id:'cs_other'},stored,items),false);assert.equal(canClearPurchasedCart({...receipt,mode:'subscription'},stored,items),false);
 for(const invalid of[null,'not-json','{}','null'])assert.equal(canClearPurchasedCart(receipt,invalid,items),false);
 assert.equal(cartFingerprint([{id:'shirt',quantity:0}]),null);
 assert.equal(isPendingCheckout(stored,'cs_sample'),true);assert.equal(isPendingCheckout(stored,'cs_other'),false);
});
