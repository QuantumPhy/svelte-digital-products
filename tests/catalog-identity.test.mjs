import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogProducts,catalogProduct} from '../src/lib/catalog-products.ts';
test('each supplied listing identity resolves its actual distinct name, price and image',()=>{
 assert.equal(catalogProducts.length,12);assert.equal(new Set(catalogProducts.map(x=>x.name)).size,12);
 for(const record of catalogProducts){assert.equal(catalogProduct(String(record.id)),record);assert.ok(record.price>0);assert.match(record.image,/^https:\/\//);}
});
test('unknown or non-canonical identities never fall back to the showcased product',()=>{
 for(const id of ['', '0','01','1x','999','../1','NaN'])assert.equal(catalogProduct(id),undefined);
});
