import assert from 'node:assert/strict';
import {test} from 'node:test';
import {navigationTarget} from '../src/lib/template-navigation.ts';
const base='/previews/sample';
test('canonical and already based routes receive the prefix exactly once',()=>{
 for(const href of ['/about',base+'/about'])assert.deepEqual(navigationTarget(href,base),{kind:'internal',path:'/about'});
 assert.deepEqual(navigationTarget(base,base),{kind:'internal',path:'/'});
 assert.deepEqual(navigationTarget('/about',''),{kind:'internal',path:'/about'});
 assert.deepEqual(navigationTarget('/previews/sample-other/about',base),{kind:'internal',path:'/previews/sample-other/about'});
});
test('query strings and fragments retain their bytes during normalization',()=>{
 assert.deepEqual(navigationTarget(base+'/products?category=home%20goods#prices',base),{kind:'internal',path:'/products?category=home%20goods#prices'});
 assert.deepEqual(navigationTarget(base+'?q=a%26b',base),{kind:'internal',path:'/?q=a%26b'});
 assert.deepEqual(navigationTarget('#services',base),{kind:'fragment',fragment:'services'});
});
test('external, contact and uploaded-document links are not rewritten',()=>{
 for(const href of ['https://example.com/a?path='+base,'http://example.com','mailto:hello@example.com','tel:+33123456789','blob:https://example.com/id','//example.com/a'])assert.deepEqual(navigationTarget(href,base),{kind:'external',href});
});
test('unsafe schemes and traversal cannot escape the preview namespace',()=>{
 for(const href of ['javascript:alert(1)','data:text/html,example','/../private','/%2e%2e/private','/a%2fb','/a%5cb','/a\\b','/%ZZ'])assert.deepEqual(navigationTarget(href,base),{kind:'blocked'},href);
 assert.deepEqual(navigationTarget(undefined,base),{kind:'blocked'});
});
