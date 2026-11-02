import {catalogProducts} from './catalog-products.ts';
export function restoredCart(value:unknown){
 const empty={items:[],promoCode:null,promoDiscount:0};
 if(!value||typeof value!=='object'||!Array.isArray((value as {items?:unknown}).items))return empty;
 const items:{id:number;name:string;price:number;quantity:number;image:string;description?:string;variant?:string;color?:string;originalPrice?:number}[]=[];
 for(const raw of (value as {items:unknown[]}).items.slice(0,32)){
  if(!raw||typeof raw!=='object')continue;
  const input=raw as Record<string,unknown>,product=catalogProducts.find(p=>String(p.id)===String(input.id));
  if(!product||!Number.isInteger(input.quantity)||(input.quantity as number)<1||(input.quantity as number)>99)continue;
  const variant=input.variant==='commercial'?'commercial':input.variant==='personal'?'personal':undefined;
  const color=typeof input.color==='string'&&product.colors?.includes(input.color)?input.color:undefined;
  const prior=items.find(x=>x.id===product.id&&x.variant===variant&&x.color===color);
  if(prior){prior.quantity=Math.min(99,prior.quantity+(input.quantity as number));continue;}
  items.push({id:product.id,name:product.name,price:product.price,quantity:input.quantity as number,image:product.image,description:product.description,originalPrice:product.originalPrice,variant,color});
 }
 return {items,promoCode:null,promoDiscount:0};
}
