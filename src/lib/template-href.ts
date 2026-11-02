import {resolve} from '$app/paths';
import {base} from '#lib/template-base.js';
import {navigationTarget} from '#lib/template-navigation.js';
export function templateHref(href:string){const target=navigationTarget(href,base);if(target.kind==='blocked')throw new Error('Invalid template destination');if(target.kind==='internal')return resolve(...([target.path] as Parameters<typeof resolve>));return target.kind==='external'?target.href:'#'+target.fragment;}
