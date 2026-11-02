import {error} from '@sveltejs/kit';
import {popularArticles,supportArticle} from '#lib/support-articles.js';
export const entries=()=>popularArticles.map(({slug})=>({slug}));
export const load=({params}:{params:{slug:string}})=>{const article=supportArticle(params.slug);if(!article)error(404,'Support article not found');return {article};};
