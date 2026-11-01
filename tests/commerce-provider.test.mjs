import './register-commerce-source.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const virtual=(code)=>({url:'data:text/javascript,'+encodeURIComponent(code),shortCircuit:true});
let constructions=0;
const expected={customers:{},checkout:{sessions:{}},subscriptions:{},paymentIntents:{}};
globalThis.cocodingProviderConstructor=()=>{constructions++;return expected;};
registerHooks({resolve(specifier,context,next){
 if(specifier==='stripe')return virtual('export default class Stripe {constructor(){return globalThis.cocodingProviderConstructor();}}');
 if(specifier==='$app/env/private')return virtual('export const STRIPE_SECRET_KEY="FICTIONAL_PROVIDER_FIXTURE";');
 return next(specifier,context);
}});
process.env.STRIPE_SECRET_KEY='FICTIONAL_PROVIDER_FIXTURE';
const {default:provider}=await import('../src/lib/server/commerce-provider.ts');
test('the actual template client convention remains lazy and provides a cached usable SDK client',()=>{
 assert.equal(constructions,0);const first=provider();assert.equal(first.customers,expected.customers);assert.equal(provider().checkout,expected.checkout);assert.equal(constructions,1);
});
