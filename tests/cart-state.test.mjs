import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogProducts} from '../src/lib/catalog-products.ts';
import {restoredCart} from '../src/lib/cart-state.ts';
test('untrusted storage cannot invent products or replace catalog prices and labels',()=>{
 const p=catalogProducts[0];const value=restoredCart({items:[{id:p.id,name:'forged',price:0,quantity:2},{id:999,quantity:1}]});
 assert.equal(value.items.length,1);assert.equal(value.items[0].name,p.name);assert.equal(value.items[0].price,p.price);assert.equal(value.items[0].quantity,2);
});
test('invalid state and quantities stay empty, while repeated valid variants merge with a bound',()=>{
 for(const raw of [null,[],{items:[{id:1,quantity:0},{id:1,quantity:100},{id:1,quantity:1.5}]}])assert.equal(restoredCart(raw).items.length,0);
 const value=restoredCart({items:[{id:1,quantity:60,variant:'personal'},{id:1,quantity:60,variant:'personal'},{id:1,quantity:1,variant:'commercial'}]});
 assert.equal(value.items.length,2);assert.equal(value.items[0].quantity,99);assert.equal(value.items[1].variant,'commercial');
});
