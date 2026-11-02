import {checkoutCopy} from './commerce-copy.js';
export class CheckoutStatusError extends Error {}
export function confirmedCheckout(value: unknown, expectedId: string) {
  if(!value||typeof value!=='object')throw new CheckoutStatusError(checkoutCopy.unavailable);
  const data=value as Record<string,unknown>;
  if(!expectedId||data.id!==expectedId||data.status!=='complete'||!['paid','no_payment_required'].includes(String(data.paymentStatus)))throw new CheckoutStatusError(checkoutCopy.unconfirmed);
  if(!['payment','subscription'].includes(String(data.mode))||data.currency!=='usd'||typeof data.amountTotal!=='number'||!Number.isFinite(data.amountTotal)||data.amountTotal<0)throw new CheckoutStatusError(checkoutCopy.unavailable);
  return {id:expectedId,mode:data.mode as 'payment'|'subscription',paymentStatus:data.paymentStatus as 'paid'|'no_payment_required',amount:data.amountTotal,currency:'USD'};
}
export function cartFingerprint(value: unknown): string | null {
  if(!Array.isArray(value)||value.length>32)return null;
  const rows=[];
  for(const item of value){
    if(!item||typeof item!=='object'||!(typeof item.id==='string'||typeof item.id==='number')||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>99)return null;
    const fields=[String(item.id),item.variant??'',item.size??'',item.color??''];
    if(fields.some(field=>typeof field!=='string'||field.length>128))return null;
    rows.push([...fields,item.quantity]);
  }
  return JSON.stringify(rows.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
}
export function pendingCheckoutKey(base:string){return 'cocoding:pending-checkout:'+base;}
export function pendingCheckout(id:unknown,items:unknown):string|null {
  const fingerprint=cartFingerprint(items);
  return typeof id==='string'&&id.length>0&&id.length<=200&&fingerprint?JSON.stringify({id,fingerprint}):null;
}
export function canClearPurchasedCart(receipt:ReturnType<typeof confirmedCheckout>,stored:unknown,items:unknown):boolean {
  if(receipt.mode!=='payment'||typeof stored!=='string')return false;
  try{const pending=JSON.parse(stored);return pending.id===receipt.id&&typeof pending.fingerprint==='string'&&cartFingerprint(items)===pending.fingerprint;}catch{return false;}
}
export function isPendingCheckout(stored:unknown,id:string):boolean {
  if(typeof stored!=='string')return false;
  try{return JSON.parse(stored)?.id===id;}catch{return false;}
}
