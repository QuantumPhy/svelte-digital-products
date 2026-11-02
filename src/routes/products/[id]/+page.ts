import {error} from '@sveltejs/kit';
import {catalogProduct} from '#lib/catalog-products.js';
import type {PageLoad} from './$types';
export const load:PageLoad=({params})=>{
 const product=catalogProduct(params.id);
 if(!product)error(404,'Sample product not found');
 return {product};
};
